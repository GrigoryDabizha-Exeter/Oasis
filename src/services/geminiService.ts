// Gemini Function Calling Tool Registry
// Maps AI function calls → Zustand store mutations

import { useFlightStore } from '../stores/useFlightStore';
import { useQueueStore } from '../stores/useQueueStore';
import { useWalletStore } from '../stores/useWalletStore';
import { generateMockQueues } from './queueApi';
import { MOCK_SHOP_ITEMS, calculateLoyaltyReward, getLoyaltyBurnOptions } from './shopService';
import { MOCK_POIS, getRoute } from './wayfindingService';

// ── Client Initialization ─────────────────────────────────────────────
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

// Use require() to avoid Metro ESM/CJS enum resolution issues at runtime
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(API_KEY);

// ── Tool Declarations ──────────────────────────────────────────────────
// Using string literals for SchemaType values to avoid Metro bundler enum issues

const findAndRouteToGate = {
    name: 'find_and_route_to_gate',
    description:
        "Finds the user's flight gate and sets the active AR/Audio route to that location. Use this when the user asks about their gate, asks to navigate to a flight, or wants directions to a gate.",
    parameters: {
        type: 'OBJECT' as const,
        properties: {
            flightNumber: {
                type: 'STRING' as const,
                description: 'The flight number / IATA code, e.g. QR2332, BA2490, VS7448',
            },
        },
        required: ['flightNumber'],
    },
};

const orderGateDelivery = {
    name: 'order_gate_delivery',
    description:
        'Purchases food or duty-free items via Solana mock checkout for delivery to a specific gate. Use this when the user asks to buy, order, or purchase an item like coffee, food, drinks, or any shop item.',
    parameters: {
        type: 'OBJECT' as const,
        properties: {
            itemName: {
                type: 'STRING' as const,
                description: 'Name of the item to order/purchase, e.g. coffee, Nandos meal, whisky',
            },
            gateNumber: {
                type: 'STRING' as const,
                description: 'The gate number for delivery, e.g. Gate 1, Gate 45',
            },
        },
        required: ['itemName', 'gateNumber'],
    },
};

const analyzeTerminalCongestion = {
    name: 'analyze_terminal_congestion',
    description:
        'Checks Veovo IoT queue metrics and advises the passenger on security wait times and congestion levels. Use when the user asks about security queues, wait times, or terminal congestion.',
    parameters: {
        type: 'OBJECT' as const,
        properties: {
            terminalName: {
                type: 'STRING' as const,
                description: "The terminal to check: 'North' or 'South'",
            },
        },
        required: ['terminalName'],
    },
};

const burnLoyaltyForPerk = {
    name: 'burn_loyalty_for_perk',
    description:
        "Uses the passenger's accumulated OASIS loyalty tokens to unlock premium perks like queue jumps, lounge access, duty-free discounts, or priority boarding.",
    parameters: {
        type: 'OBJECT' as const,
        properties: {
            perkName: {
                type: 'STRING' as const,
                description: 'The perk to unlock: Fast Track Security, Lounge Access, 10% Duty Free Discount, or Priority Boarding',
            },
        },
        required: ['perkName'],
    },
};

const tools = [
    {
        functionDeclarations: [
            findAndRouteToGate,
            orderGateDelivery,
            analyzeTerminalCongestion,
            burnLoyaltyForPerk,
        ],
    },
];

