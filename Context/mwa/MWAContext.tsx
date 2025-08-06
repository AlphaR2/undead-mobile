import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface MWAWalletInfo {
  address: string;
  publicKey: PublicKey;
  authToken?: string;
  label?: string;
}

export interface MWAContextState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  wallet: MWAWalletInfo | null;
  
  // Wallet discovery
  hasWalletsInstalled: boolean;
  isCheckingWallets: boolean;
  
  // Error handling
  error: string | null;
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
  signAndSendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  
  // Utility
  checkWalletsAvailable: () => Promise<boolean>;
  clearError: () => void;
}

const MWAContext = createContext<MWAContextState | undefined>(undefined);

// App Identity for MWA
export const APP_IDENTITY = {
  name: 'Rust Undead',
  uri: 'https://rustundead.fun',
  icon: 'favicon.ico',
};

// Storage keys
const AUTH_TOKEN_KEY = '@rust_undead:mwa_auth_token';
const WALLET_INFO_KEY = '@rust_undead:mwa_wallet_info';

export const MWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wallet, setWallet] = useState<MWAWalletInfo | null>(null);
  const [hasWalletsInstalled, setHasWalletsInstalled] = useState(false);
  const [isCheckingWallets, setIsCheckingWallets] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for managing state during transactions
  const currentWalletRef = useRef<MWAWalletInfo | null>(null);
  const isTransactingRef = useRef(false);

  // Update refs when wallet changes
  useEffect(() => {
    currentWalletRef.current = wallet;
  }, [wallet]);

  // Check for available wallets on mount
  useEffect(() => {
    checkWalletsAvailable();
    loadStoredWalletInfo();
  }, []);

  // Wallet detection function
  const checkWalletsAvailable = useCallback(async (): Promise<boolean> => {
    try {
      setIsCheckingWallets(true);
      setError(null);
      
      // Try to initiate a transact session to see if any wallets respond
      const hasWallets = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 3000); // 3 second timeout
        
        transact(async (wallet: Web3MobileWallet) => {
          clearTimeout(timeout);
          // If we get here, at least one wallet is available
          resolve(true);
          // Don't actually authorize, just check availability
          throw new Error('WALLET_CHECK_COMPLETE');
        }).catch((error) => {
          clearTimeout(timeout);
          if (error.message === 'WALLET_CHECK_COMPLETE') {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
      
      setHasWalletsInstalled(hasWallets);
      console.log(`🔍 [MWA] Wallets available: ${hasWallets}`);
      
      return hasWallets;
    } catch (error) {
      console.error('❌ [MWA] Error checking wallets:', error);
      setHasWalletsInstalled(false);
      return false;
    } finally {
      setIsCheckingWallets(false);
    }
  }, []);

  // Load stored wallet info
  const loadStoredWalletInfo = useCallback(async () => {
    try {
      const storedWalletInfo = await AsyncStorage.getItem(WALLET_INFO_KEY);
      const storedAuthToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (storedWalletInfo && storedAuthToken) {
        const walletInfo = JSON.parse(storedWalletInfo);
        const walletInfoWithToken = {
          ...walletInfo,
          authToken: storedAuthToken,
          publicKey: new PublicKey(walletInfo.address),
        };
        
        setWallet(walletInfoWithToken);
        setIsConnected(true);
        
        console.log('✅ [MWA] Restored wallet session:', walletInfo.address);
      }
    } catch (error) {
      console.error('❌ [MWA] Error loading stored wallet:', error);
      // Clear invalid stored data
      await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY]);
    }
  }, []);

  // Store wallet info
  const storeWalletInfo = useCallback(async (walletInfo: MWAWalletInfo) => {
    try {
      const storableInfo = {
        address: walletInfo.address,
        label: walletInfo.label,
      };
      
      await AsyncStorage.setItem(WALLET_INFO_KEY, JSON.stringify(storableInfo));
      
      if (walletInfo.authToken) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, walletInfo.authToken);
      }
      
      console.log('💾 [MWA] Wallet info stored');
    } catch (error) {
      console.error('❌ [MWA] Error storing wallet info:', error);
    }
  }, []);

  // Clear stored wallet info
  const clearStoredWalletInfo = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY]);
      console.log('🗑️ [MWA] Stored wallet info cleared');
    } catch (error) {
      console.error('❌ [MWA] Error clearing stored wallet info:', error);
    }
  }, []);

  // Connect to MWA wallet
  const connect = useCallback(async () => {
    if (isConnecting || isTransactingRef.current) {
      console.warn('⚠️ [MWA] Connection already in progress');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      console.log('🔌 [MWA] Initiating connection...');

      const authorizationResult = await transact(async (mwaWallet: Web3MobileWallet) => {
        // Try to use stored auth token if available
        const storedAuthToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        
        const authResult = await mwaWallet.authorize({
          // cluster: "devnet", 
          identity: APP_IDENTITY,
          auth_token: storedAuthToken || undefined,
        });

        return authResult;
      });

      if (authorizationResult.accounts.length === 0) {
        throw new Error('No accounts authorized');
      }

      // Get the first account (most wallets only authorize one)
      const account = authorizationResult.accounts[0];
      
      const walletInfo: MWAWalletInfo = {
        address: account.address,
        publicKey: new PublicKey(account.address),
        authToken: authorizationResult.auth_token,
        label: account.label,
      };

      setWallet(walletInfo);
      setIsConnected(true);
      
      // Store for next session
      await storeWalletInfo(walletInfo);
      
      console.log('✅ [MWA] Connected successfully:', account.address);
      
    } catch (error: any) {
      console.error('❌ [MWA] Connection failed:', error);
      
      let errorMessage = 'Failed to connect to wallet';
      if (error.message?.includes('rejected')) {
        errorMessage = 'Connection rejected by user';
      } else if (error.message?.includes('not installed')) {
        errorMessage = 'No compatible wallets found';
      }
      
      setError(errorMessage);
      setIsConnected(false);
      setWallet(null);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, storeWalletInfo]);

  // Disconnect from MWA wallet
  const disconnect = useCallback(async () => {
    try {
      setError(null);
      console.log('🔌 [MWA] Disconnecting...');

      if (wallet?.authToken) {
        // Properly deauthorize with the wallet
        await transact(async (mwaWallet: Web3MobileWallet) => {
          await mwaWallet.deauthorize({
            auth_token: wallet.authToken!,
          });
        });
      }

      // Clear local state
      setWallet(null);
      setIsConnected(false);
      
      // Clear stored data
      await clearStoredWalletInfo();
      
      console.log('✅ [MWA] Disconnected successfully');
      
    } catch (error) {
      console.error('❌ [MWA] Disconnect error:', error);
      // Even if deauthorization fails, clear local state
      setWallet(null);
      setIsConnected(false);
      await clearStoredWalletInfo();
    }
  }, [wallet?.authToken, clearStoredWalletInfo]);

  // Sign a single transaction
  const signTransaction = useCallback(async (transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction> => {
    if (!wallet || !isConnected) {
      throw new Error('Wallet not connected');
    }

    if (isTransactingRef.current) {
      throw new Error('Another transaction is in progress');
    }

    try {
      isTransactingRef.current = true;
      setError(null);

      const signedTransaction = await transact(async (mwaWallet: Web3MobileWallet) => {
        const signedTxs = await mwaWallet.signTransactions({
          transactions: [transaction],
        });
        return signedTxs[0];
      });

      console.log('✅ [MWA] Transaction signed');
      return signedTransaction;
      
    } catch (error: any) {
      console.error('❌ [MWA] Transaction signing failed:', error);
      const errorMessage = error.message?.includes('rejected') 
        ? 'Transaction signing rejected by user'
        : 'Failed to sign transaction';
      setError(errorMessage);
      throw error;
    } finally {
      isTransactingRef.current = false;
    }
  }, [wallet, isConnected]);

  // Sign multiple transactions
  const signAllTransactions = useCallback(async (transactions: (Transaction | VersionedTransaction)[]): Promise<(Transaction | VersionedTransaction)[]> => {
    if (!wallet || !isConnected) {
      throw new Error('Wallet not connected');
    }

    if (isTransactingRef.current) {
      throw new Error('Another transaction is in progress');
    }

    try {
      isTransactingRef.current = true;
      setError(null);

      const signedTransactions = await transact(async (mwaWallet: Web3MobileWallet) => {
        return await mwaWallet.signTransactions({
          transactions,
        });
      });

      console.log(`✅ [MWA] ${transactions.length} transactions signed`);
      return signedTransactions;
      
    } catch (error: any) {
      console.error('❌ [MWA] Batch transaction signing failed:', error);
      const errorMessage = error.message?.includes('rejected') 
        ? 'Transaction signing rejected by user'
        : 'Failed to sign transactions';
      setError(errorMessage);
      throw error;
    } finally {
      isTransactingRef.current = false;
    }
  }, [wallet, isConnected]);

  // Sign and send transaction (MWA handles both)
  const signAndSendTransaction = useCallback(async (transaction: Transaction | VersionedTransaction): Promise<string> => {
    if (!wallet || !isConnected) {
      throw new Error('Wallet not connected');
    }

    if (isTransactingRef.current) {
      throw new Error('Another transaction is in progress');
    }

    try {
      isTransactingRef.current = true;
      setError(null);

      const signature = await transact(async (mwaWallet: Web3MobileWallet) => {
        const signatures = await mwaWallet.signAndSendTransactions({
          transactions: [transaction],
        });
        return signatures[0];
      });

      console.log('✅ [MWA] Transaction signed and sent:', signature);
      return signature;
      
    } catch (error: any) {
      console.error('❌ [MWA] Transaction signing/sending failed:', error);
      const errorMessage = error.message?.includes('rejected') 
        ? 'Transaction rejected by user'
        : 'Failed to send transaction';
      setError(errorMessage);
      throw error;
    } finally {
      isTransactingRef.current = false;
    }
  }, [wallet, isConnected]);

  // Sign message
  const signMessage = useCallback(async (message: Uint8Array): Promise<Uint8Array> => {
    if (!wallet || !isConnected) {
      throw new Error('Wallet not connected');
    }

    if (isTransactingRef.current) {
      throw new Error('Another transaction is in progress');
    }

    try {
      isTransactingRef.current = true;
      setError(null);

      const signedMessage = await transact(async (mwaWallet: Web3MobileWallet) => {
        const signatures = await mwaWallet.signMessages({
          addresses: [wallet.address],
          payloads: [message],
        });
        return signatures[0];
      });

      console.log('✅ [MWA] Message signed');
      return signedMessage;
      
    } catch (error: any) {
      console.error('❌ [MWA] Message signing failed:', error);
      const errorMessage = error.message?.includes('rejected') 
        ? 'Message signing rejected by user'
        : 'Failed to sign message';
      setError(errorMessage);
      throw error;
    } finally {
      isTransactingRef.current = false;
    }
  }, [wallet, isConnected]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: MWAContextState = {
    // State
    isConnected,
    isConnecting,
    wallet,
    hasWalletsInstalled,
    isCheckingWallets,
    error,
    
    // Methods
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    signAndSendTransaction,
    signMessage,
    checkWalletsAvailable,
    clearError,
  };

  return (
    <MWAContext.Provider value={contextValue}>
      {children}
    </MWAContext.Provider>
  );
};

// Hook to use MWA context
export const useMWA = (): MWAContextState => {
  const context = useContext(MWAContext);
  if (context === undefined) {
    throw new Error('useMWA must be used within a MWAProvider');
  }
  return context;
};

// Utility hook for wallet detection
export const useMWAWalletDetection = () => {
  const { hasWalletsInstalled, isCheckingWallets, checkWalletsAvailable } = useMWA();
  
  return {
    hasWalletsInstalled,
    isCheckingWallets,
    recheckWallets: checkWalletsAvailable,
  };
};