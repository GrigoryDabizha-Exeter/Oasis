import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserRole = 'passenger' | 'runner' | null;

interface AuthUser {
    id: string;
    name: string;
    email: string;
    picture?: string;
}

interface AuthStore {
    isAuthenticated: boolean;
    user: AuthUser | null;
    role: UserRole;
    flightNumber: string | null;
    shopName: string | null;
    login: (user: AuthUser) => void;
    logout: () => void;
    setRole: (role: UserRole) => void;
    setFlightNumber: (flightNumber: string) => void;
    setShopName: (shopName: string) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            role: null,
            flightNumber: null,
            shopName: null,
            login: (user) => set({ isAuthenticated: true, user }),
            logout: () => set({ isAuthenticated: false, user: null, role: null, flightNumber: null, shopName: null }),
            setRole: (role) => set({ role }),
            setFlightNumber: (flightNumber) => set({ flightNumber }),
            setShopName: (shopName) => set({ shopName }),
        }),
        {
            name: 'oasis-auth-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                role: state.role,
                flightNumber: state.flightNumber,
                shopName: state.shopName,
            }),
        }
    )
);
