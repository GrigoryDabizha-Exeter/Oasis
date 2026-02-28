import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type OrderStatus = 'preparing' | 'en_route' | 'arrived';

export interface ActiveOrder {
    item: string;
    gate: string;
    pin: string;
    status: OrderStatus;
    price: number;
    orderedAt: number;
    shopName: string;
    passengerName?: string;
}

interface OrderStore {
    activeOrder: ActiveOrder | null;
    pinError: boolean;
    placeOrder: (item: string, gate: string, price: number, shopName?: string, passengerName?: string) => void;
    setOrderStatus: (status: OrderStatus) => void;
    simulateRobotMovement: () => void;
    unlockContainer: (enteredPin: string) => boolean;
    clearOrder: () => void;
}

function generatePin(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
}

let movementTimer1: ReturnType<typeof setTimeout> | null = null;
let movementTimer2: ReturnType<typeof setTimeout> | null = null;

export const useOrderStore = create<OrderStore>()(
    persist(
        (set, get) => ({
            activeOrder: null,
            pinError: false,

            placeOrder: (item, gate, price, shopName = 'Gatwick Café', passengerName) => {
                if (movementTimer1) clearTimeout(movementTimer1);
                if (movementTimer2) clearTimeout(movementTimer2);

                const pin = generatePin();
                set({
                    activeOrder: {
                        item,
                        gate,
                        pin,
                        status: 'preparing',
                        price,
                        orderedAt: Date.now(),
                        shopName,
                        passengerName,
                    },
                    pinError: false,
                });
            },

            setOrderStatus: (status) => {
                const current = get().activeOrder;
                if (current) {
                    set({ activeOrder: { ...current, status } });
                }
            },

            simulateRobotMovement: () => {
                movementTimer1 = setTimeout(() => {
                    const current = get().activeOrder;
                    if (current && current.status === 'preparing') {
                        set({ activeOrder: { ...current, status: 'en_route' } });
                    }
                }, 5000);

                movementTimer2 = setTimeout(() => {
                    const current = get().activeOrder;
                    if (current && current.status === 'en_route') {
                        set({ activeOrder: { ...current, status: 'arrived' } });
                    }
                }, 10000);
            },

            unlockContainer: (enteredPin) => {
                const order = get().activeOrder;
                if (!order) return false;
                if (enteredPin === order.pin) {
                    if (movementTimer1) clearTimeout(movementTimer1);
                    if (movementTimer2) clearTimeout(movementTimer2);
                    set({ activeOrder: null, pinError: false });
                    return true;
                }
                set({ pinError: true });
                return false;
            },

            clearOrder: () => {
                if (movementTimer1) clearTimeout(movementTimer1);
                if (movementTimer2) clearTimeout(movementTimer2);
                set({ activeOrder: null, pinError: false });
            },
        }),
        {
            name: 'oasis-order-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                activeOrder: state.activeOrder,
            }),
        }
    )
);
