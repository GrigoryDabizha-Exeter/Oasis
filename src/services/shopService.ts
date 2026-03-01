// Shop Data & Loyalty Service — Real Gatwick Vendors
import { ShopItem } from './types';

export const MOCK_SHOP_ITEMS: ShopItem[] = [
    // ── Pret A Manger ─────────────────────────────────────────────────────────
    {
        id: 'pret-1',
        name: 'Flat White',
        description: 'Double-shot espresso with steamed whole milk. Ready in 3 min.',
        price: 3.40,
        currency: 'GBP',
        image: '☕',
        category: 'food',
        shopName: 'Pret A Manger',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=pret-1',
    },
    {
        id: 'pret-2',
        name: 'Chicken Avocado Baguette',
        description: 'Freshly made chicken & avocado baguette. Ready in 2 min.',
        price: 4.50,
        currency: 'GBP',
        image: '🥖',
        category: 'food',
        shopName: 'Pret A Manger',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=pret-2',
    },

    // ── World Duty Free ───────────────────────────────────────────────────────
    {
        id: 'wdf-1',
        name: 'Toblerone Gift Pack',
        description: 'Swiss milk chocolate with honey & almond nougat, 400g. Duty-free price.',
        price: 8.00,
        currency: 'GBP',
        image: '🍫',
        category: 'duty-free',
        shopName: 'World Duty Free',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=wdf-1',
    },
    {
        id: 'wdf-2',
        name: 'Tom Ford Oud Wood',
        description: 'Iconic woody fragrance EDP, 50ml. Significant tax-free saving vs retail.',
        price: 95.00,
        currency: 'GBP',
        image: '🌸',
        category: 'duty-free',
        shopName: 'World Duty Free',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=wdf-2',
    },

    // ── The Red Lion (Wetherspoon) ─────────────────────────────────────────────
    {
        id: 'lion-1',
        name: 'Camden Hells Lager',
        description: 'Crisp, hoppy lager by Camden Town Brewery. Served ice cold. Ready in 2 min.',
        price: 6.20,
        currency: 'GBP',
        image: '🍺',
        category: 'food',
        shopName: 'The Red Lion',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=lion-1',
    },
    {
        id: 'lion-2',
        name: 'Full English Breakfast',
        description: 'Bacon, eggs, sausage, beans, toast & grilled tomato. Ready in 12 min.',
        price: 11.00,
        currency: 'GBP',
        image: '🍳',
        category: 'food',
        shopName: 'The Red Lion',
        blinkUrl: 'solana-action://oasis.app/api/checkout?item=lion-2',
    },
];

export function calculateLoyaltyReward(purchaseAmountGBP: number): number {
    // 10 OASIS tokens per £1 spent
    return Math.floor(purchaseAmountGBP * 10);
}

export function getLoyaltyBurnOptions() {
    return [
        { id: 'burn-1', name: 'Fast Track Security', tokensRequired: 500, icon: '⚡' },
        { id: 'burn-2', name: 'Lounge Access (1hr)', tokensRequired: 1000, icon: '🛋️' },
        { id: 'burn-3', name: '10% Duty Free Discount', tokensRequired: 300, icon: '🏷️' },
        { id: 'burn-4', name: 'Priority Boarding', tokensRequired: 750, icon: '✈️' },
    ];
}
