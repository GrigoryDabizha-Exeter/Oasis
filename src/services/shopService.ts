// Mock Shop Data & Loyalty Service
import { ShopItem } from './types';

export const MOCK_SHOP_ITEMS: ShopItem[] = [
    {
        id: 'item-1',
        name: 'Johnnie Walker Blue Label',
        description: 'Premium blended Scotch whisky, 700ml. Exclusive duty-free price.',
        price: 0.85,
        currency: 'SOL',
        image: '🥃',
        category: 'duty-free',
        shopName: 'World Duty Free',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=item-1',
    },
    {
        id: 'item-2',
        name: 'Chanel N°5 Eau de Parfum',
        description: 'Classic French perfume, 100ml. Tax-free savings.',
        price: 0.52,
        currency: 'SOL',
        image: '🌸',
        category: 'duty-free',
        shopName: 'World Duty Free',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=item-2',
    },
    {
        id: 'item-3',
        name: 'Premium Lounge Access',
        description: 'No1 Lounge — unlimited food, drinks, and WiFi. 3-hour access.',
        price: 0.18,
        currency: 'SOL',
        image: '✨',
        category: 'lounge',
        shopName: 'No1 Lounge',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=item-3',
    },
    {
        id: 'item-4',
        name: "Nando's Meal Deal",
        description: 'Half chicken, 2 sides, and a drink. Terminal North.',
        price: 0.08,
        currency: 'SOL',
        image: '🍗',
        category: 'food',
        shopName: "Nando's",
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=item-4',
    },
    {
        id: 'item-5',
        name: 'Fast Track Security Pass',
        description: 'Skip the queue — dedicated fast track lane access.',
        price: 0.03,
        currency: 'SOL',
        image: '⚡',
        category: 'service',
        shopName: 'Gatwick Services',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=item-5',
    },
    {
        id: 'item-6',
        name: 'Toblerone Gift Pack',
        description: 'Swiss chocolate selection, 5-pack. Perfect travel gift.',
        price: 0.04,
        currency: 'SOL',
        image: '🍫',
        category: 'duty-free',
        shopName: 'WHSmith',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=item-6',
    },
];

// Mock loyalty token operations
export function calculateLoyaltyReward(purchaseAmountSOL: number): number {
    // 10 OASIS loyalty tokens per 0.01 SOL spent
    return Math.floor(purchaseAmountSOL * 1000);
}

export function getLoyaltyBurnOptions() {
    return [
        { id: 'burn-1', name: 'Fast Track Security', tokensRequired: 500, icon: '⚡' },
        { id: 'burn-2', name: 'Lounge Access (1hr)', tokensRequired: 1000, icon: '🛋️' },
        { id: 'burn-3', name: '10% Duty Free Discount', tokensRequired: 300, icon: '🏷️' },
        { id: 'burn-4', name: 'Priority Boarding', tokensRequired: 750, icon: '✈️' },
    ];
}
