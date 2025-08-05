import { RustUndead as UndeadTypes } from "@/types/idlTypes";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { ISolana, isSolanaWallet } from "@dynamic-labs/solana-core";
import { GetCommitmentSignature } from "@magicblock-labs/ephemeral-rollups-sdk";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PROGRAM_ID, PROGRAM_IDL, authority } from "../config/program";

type UndeadProgram = Program<UndeadTypes>;

// ===============================================================================
// TYPES & INTERFACES
// ===============================================================================

interface WalletInfo {
  publicKey: PublicKey | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  address: string | null;
  walletType: "dynamic_embedded" | "dynamic_external" | null;
  name: string;
  isLoading: boolean;
  connection: Connection | null;
}

// ===============================================================================
// TRANSACTION DEDUPLICATION SYSTEM
// ===============================================================================

/**
 * Prevents duplicate transactions from being submitted simultaneously.
 * Critical for mobile apps where users might tap buttons multiple times.
 */
const pendingTransactions = new Set<string>();

const useTransactionDeduplication = () => {
  const executeWithDeduplication = useCallback(
    async <T>(
      transactionFn: () => Promise<T>,
      operationKey: string,
      timeout: number = 15000 // 15s timeout for mobile
    ): Promise<T> => {
      if (pendingTransactions.has(operationKey)) {
        console.warn(`Duplicate transaction blocked: ${operationKey}`);
        throw new Error("Transaction already in progress");
      }

      pendingTransactions.add(operationKey);

      try {
        console.log(`[TX] Starting: ${operationKey}`);
        const result = await transactionFn();
        console.log(`[TX] Completed: ${operationKey}`);
        return result;
      } catch (error) {
        console.error(`[TX] Failed: ${operationKey}`, error);
        throw error;
      } finally {
        // Auto-cleanup after timeout
        setTimeout(() => {
          pendingTransactions.delete(operationKey);
          console.log(` [TX] Cleaned up: ${operationKey}`);
        }, timeout);
      }
    },
    []
  );

  return { executeWithDeduplication };
};

// ===============================================================================
// DYNAMIC WALLET STATE MANAGEMENT
// ===============================================================================

/**
 * Simplified wallet info hook using Dynamic's unified API.
 */
export const useWalletInfo = (): WalletInfo => {
  const { primaryWallet, sdkHasLoaded } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle connection setup when wallet becomes available
  useEffect(() => {
    const setupConnection = async () => {
      if (!sdkHasLoaded || !primaryWallet || !isSolanaWallet(primaryWallet)) {
        setConnection(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const walletConnection = await primaryWallet.getConnection();
        setConnection(walletConnection);
        console.log(
          `🔗 [Dynamic] Connection established: ${walletConnection.rpcEndpoint}`
        );
      } catch (error) {
        console.error("❌ [Dynamic] Connection setup failed:", error);
        setConnection(null);
      } finally {
        setIsLoading(false);
      }
    };

    setupConnection();
  }, [sdkHasLoaded, primaryWallet?.address, isLoggedIn]);

  return useMemo(() => {
    // SDK still loading
    if (!sdkHasLoaded) {
      return {
        publicKey: null,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: null,
        name: "Loading Dynamic SDK...",
        isLoading: true,
        connection: null,
      };
    }

    // No wallet connected
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      return {
        publicKey: null,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: null,
        name: "No Solana wallet connected",
        isLoading: false,
        connection: null,
      };
    }

    // Determine wallet type based on Dynamic's connector
    const isEmbedded =
      primaryWallet.connector?.key === "dynamicwaas" ||
      primaryWallet.connector?.name?.toLowerCase().includes("embedded");

    const walletType = isEmbedded ? "dynamic_embedded" : "dynamic_external";
    const walletName = isEmbedded
      ? "Dynamic Embedded Wallet"
      : `${primaryWallet.connector?.name || "External"} (via Dynamic)`;

    // Create PublicKey from address
    let publicKey: PublicKey | null = null;
    try {
      publicKey = new PublicKey(primaryWallet.address);
    } catch (error) {
      console.error("❌ [Dynamic] Invalid PublicKey:", error);
      return {
        publicKey: null,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: null,
        name: "Invalid wallet address",
        isLoading: false,
        connection: null,
      };
    }

    return {
      publicKey,
      isConnected: true,
      isAuthenticated: isLoggedIn,
      address: primaryWallet.address,
      walletType,
      name: walletName,
      isLoading,
      connection,
    };
  }, [
    sdkHasLoaded,
    primaryWallet?.address,
    primaryWallet?.connector?.key,
    primaryWallet?.connector?.name,
    isLoggedIn,
    connection,
    isLoading,
  ]);
};