// ── System Instruction ─────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are Oasis, the AI concierge for London Gatwick Airport. You speak concisely and helpfully.
You have access to the airport's live systems through function calls. ALWAYS use a function call when the user's request matches one. 
Keep text responses under 80 words. Use British English. Be warm but efficient — like a premium airport host.
Available items for ordering: ${MOCK_SHOP_ITEMS.map(i => `${i.name} (${i.price} SOL)`).join(', ')}.
If the user asks to "buy a coffee" or similar food/drink item without specifying, order a coffee (0.05 SOL) from Gatwick Café. 
For any purchase request, pick a reasonable gate if none is specified (e.g. Gate 1).`;

// ── Function Call Result Type ──────────────────────────────────────────
export interface FunctionCallResult {
    functionName: string;
    args: Record<string, string>;
    result: {
        success: boolean;
        message: string;
        data?: Record<string, any>;
    };
}

export interface GeminiResponse {
    text: string;
    functionCalls: FunctionCallResult[];
}

// ── Function Executors ─────────────────────────────────────────────────

function executeFindAndRouteToGate(args: { flightNumber: string }): FunctionCallResult['result'] {
    const { flightNumber } = args;
    const flightStore = useFlightStore.getState();
    const allFlights = [...flightStore.departures, ...flightStore.arrivals];
    const flight = allFlights.find(
        (f) =>
            f.flight.iataNumber.toLowerCase() === flightNumber.toLowerCase() ||
            f.flight.number.toLowerCase() === flightNumber.toLowerCase()
    );

    if (!flight) {
        return {
            success: false,
            message: `Flight ${flightNumber} not found in today's schedule. Please check the flight number and try again.`,
        };
    }

    const gate = flight.departure.gate ?? flight.arrival.gate ?? 'TBD';
    const terminal = flight.departure.terminal || flight.arrival.terminal || 'Unknown';

    const gatePoi = MOCK_POIS.find(
        (p) => p.type === 'gate' && p.name.toLowerCase().includes(gate.toLowerCase())
    );

    let routeInfo = null;
    if (gatePoi) {
        const fromId = terminal === 'North' ? 'security-north' : 'security-south';
        routeInfo = getRoute(fromId, gatePoi.id);
    }

    return {
        success: true,
        message: `Flight ${flight.flight.iataNumber} (${flight.airline.name}) — Gate ${gate}, Terminal ${terminal}. Status: ${flight.flight.status}.${routeInfo ? ` Route: ${routeInfo.totalDistance}m, est. ${routeInfo.estimatedTime} min walk.` : ''}`,
        data: {
            flightNumber: flight.flight.iataNumber,
            airline: flight.airline.name,
            gate,
            terminal,
            status: flight.flight.status,
            route: routeInfo,
        },
    };
}

function executeOrderGateDelivery(args: { itemName: string; gateNumber: string }): FunctionCallResult['result'] {
    const { itemName, gateNumber } = args;
    const walletStore = useWalletStore.getState();

    // Find closest matching item
    const item = MOCK_SHOP_ITEMS.find(
        (i) => i.name.toLowerCase().includes(itemName.toLowerCase()) ||
            itemName.toLowerCase().includes(i.name.toLowerCase()) ||
            i.category === 'food' && itemName.toLowerCase().includes('food')
    );

    // If user asks for coffee/tea/etc., create a mock item
    const purchaseItem = item ?? {
        name: itemName,
        price: 0.05,
        currency: 'SOL',
        shopName: 'Gatwick Café',
    };

    if (!walletStore.connected) {
        return {
            success: false,
            message: 'Wallet not connected. Please connect your Phantom or Backpack wallet first to make purchases.',
            data: { requiresWallet: true },
        };
    }

    if (walletStore.balance < purchaseItem.price) {
        return {
            success: false,
            message: `Insufficient balance. Need ${purchaseItem.price} SOL, but you have ${walletStore.balance.toFixed(2)} SOL.`,
            data: { insufficientFunds: true, required: purchaseItem.price, available: walletStore.balance },
        };
    }

    // Deduct balance and grant loyalty tokens
    const newBalance = walletStore.balance - purchaseItem.price;
    const loyaltyEarned = calculateLoyaltyReward(purchaseItem.price);
    walletStore.setBalance(parseFloat(newBalance.toFixed(4)));
    walletStore.setLoyaltyTokens(walletStore.loyaltyTokens + loyaltyEarned);

    return {
        success: true,
        message: `✅ Ordered ${purchaseItem.name} for ${purchaseItem.price} SOL — delivering to ${gateNumber}. Earned ${loyaltyEarned} OASIS tokens!`,
        data: {
            item: purchaseItem.name,
            price: purchaseItem.price,
            gate: gateNumber,
            loyaltyEarned,
            newBalance: parseFloat(newBalance.toFixed(4)),
            txSignature: `mock_${Date.now().toString(36)}`,
        },
    };
}

function executeAnalyzeTerminalCongestion(args: { terminalName: string }): FunctionCallResult['result'] {
    const terminal = args.terminalName.includes('North') || args.terminalName.includes('north')
        ? 'North' : 'South';

    let queueStore = useQueueStore.getState();
    if (queueStore.queues.length === 0) {
        const queues = generateMockQueues();
        queueStore.setQueues(queues);
        queueStore = useQueueStore.getState();
    }

    const terminalQueues = queueStore.queues.filter((q) => q.terminal === terminal);

    if (terminalQueues.length === 0) {
        return {
            success: false,
            message: `No queue data available for Terminal ${terminal} at this time.`,
        };
    }

    const avgWait = Math.round(
        terminalQueues.reduce((sum, q) => sum + q.waitTimeMinutes, 0) / terminalQueues.length
    );
    const minWait = Math.min(...terminalQueues.map((q) => q.waitTimeMinutes));
    const maxWait = Math.max(...terminalQueues.map((q) => q.waitTimeMinutes));
    const avgThroughput = Math.round(
        terminalQueues.reduce((sum, q) => sum + q.throughput, 0) / terminalQueues.length
    );
    const dominantTrend = terminalQueues[0]?.trend ?? 'stable';

    return {
        success: true,
        message: `Terminal ${terminal} Security: avg ${avgWait} min wait (${minWait}-${maxWait} min range). Throughput: ~${avgThroughput} pax/min. Trend: ${dominantTrend}.`,
        data: {
            terminal,
            averageWait: avgWait,
            minWait,
            maxWait,
            throughput: avgThroughput,
            trend: dominantTrend,
            checkpoints: terminalQueues.map((q) => ({
                name: q.checkpoint,
                wait: q.waitTimeMinutes,
                trend: q.trend,
            })),
        },
    };
}

