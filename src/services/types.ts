// API response types for Aviation Edge / FlightLabs
export interface FlightData {
    id: string;
    airline: {
        name: string;
        iataCode: string;
    };
    flight: {
        number: string;
        iataNumber: string;
        status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident' | 'diverted' | 'en-route' | 'boarding';
        delay: number | null;
    };
    departure: {
        iataCode: string;
        terminal: string;
        gate: string | null;
        scheduledTime: string;
        estimatedTime: string | null;
        actualTime: string | null;
    };
    arrival: {
        iataCode: string;
        terminal: string;
        gate: string | null;
        baggage: string | null;
        scheduledTime: string;
        estimatedTime: string | null;
        actualTime: string | null;
    };
}

export interface QueueMetric {
    id: string;
    checkpoint: string;
    terminal: 'North' | 'South';
    waitTimeMinutes: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    throughput: number; // passengers per minute
    lastUpdated: string;
}

export interface GateInfo {
    id: string;
    name: string;
    terminal: 'North' | 'South';
    floor: number;
    lat: number;
    lng: number;
    type: 'gate' | 'shop' | 'restaurant' | 'lounge' | 'restroom' | 'security' | 'immigration';
}

export interface RouteWaypoint {
    lat: number;
    lng: number;
    floor: number;
    instruction: string;
    distance: number; // meters to next waypoint
    landmark?: string;
}

export interface NavigationRoute {
    waypoints: RouteWaypoint[];
    totalDistance: number; // meters
    estimatedTime: number; // minutes
    accessibility: 'standard' | 'wheelchair' | 'visually-impaired';
}

export type FlightType = 'departure' | 'arrival';

export interface WalletState {
    connected: boolean;
    publicKey: string | null;
    balance: number;
    loyaltyTokens: number;
}

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    category: 'duty-free' | 'food' | 'lounge' | 'service';
    shopName: string;
    blinkUrl?: string;
}