// ===============================================================================
// UNDEAD PROGRAM INTEGRATION
// ===============================================================================

/**
 * Enhanced Undead Program hook built specifically for Dynamic wallets.
 * Handles Anchor program initialization with proper async connection management.
 */
export const useUndeadProgram = (): {
  program: UndeadProgram | null;
  isReady: boolean;
  error: string | null;
} => {
  const { primaryWallet, sdkHasLoaded } = useDynamicContext();
  const { publicKey, isConnected, connection, isLoading } = useWalletInfo();
  const { executeWithDeduplication } = useTransactionDeduplication();

  const [program, setProgram] = useState<UndeadProgram | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize program when wallet and connection are ready
  useEffect(() => {
    const initializeProgram = async () => {
      if (
        !sdkHasLoaded ||
        isLoading ||
        !isConnected ||
        !publicKey ||
        !connection ||
        !primaryWallet
      ) {
        setProgram(null);
        setIsReady(false);
        return;
      }

      if (!isSolanaWallet(primaryWallet)) {
        setError("Primary wallet is not a Solana wallet");
        setProgram(null);
        setIsReady(false);
        return;
      }

      try {
        setError(null);
        console.log("🔧 [Program] Initializing Undead Program...");

        // Create wallet adapter for Anchor using Dynamic's ISolana interface
        const walletAdapter = {
          publicKey,

          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            const operationKey = `sign_${publicKey.toString()}_${Date.now()}`;

            return executeWithDeduplication(async () => {
              const signer: ISolana = await primaryWallet.getSigner();
              console.log(
                "🔐 [Program] Signing transaction with Dynamic wallet..."
              );
              return await signer.signTransaction(tx);
            }, operationKey);
          },

          signAllTransactions: async (
            txs: (Transaction | VersionedTransaction)[]
          ) => {
            const operationKey = `sign_all_${publicKey.toString()}_${Date.now()}`;

            return executeWithDeduplication(async () => {
              const signer: ISolana = await primaryWallet.getSigner();
              console.log(
                `🔐 [Program] Signing ${txs.length} transactions with Dynamic wallet...`
              );

              const signedTxs = [];
              for (const tx of txs) {
                const signedTx = await signer.signTransaction(tx);
                signedTxs.push(signedTx);
              }
              return signedTxs;
            }, operationKey);
          },
        };

        // Create Anchor provider
        const provider = new AnchorProvider(connection, walletAdapter as any, {
          commitment: "confirmed",
          preflightCommitment: "confirmed",
          skipPreflight: false,
        });

        // Initialize program
        const idl = PROGRAM_IDL as UndeadTypes;
        const programInstance = new Program(idl, provider) as UndeadProgram;

        setProgram(programInstance);
        setIsReady(true);

        console.log("✅ [Program] Undead Program initialized successfully:", {
          programId: programInstance.programId.toString(),
          wallet: publicKey.toString(),
          endpoint: connection.rpcEndpoint,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.error("❌ [Program] Initialization failed:", error);
        setError(errorMsg);
        setProgram(null);
        setIsReady(false);
      }
    };

    initializeProgram();
  }, [
    sdkHasLoaded,
    isLoading,
    isConnected,
    publicKey?.toString(),
    connection?.rpcEndpoint,
    primaryWallet?.address,
    executeWithDeduplication,
  ]);

  return { program, isReady, error };
};

// ============ WALLET READINESS HELPER HOOK ============
export const useWalletAndProgramReady = () => {
  const { publicKey, isConnected } = useWalletInfo();
  const program = useUndeadProgram();

  return useMemo(() => {
    const walletReady = isConnected && publicKey;
    const programReady = program && program.program?.programId;
    const bothReady = walletReady && programReady;

    return {
      walletReady,
      programReady,
      bothReady,
      publicKey,
      program,
    };
  }, [isConnected, publicKey, program?.program?.programId]);
};

// ============ PDA UTILITIES ============
export const usePDAs = (userPublicKey?: PublicKey | null) => {
  return useMemo(() => {
    if (!userPublicKey) {
      return {
        configPda: null,
        leaderboardPda: null,
        profilePda: null,
        achievementsPda: null,
        getWarriorPda: null,
        getUsernameRegistryPda: null,
      };
    }

    try {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config"), authority.toBuffer()],
        PROGRAM_ID
      );

      const [leaderboardPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("leaderboard"), authority.toBuffer()],
        PROGRAM_ID
      );

      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), userPublicKey.toBuffer()],
        PROGRAM_ID
      );

      const [achievementsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_achievements"), userPublicKey.toBuffer()],
        PROGRAM_ID
      );

      const getWarriorPda = (name: string) => {
        if (!name || name.trim().length === 0) {
          throw new Error("Warrior name cannot be empty");
        }

        const [warriorPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("undead_warrior"),
            userPublicKey.toBuffer(),
            Buffer.from(name.trim()),
          ],
          PROGRAM_ID
        );
        return warriorPda;
      };

      const getUsernameRegistryPda = (username: string) => {
        if (!username || username.trim().length === 0) {
          throw new Error("Username cannot be empty");
        }

        const [userNameRegistryPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_registry"), Buffer.from(username)],
          PROGRAM_ID
        );
        return userNameRegistryPda;
      };

      return {
        configPda,
        leaderboardPda,
        profilePda,
        achievementsPda,
        getWarriorPda,
        getUsernameRegistryPda,
      };
    } catch (error) {
      console.error("Error generating PDAs:", error);
      return {
        configPda: null,
        leaderboardPda: null,
        profilePda: null,
        achievementsPda: null,
        getWarriorPda: null,
        getUsernameRegistryPda: null,
      };
    }
  }, [userPublicKey?.toString()]);
};

