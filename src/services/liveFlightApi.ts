import { generateMockDepartures } from './flightApi';
import { FlightData } from './types';

const AVIATION_API_KEY = process.env.EXPO_PUBLIC_AVIATION_API_KEY ?? '';
const AVIATION_API_URL = 'http://api.aviationstack.com/v1/flights';

interface AviationStackFlight {
    flight_date: string;
    flight_status: string;
    departure: {
        airport: string;
        iata: string;
        terminal: string | null;
        gate: string | null;
        scheduled: string;
        estimated: string | null;
        actual: string | null;
        delay: number | null;
    };
    arrival: {
        airport: string;
        iata: string;
        terminal: string | null;
        gate: string | null;
        scheduled: string;
        estimated: string | null;
        actual: string | null;
    };
    airline: {
        name: string;
        iata: string;
    };
    flight: {
        number: string;
        iata: string;
    };
}

function randomGate(): string {
    return String(Math.floor(Math.random() * 46) + 10); // Gates 10–55
}

/** Safely format an ISO date string to HH:mm, returning "TBD" if null/invalid */
function safeTime(raw: string | null | undefined): string {
    if (!raw) return 'TBD';
    try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return 'TBD';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        return 'TBD';
    }
}

function randomTerminal(): string {
    return Math.random() > 0.5 ? 'N' : 'S';
}

function mapApiFlightToLocal(apiFlight: AviationStackFlight, index: number): FlightData {
    const delay = apiFlight.departure.delay ?? 0;

    let status: FlightData['flight']['status'] = 'scheduled';
    if (apiFlight.flight_status === 'active') status = 'en-route';
    else if (apiFlight.flight_status === 'landed') status = 'landed';
    else if (apiFlight.flight_status === 'cancelled') status = 'cancelled';

    // Safe time extraction: prefer scheduled, fall back to estimated
    const depScheduledRaw = apiFlight.departure.scheduled || apiFlight.departure.estimated;
    const arrScheduledRaw = apiFlight.arrival.scheduled || apiFlight.arrival.estimated;

    return {
        id: `live-${apiFlight.flight.iata || apiFlight.flight.number}-${index}`,
        airline: {
            name: apiFlight.airline.name || 'Unknown',
            iataCode: apiFlight.airline.iata || '??',
        },
        flight: {
            number: apiFlight.flight.number || '—',
            iataNumber: apiFlight.flight.iata || '—',
            status,
            delay,
        },
        departure: {
            iataCode: apiFlight.departure.iata || 'LGW',
            terminal: apiFlight.departure.terminal || randomTerminal(),
            gate: apiFlight.departure.gate || randomGate(),
            scheduledTime: safeTime(depScheduledRaw),
            estimatedTime: safeTime(apiFlight.departure.estimated),
            actualTime: safeTime(apiFlight.departure.actual),
        },
        arrival: {
            iataCode: apiFlight.arrival.iata || '???',
            terminal: apiFlight.arrival.terminal || '',
            gate: apiFlight.arrival.gate ?? null,
            baggage: null,
            scheduledTime: safeTime(arrScheduledRaw),
            estimatedTime: safeTime(apiFlight.arrival.estimated),
            actualTime: safeTime(apiFlight.arrival.actual),
        },
    };
}

export async function fetchLiveFlights(): Promise<{ departures: FlightData[]; source: 'live' | 'mock' }> {
    if (!AVIATION_API_KEY) {
        console.log('[LiveFlightAPI] No API key — falling back to mock data');
        return { departures: generateMockDepartures(20), source: 'mock' };
    }

    try {
        const url = `${AVIATION_API_URL}?dep_iata=LGW&access_key=${AVIATION_API_KEY}&limit=25`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API responded with ${response.status}`);
        }

        const data = await response.json();

        if (data.error || !data.data || data.data.length === 0) {
            console.warn('[LiveFlightAPI] No data or API error — falling back to mock');
            return { departures: generateMockDepartures(20), source: 'mock' };
        }

        const flights = data.data.map(mapApiFlightToLocal);
        return { departures: flights, source: 'live' };
    } catch (error) {
        console.error('[LiveFlightAPI] Fetch failed — falling back to mock:', error);
        return { departures: generateMockDepartures(20), source: 'mock' };
    }
}
