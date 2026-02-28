import { create } from 'zustand';
import { WalletState } from '../services/types';

interface WalletStore extends WalletState {
    setConnected: (connected: boolean) => void;
    setPublicKey: (key: string | null) => void;
    setBalance: (balance: number) => void;
    setLoyaltyTokens: (tokens: number) => void;
    disconnect: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
    connected: false,
    publicKey: null,
    balance: 0,
    loyaltyTokens: 0,
    setConnected: (connected) => set({ connected }),
    setPublicKey: (key) => set({ publicKey: key }),
    setBalance: (balance) => set({ balance }),
    setLoyaltyTokens: (tokens) => set({ loyaltyTokens: tokens }),
    disconnect: () => set({ connected: false, publicKey: null, balance: 0, loyaltyTokens: 0 }),
}));
