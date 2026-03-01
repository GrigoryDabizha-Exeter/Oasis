import { Platform } from 'react-native';
import { FlightData } from './types';

/**
 * Resolve the correct fetch URL depending on the runtime environment:
 *
 *  • Native (iOS/Android) — direct HTTP fetch is fine; no browser enforces Mixed Content.
 *  • Web on localhost       — HTTP dev server, so HTTP→HTTP fetch is allowed.
 *  • Web on Vercel/prod    — HTTPS page, so the browser would block HTTP fetch.
 *                            We proxy through our own Vercel serverless function instead.
 */
function getFlightsUrl(): string {
    const direct = 'http://api.aviationstack.com/v1/flights?access_key=a85fd752a9b9aa6f638b8f99c9a47a8d&dep_iata=LGW';

    if (Platform.OS !== 'web') return direct;

    // Running in a browser — check whether we're on localhost or a real deployment.
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
        if (!isLocal) {
            // Production web (Vercel): use same-origin API route — no CORS, no Mixed Content.
            return '/api/flights';
        }
    }

    // Localhost web dev: HTTP page → HTTP API is fine, but use corsproxy just in case the
    // local dev server is ever served over HTTPS.
    return 'https://corsproxy.io/?url=' + encodeURIComponent(direct);
}

function randomGate(): string {
    return String(Math.floor(Math.random() * 46) + 10);
}

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

// Uses `any` so optional chaining is safe even if AviationStack sends
// partial/null objects for individual rows in the response array.
function mapApiFlightToLocal(item: any, index: number): FlightData | null {
    if (!item) return null;

    const dep = item.departure ?? {};
    const arr = item.arrival ?? {};
    const airline = item.airline ?? {};
    const flight = item.flight ?? {};

    const delay: number = dep.delay ?? 0;

    let status: FlightData['flight']['status'] = 'scheduled';
    if (item.flight_status === 'active') status = 'en-route';
    else if (item.flight_status === 'landed') status = 'landed';
    else if (item.flight_status === 'cancelled') status = 'cancelled';

    const depScheduledRaw: string | undefined = dep.scheduled || dep.estimated;
    const arrScheduledRaw: string | undefined = arr.scheduled || arr.estimated;

    return {
        id: `live-${flight.iata || flight.number || index}-${index}`,
        airline: {
            name: airline.name || 'Unknown',
            iataCode: airline.iata || '??',
        },
        flight: {
            number: flight.number || '—',
            iataNumber: flight.iata || '—',
            status,
            delay,
        },
        departure: {
            iataCode: dep.iata || 'LGW',
            terminal: dep.terminal || randomTerminal(),
            gate: dep.gate || randomGate(),
            scheduledTime: safeTime(depScheduledRaw),
            estimatedTime: safeTime(dep.estimated),
            actualTime: safeTime(dep.actual),
        },
        arrival: {
            iataCode: arr.iata || '???',
            terminal: arr.terminal || '',
            gate: arr.gate ?? null,
            baggage: null,
            scheduledTime: safeTime(arrScheduledRaw),
            estimatedTime: safeTime(arr.estimated),
            actualTime: safeTime(arr.actual),
        },
    };
}

export type FlightFetchResult =
    | { departures: FlightData[]; source: 'live' }
    | { departures: []; source: 'error'; error: string };

export async function fetchLiveFlights(): Promise<FlightFetchResult> {
    try {
        const response  = await fetch(getFlightsUrl());
        const data = await response.json();

        console.log('[LiveFlightAPI] RAW API RESPONSE (first 600 chars):', JSON.stringify(data).slice(0, 600));

        if (data.error) {
            console.error('[LiveFlightAPI] AVIATIONSTACK API ERROR:', data.error);
            return { departures: [], source: 'error', error: data.error?.info ?? 'API error.' };
        }

        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
            console.error('[LiveFlightAPI] Empty or missing data.data. Keys:', Object.keys(data));
            return { departures: [], source: 'error', error: 'No flight data returned for LGW.' };
        }

        const flights: FlightData[] = (data.data as any[])
            .map(mapApiFlightToLocal)
            .filter((f): f is FlightData => f !== null);

        console.log(`[LiveFlightAPI] Mapped ${flights.length} flights`);
        return { departures: flights, source: 'live' };
    } catch (err: any) {
        console.error('[LiveFlightAPI] Fetch exception:', err);
        return { departures: [], source: 'error', error: err?.message ?? 'Network error.' };
    }
}
