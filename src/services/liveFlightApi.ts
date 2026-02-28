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

function mapApiFlightToLocal(apiFlight: AviationStackFlight, index: number): FlightData {
    const depTime = new Date(apiFlight.departure.scheduled);
    const delay = apiFlight.departure.delay ?? 0;

    let status: FlightData['flight']['status'] = 'scheduled';
    if (apiFlight.flight_status === 'active') status = 'en-route';
    else if (apiFlight.flight_status === 'landed') status = 'landed';
    else if (apiFlight.flight_status === 'cancelled') status = 'cancelled';

    return {
        id: `live-${apiFlight.flight.iata}-${index}`,
        airline: {
            name: apiFlight.airline.name,
            iataCode: apiFlight.airline.iata,
        },
        flight: {
            number: apiFlight.flight.number,
            iataNumber: apiFlight.flight.iata,
            status,
            delay,
        },
        departure: {
            iataCode: apiFlight.departure.iata,
            terminal: apiFlight.departure.terminal ?? 'South',
            gate: apiFlight.departure.gate ?? null,
            scheduledTime: depTime.toTimeString().slice(0, 5),
            estimatedTime: apiFlight.departure.estimated
                ? new Date(apiFlight.departure.estimated).toTimeString().slice(0, 5)
                : null,
            actualTime: apiFlight.departure.actual
                ? new Date(apiFlight.departure.actual).toTimeString().slice(0, 5)
                : null,
        },
        arrival: {
            iataCode: apiFlight.arrival.iata,
            terminal: apiFlight.arrival.terminal ?? '',
            gate: apiFlight.arrival.gate ?? null,
            baggage: null,
            scheduledTime: new Date(apiFlight.arrival.scheduled).toTimeString().slice(0, 5),
            estimatedTime: apiFlight.arrival.estimated
                ? new Date(apiFlight.arrival.estimated).toTimeString().slice(0, 5)
                : null,
            actualTime: apiFlight.arrival.actual
                ? new Date(apiFlight.arrival.actual).toTimeString().slice(0, 5)
                : null,
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
