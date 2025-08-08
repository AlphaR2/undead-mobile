import { useMWA } from "@/context/mwa";
import {
  getMWAConnection,
  useMWAAnchorAdapter,
} from "@/context/mwa/AnchorAdapter";
import { useDynamic } from "@/context/wallet";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PROGRAM_ID, PROGRAM_IDL, authority } from "../config/program";

// Import the TypeScript program type if available
// If you have target/types/rust_undead.ts, use this:
// import { RustUndead as RustUndeadProgram } from "../target/types/rust_undead";
// type UndeadProgram = Program<RustUndeadProgram>;

// For now, using generic Program type
type UndeadProgram = Program<any>;

interface WalletInfo {
  publicKey: PublicKey | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  address: string | null;
  walletType: "dynamic_embedded" | "mwa" | null;
  name: string;
  isLoading: boolean;
  connection: Connection | null;
}

// ===============================================================================
// TRANSACTION DEDUPLICATION SYSTEM
// ===============================================================================
const pendingTransactions = new Set<string>();

const useTransactionDeduplication = () => {
  const executeWithDeduplication = useCallback(
    async <T>(
      transactionFn: () => Promise<T>,
      operationKey: string,
      timeout: number = 15000
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
        setTimeout(() => {
          pendingTransactions.delete(operationKey);
          console.log(`[TX] Cleaned up: ${operationKey}`);
        }, timeout);
      }
    },
    []
  );

  return { executeWithDeduplication };
};

// ===============================================================================
// UNIFIED WALLET STATE MANAGEMENT
// ===============================================================================
export const useWalletInfo = (): WalletInfo => {
  const dynamic = useDynamic();
  const mwa = useMWA();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const dynamicWalletAddress = dynamic.wallets?.primary?.address;

  useEffect(() => {
    const setupConnection = async () => {
      setIsLoading(true);

      try {
        let conn: Connection | null = null;

        if (mwa.isConnected && mwa.wallet) {
          console.log("🔗 [Unified] Setting up MWA connection...");
          conn = getMWAConnection("devnet");
        } else if (dynamic.wallets?.primary && dynamic.sdk.loaded) {
          console.log("🔗 [Unified] Setting up Dynamic connection...");
          try {
            conn = dynamic.solana.getConnection();
          } catch (error) {
            console.error("❌ [Unified] Dynamic connection failed:", error);
            conn = new Connection("https://api.devnet.solana.com", "confirmed");
          }
        } else {
          conn = new Connection("https://api.devnet.solana.com", "confirmed");
        }

        setConnection(conn);

        if (conn) {
          console.log(
            `✅ [Unified] Connection established: ${conn.rpcEndpoint}`
          );
        }
      } catch (error) {
        console.error("❌ [Unified] Connection setup failed:", error);
        setConnection(
          new Connection("https://api.devnet.solana.com", "confirmed")
        );
      } finally {
        setIsLoading(false);
      }
    };

    setupConnection();
  }, [
    mwa.isConnected,
    mwa.wallet?.address,
    dynamicWalletAddress,
    dynamic.sdk.loaded,
  ]);

  return useMemo(() => {
    console.log("🔍 [WalletInfo Debug]", {
      mwaConnected: mwa.isConnected,
      mwaWallet: !!mwa.wallet,
      mwaAddress: mwa.wallet?.address,
      dynamicLoaded: dynamic.sdk.loaded,
      dynamicWallet: !!dynamic.wallets?.primary,
      dynamicAddress: dynamicWalletAddress,
      dynamicAuth: !!dynamic.auth.authenticatedUser,
      isLoading,
    });

    // Check MWA wallet first (higher priority)
    if (mwa.isConnected && mwa.wallet) {
      console.log("✅ [WalletInfo] Using MWA wallet");
      return {
        publicKey: mwa.wallet.publicKey,
        isConnected: true,
        isAuthenticated: true,
        address: mwa.wallet.address,
        walletType: "mwa",
        name: `MWA Wallet (${mwa.wallet.label || "Solana"})`,
        isLoading: false,
        connection,
      };
    }

    // Check Dynamic wallet (embedded only)
    if (
      dynamic.sdk.loaded &&
      dynamic.wallets?.primary &&
      dynamic.auth.authenticatedUser
    ) {
      const primaryWallet = dynamic.wallets.primary;

      console.log("✅ [WalletInfo] Using Dynamic embedded wallet");

      let publicKey: PublicKey | null = null;
      try {
        publicKey = new PublicKey(primaryWallet.address);
      } catch (error) {
        console.error("❌ [Unified] Invalid Dynamic PublicKey:", error);
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
        isAuthenticated: !!dynamic.auth.authenticatedUser,
        address: primaryWallet.address,
        walletType: "dynamic_embedded",
        name: "Dynamic Embedded Wallet",
        isLoading,
        connection,
      };
    }

    // Still loading
    if (isLoading || !dynamic.sdk.loaded || mwa.isCheckingWallets) {
      console.log("⏳ [WalletInfo] Still loading wallets...");
      return {
        publicKey: null,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: null,
        name: "Loading wallets...",
        isLoading: true,
        connection: null,
      };
    }

    // No wallet connected
    console.log("❌ [WalletInfo] No wallet connected");
    return {
      publicKey: null,
      isConnected: false,
      isAuthenticated: false,
      address: null,
      walletType: null,
      name: "No wallet connected",
      isLoading: false,
      connection: null,
    };
  }, [
    mwa.isConnected,
    mwa.wallet?.address,
    mwa.wallet?.publicKey,
    mwa.wallet?.label,
    mwa.isCheckingWallets,
    dynamic.sdk.loaded,
    dynamicWalletAddress,
    dynamic.auth.authenticatedUser,
    connection,
    isLoading,
  ]);
};

