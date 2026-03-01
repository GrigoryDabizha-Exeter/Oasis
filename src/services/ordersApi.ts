/**
 * ordersApi — order creation facade
 *
 * Uses the shared Zustand useOrderStore as the real-time bridge between
 * the Passenger (ShopScreen) and Worker (VendorDashboardScreen).
 * Both sides run in the same JS runtime, so Zustand subscriptions fire
 * instantly — no external backend required for the hackathon demo.
 */
import { useOrderStore } from '../stores/useOrderStore';

export interface Order {
    id: string;
    passengerName: string;
    item: string;
    status: 'Pending' | 'Preparing' | 'En Route' | 'Arrived';
    timestamp: string;
    gate: string;
    shopName: string;
    price: number;
}

export interface CreateOrderParams {
    item: string;
    price: number;
    shopName: string;
    gate: string;
    passengerName: string;
}

/**
 * Places an order that is immediately visible to the worker dashboard.
 * Returns the order record for use in the UI (e.g. confirmation alerts).
 */
export function createOrder(params: CreateOrderParams): Order {
    const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    useOrderStore.getState().placeOrder(
        params.item,
        params.gate,
        params.price,
        params.shopName,
        params.passengerName,
    );

    return {
        id,
        passengerName: params.passengerName,
        item: params.item,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        gate: params.gate,
        shopName: params.shopName,
        price: params.price,
    };
}
