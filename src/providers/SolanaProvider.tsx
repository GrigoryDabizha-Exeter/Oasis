// SolanaProvider — Root context provider for Solana Web3
// In production, this would use @solana-mobile/mobile-wallet-adapter-protocol
// For the hackathon, we provide a mock wallet flow with Devnet connection

import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { useWalletStore } from '../stores/useWalletStore';

interface SolanaContextType {
    connect: () => Promise<void>;
    disconnect: () => void;
    signTransaction: (encodedTx: string) => Promise<string>;
    connected: boolean;
    publicKey: string | null;
    cluster: string;
}

const SolanaContext = createContext<SolanaContextType>({
    connect: async () => { },
    disconnect: () => { },
    signTransaction: async () => '',
    connected: false,
    publicKey: null,
    cluster: 'devnet',
});

export const useSolana = () => useContext(SolanaContext);

// Generate a mock Solana public key (base58-like)
function generateMockPublicKey(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let key = '';
    for (let i = 0; i < 44; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
}

export default function SolanaProvider({ children }: { children: ReactNode }) {
    const walletStore = useWalletStore();
    const [cluster] = useState('devnet');

    const connect = useCallback(async () => {
        // In production: authorize() with Mobile Wallet Adapter
        // For hackathon: simulate wallet connection
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            const mockKey = generateMockPublicKey();
            walletStore.setPublicKey(mockKey);
            walletStore.setConnected(true);
            walletStore.setBalance(2.5);
            walletStore.setLoyaltyTokens(1250);
        } catch (error) {
            Alert.alert('Wallet Connection Failed', 'Please ensure Phantom or Backpack is installed.');
        }
    }, []);

    const disconnect = useCallback(() => {
        walletStore.disconnect();
    }, []);

    const signTransaction = useCallback(async (encodedTx: string): Promise<string> => {
        // In production: use MWA signTransaction()
        // For hackathon: simulate signing delay
        await new Promise((resolve) => setTimeout(resolve, 600));
        const mockSig = `sig_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        return mockSig;
    }, []);

    return (
        <SolanaContext.Provider
            value={{
                connect,
                disconnect,
                signTransaction,
                connected: walletStore.connected,
                publicKey: walletStore.publicKey,
                cluster,
            }}
        >
            {children}
        </SolanaContext.Provider>
    );
}