// ===============================================================================
// COMPLETE FIXED PROGRAM HOOK FOLLOWING SOLANA DOCS PATTERN
// ===============================================================================
export const useUndeadProgram = (): {
  program: UndeadProgram | null;
  isReady: boolean;
  error: string | null;
} => {
  const dynamic = useDynamic();
  const mwa = useMWA();
  const mwaAnchorAdapter = useMWAAnchorAdapter();
  const { publicKey, isConnected, connection, isLoading, walletType } =
    useWalletInfo();
  const { executeWithDeduplication } = useTransactionDeduplication();

  // Create AnchorProvider following Solana docs pattern
  const provider = useMemo(() => {
    if (isLoading || !isConnected || !publicKey || !connection) {
      return null;
    }

    let walletAdapter: any;

    try {
      if (walletType === "mwa" && mwaAnchorAdapter) {
        console.log("🔗 [Program] Using MWA wallet adapter");

        if (!mwaAnchorAdapter.publicKey) {
          throw new Error("MWA adapter missing publicKey");
        }
        if (typeof mwaAnchorAdapter.signTransaction !== "function") {
          throw new Error("MWA adapter missing signTransaction method");
        }

        walletAdapter = mwaAnchorAdapter;
      } else if (
        walletType === "dynamic_embedded" &&
        dynamic.wallets?.primary
      ) {
        console.log("🔗 [Program] Using Dynamic embedded wallet adapter");

        const wallet = dynamic.wallets.primary;
        walletAdapter = {
          publicKey,
          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            const operationKey = `sign_${publicKey.toString()}_${Date.now()}`;
            return executeWithDeduplication(async () => {
              const signer = await dynamic.solana.getSigner({ wallet });
              return await signer.signTransaction(tx);
            }, operationKey);
          },
          signAllTransactions: async (
            txs: (Transaction | VersionedTransaction)[]
          ) => {
            const operationKey = `sign_all_${publicKey.toString()}_${Date.now()}`;
            return executeWithDeduplication(async () => {
              const signer = await dynamic.solana.getSigner({ wallet });
              const signedTxs = [];
              for (const tx of txs) {
                const signedTx = await signer.signTransaction(tx);
                signedTxs.push(signedTx);
              }
              return signedTxs;
            }, operationKey);
          },
        };
      } else {
        console.warn(`⚠️ [Program] Unsupported wallet type: ${walletType}`);
        return null;
      }

      if (!walletAdapter) {
        console.error("❌ [Program] Failed to create wallet adapter");
        return null;
      }

      // Create AnchorProvider
      const anchorProvider = new AnchorProvider(connection, walletAdapter, {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
        skipPreflight: false,
      });

      console.log("✅ [Program] AnchorProvider created successfully");
      return anchorProvider;
    } catch (error) {
      console.error("❌ [Program] Provider creation failed:", error);
      return null;
    }
  }, [
    isLoading,
    isConnected,
    publicKey?.toString(),
    connection?.rpcEndpoint,
    walletType,
    mwaAnchorAdapter,
    dynamic.wallets?.primary?.address,
    executeWithDeduplication,
  ]);

  // Create Program instance following Solana docs pattern
  const undeadProgram = useMemo(() => {
    if (!provider) {
      return null;
    }

    try {
      console.log("🔧 [Program] Creating program instance...");
      console.log("🔍 [Program] Program Details:", {
        programId: PROGRAM_ID?.toString(),
        idlExists: !!PROGRAM_IDL,
        idlVersion: (PROGRAM_IDL as any)?.version,
        idlName: (PROGRAM_IDL as any)?.name,
      });

      if (!PROGRAM_IDL) {
        throw new Error("PROGRAM_IDL is not defined");
      }

      if (!PROGRAM_ID) {
        throw new Error("PROGRAM_ID is not defined");
      }

      // Log IDL structure for debugging
      const types = (PROGRAM_IDL as any).types || [];
      console.log("🔍 [Program] IDL Analysis:", {
        totalTypes: types.length,
        hasWarriorClass: types.some((t: any) => t.name === "warriorClass"),
        hasUserPersona: types.some((t: any) => t.name === "userPersona"),
        typeNames: types.map((t: any) => t.name),
      });

      // Create Program instance following Solana docs pattern
      const program = new Program(
        PROGRAM_IDL as any, // Cast to any to handle TypeScript issues
        PROGRAM_ID,
        provider
      ) as UndeadProgram;

      console.log("✅ [Program] Program instance created successfully:", {
        programId: program.programId.toString(),
        wallet: provider.wallet.publicKey.toString(),
        endpoint: provider.connection.rpcEndpoint,
      });

      return program;
    } catch (error: any) {
      console.error("❌ [Program] Program creation failed:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });

      // Return null instead of throwing to let the hook handle the error state
      return null;
    }
  }, [provider]);

  // Determine ready state and error
  const isReady = useMemo(() => {
    return !!undeadProgram && !!provider;
  }, [undeadProgram, provider]);

  const error = useMemo(() => {
    if (isLoading) return null;
    if (!isConnected) return "Wallet not connected";
    if (!provider) return "Failed to create provider";
    if (!undeadProgram) return "Failed to create program instance";
    return null;
  }, [isLoading, isConnected, provider, undeadProgram]);

  // Log state changes for debugging
  useEffect(() => {
    console.log("🔍 [Program] State Update:", {
      isReady,
      error,
      hasProgram: !!undeadProgram,
      hasProvider: !!provider,
      walletType,
      isConnected,
    });
  }, [isReady, error, undeadProgram, provider, walletType, isConnected]);

  return {
    program: undeadProgram,
    isReady,
    error,
  };
};

// ===============================================================================
// PDA UTILITIES (unchanged)
// ===============================================================================
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

// ===============================================================================
// UTILITY HOOKS (unchanged)
// ===============================================================================
export const useWalletAndProgramReady = () => {
  const { publicKey, isConnected } = useWalletInfo();
  const { program, isReady } = useUndeadProgram();

  return useMemo(() => {
    const walletReady = isConnected && publicKey;
    const programReady = isReady && program?.programId;
    const bothReady = walletReady && programReady;

    return {
      walletReady,
      programReady,
      bothReady,
      publicKey,
      program,
    };
  }, [isConnected, publicKey, isReady, program?.programId]);
};

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
        isMWA: false,
      };
    }

    const shortAddress = `${walletInfo.address!.slice(0, 4)}...${walletInfo.address!.slice(-4)}`;
    const isEmbedded = walletInfo.walletType === "dynamic_embedded";
    const isMWA = walletInfo.walletType === "mwa";

    return {
      address: walletInfo.address,
      shortAddress,
      type: walletInfo.walletType,
      name: walletInfo.name,
      isConnected: true,
      isEmbedded,
      isMWA,
    };
  }, [walletInfo]);
};