// ============ CURRENT WALLET HELPER ============
export const useCurrentWallet = () => {
  const walletInfo = useWalletInfo();

  return useMemo(() => {
    if (!walletInfo.isConnected || !walletInfo.publicKey) {
      return {
        address: null,
        shortAddress: null,
        type: null,
        name: null,
        isConnected: false,
        isEmbedded: false,
      };
    }

    // Create shortened address for UI display
    const shortAddress = `${walletInfo.address!.slice(0, 4)}...${walletInfo.address!.slice(-4)}`;
    const isEmbedded = walletInfo.walletType === "dynamic_embedded";

    return {
      address: walletInfo.address,
      shortAddress,
      type: walletInfo.walletType,
      name: walletInfo.name,
      isConnected: true,
      isEmbedded,
    };
  }, [walletInfo]);
};

// ============ MAGICBLOCK ER CONNECTION SETUP ============
let magicBlockConnectionCache: Connection | null = null;
const createMagicBlockConnection = () => {
  if (!magicBlockConnectionCache) {
    magicBlockConnectionCache = new Connection(
      process.env.NEXT_PUBLIC_ER_PROVIDER_ENDPOINT ||
        "https://devnet.magicblock.app/",
      {
        wsEndpoint:
          process.env.NEXT_PUBLIC_ER_WS_ENDPOINT ||
          "wss://devnet.magicblock.app/",
        commitment: "confirmed",
      }
    );
  }
  return magicBlockConnectionCache;
};