function executeBurnLoyaltyForPerk(args: { perkName: string }): FunctionCallResult['result'] {
    const { perkName } = args;
    const walletStore = useWalletStore.getState();
    const burnOptions = getLoyaltyBurnOptions();

    const perk = burnOptions.find(
        (opt) => opt.name.toLowerCase().includes(perkName.toLowerCase()) ||
            perkName.toLowerCase().includes(opt.name.toLowerCase())
    );

    if (!perk) {
        const available = burnOptions.map((o) => `${o.name} (${o.tokensRequired} OASIS)`).join(', ');
        return {
            success: false,
            message: `Perk "${perkName}" not found. Available perks: ${available}`,
            data: { availablePerks: burnOptions },
        };
    }

    if (!walletStore.connected) {
        return {
            success: false,
            message: 'Wallet not connected. Please connect your wallet first.',
            data: { requiresWallet: true },
        };
    }

    if (walletStore.loyaltyTokens < perk.tokensRequired) {
        return {
            success: false,
            message: `Not enough OASIS tokens. ${perk.name} requires ${perk.tokensRequired}, but you have ${walletStore.loyaltyTokens}.`,
            data: { required: perk.tokensRequired, available: walletStore.loyaltyTokens },
        };
    }

    walletStore.setLoyaltyTokens(walletStore.loyaltyTokens - perk.tokensRequired);

    return {
        success: true,
        message: `🔥 Burned ${perk.tokensRequired} OASIS tokens — ${perk.name} unlocked! ${perk.icon}`,
        data: {
            perk: perk.name,
            tokensBurned: perk.tokensRequired,
            remainingTokens: walletStore.loyaltyTokens - perk.tokensRequired,
            icon: perk.icon,
        },
    };
}

// ── Master Executor ────────────────────────────────────────────────────
function executeFunction(name: string, args: Record<string, string>): FunctionCallResult {
    let result: FunctionCallResult['result'];

    switch (name) {
        case 'find_and_route_to_gate':
            result = executeFindAndRouteToGate(args as { flightNumber: string });
            break;
        case 'order_gate_delivery':
            result = executeOrderGateDelivery(args as { itemName: string; gateNumber: string });
            break;
        case 'analyze_terminal_congestion':
            result = executeAnalyzeTerminalCongestion(args as { terminalName: string });
            break;
        case 'burn_loyalty_for_perk':
            result = executeBurnLoyaltyForPerk(args as { perkName: string });
            break;
        default:
            result = { success: false, message: `Unknown function: ${name}` };
    }

    return { functionName: name, args, result };
}

// ── Main Chat Interface ────────────────────────────────────────────────
export async function chatWithGemini(userMessage: string): Promise<GeminiResponse> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
        tools,
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
    });

    const functionCalls: FunctionCallResult[] = [];

    try {
        const chat = model.startChat();
        let response: any = await chat.sendMessage(userMessage);

        // Process function calls in a loop (Gemini may chain multiple)
        while (true) {
            const candidate = response.response.candidates?.[0];
            if (!candidate) break;

            const parts = candidate.content?.parts ?? [];
            const fcParts = parts.filter((p: any) => 'functionCall' in p);

            if (fcParts.length === 0) break;

            // Execute each function call
            const functionResponses: any[] = [];
            for (const part of fcParts) {
                const fc = part.functionCall;
                const callResult = executeFunction(fc.name, fc.args);
                functionCalls.push(callResult);
                functionResponses.push({
                    functionResponse: {
                        name: fc.name,
                        response: callResult.result,
                    },
                });
            }

            // Send function results back to Gemini for final response
            response = await chat.sendMessage(functionResponses);
        }

        // Extract final text response
        const finalText =
            response.response.candidates?.[0]?.content?.parts
                ?.filter((p: any) => 'text' in p)
                .map((p: any) => p.text)
                .join('') ?? '';

        return { text: finalText, functionCalls };
    } catch (error: any) {
        console.error('[Gemini Error]', error);
        return {
            text: `I'm having trouble connecting right now. Please try again in a moment. (${error.message ?? 'Unknown error'})`,
            functionCalls: [],
        };
    }
}