export const useMagicBlockProvider = (): AnchorProvider | null => {
  const { primaryWallet, sdkHasLoaded } = useDynamicContext();
  const { publicKey, isConnected } = useWalletInfo();
  const { executeWithDeduplication } = useTransactionDeduplication();

  const providerRef = useRef<AnchorProvider | null>(null);
  const lastConfigRef = useRef<string>("");

  return useMemo(() => {
    if (!sdkHasLoaded || !isConnected || !publicKey || !primaryWallet) {
      return null;
    }

    if (!isSolanaWallet(primaryWallet)) {
      return null;
    }

    // Create cache key for this configuration
    const currentConfig = `${publicKey.toString()}_${primaryWallet.address}`;

    // Return cached provider if configuration hasn't changed
    if (providerRef.current && lastConfigRef.current === currentConfig) {
      return providerRef.current;
    }

    try {
      // Create wallet adapter for MagicBlock
      const walletAdapter = {
        publicKey,
        signTransaction: async (tx: Transaction | VersionedTransaction) => {
          const operationKey = `magicblock_sign_${publicKey.toString()}_${Date.now()}`;

          return executeWithDeduplication(async () => {
            const signer: ISolana = await primaryWallet.getSigner();
            console.log("🔐 [MagicBlock] Signing transaction...");
            return await signer.signTransaction(tx);
          }, operationKey);
        },
      };

      const magicBlockConnection = createMagicBlockConnection();
      const provider = new AnchorProvider(
        magicBlockConnection,
        walletAdapter as any,
        {
          commitment: "confirmed",
          preflightCommitment: "confirmed",
          skipPreflight: false,
        }
      );

      // Cache the provider
      providerRef.current = provider;
      lastConfigRef.current = currentConfig;

      console.log("✅ [MagicBlock] Provider created successfully");
      return provider;
    } catch (error) {
      console.error("❌ [MagicBlock] Provider creation failed:", error);
      return null;
    }
  }, [
    sdkHasLoaded,
    isConnected,
    publicKey?.toString(),
    primaryWallet?.address,
    executeWithDeduplication,
  ]);
};

// ============ EPHEMERAL ROLLUP TRANSACTION HANDLING ============
export async function sendERTransaction(
  program: any,
  methodBuilder: any,
  signer: PublicKey,
  provider: AnchorProvider | any,
  description: string
): Promise<string> {
  try {
    let tx = await methodBuilder.transaction();

    tx.feePayer = provider.wallet.publicKey;
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;

    tx = await provider.wallet.signTransaction(tx);

    const rawTx = tx.serialize();
    const txHash = await provider.connection.sendRawTransaction(rawTx);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const txCommitSgn = await GetCommitmentSignature(
        txHash,
        provider.connection
      );

      return txCommitSgn;
    } catch (commitError: any) {
      return txHash;
    }
  } catch (error: any) {
    console.error(`❌ [ER] ${description} failed:`, error);
    throw error;
  }
}

export const useEphemeralProgram = (
  erProgramId?: PublicKey
): UndeadProgram | null => {
  const magicBlockProvider = useMagicBlockProvider();

  return useMemo(() => {
    if (!magicBlockProvider || !erProgramId) {
      return null;
    }

    try {
      const idl = PROGRAM_IDL as UndeadTypes;

      const ephemeralProgram = new Program(
        idl,
        magicBlockProvider
      ) as UndeadProgram;

      return ephemeralProgram;
    } catch (error) {
      console.error("❌ Error creating ephemeral program instance:", error);
      return null;
    }
  }, [magicBlockProvider, erProgramId?.toString()]);
};

export const createEphemeralProgram = (
  erProgramId: PublicKey,
  wallet: any
): UndeadProgram => {
  const magicBlockConnection = createMagicBlockConnection();
  const provider = new AnchorProvider(magicBlockConnection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
    skipPreflight: false,
  });

  const idl = PROGRAM_IDL as UndeadTypes;
  const ephemeralProgram = new Program(idl, provider) as UndeadProgram;

  return ephemeralProgram;
};

export const createERProvider = (wallet: any): AnchorProvider => {
  const magicBlockConnection = createMagicBlockConnection();
  const provider = new AnchorProvider(magicBlockConnection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
    skipPreflight: false,
  });

  return provider;
};
