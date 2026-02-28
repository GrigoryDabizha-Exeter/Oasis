// Mock Flight Data Service
// In production, this would poll Aviation Edge / FlightLabs API
import { FlightData } from './types';

const AIRLINES = [
    { name: 'British Airways', iataCode: 'BA' },
    { name: 'easyJet', iataCode: 'U2' },
    { name: 'Vueling', iataCode: 'VY' },
    { name: 'Norwegian', iataCode: 'DY' },
    { name: 'WizzAir', iataCode: 'W6' },
    { name: 'Ryanair', iataCode: 'FR' },
    { name: 'TUI Airways', iataCode: 'BY' },
    { name: 'Emirates', iataCode: 'EK' },
    { name: 'Virgin Atlantic', iataCode: 'VS' },
    { name: 'Qatar Airways', iataCode: 'QR' },
];

const DESTINATIONS = [
    { code: 'CDG', city: 'Paris' },
    { code: 'AMS', city: 'Amsterdam' },
    { code: 'BCN', city: 'Barcelona' },
    { code: 'FCO', city: 'Rome' },
    { code: 'DXB', city: 'Dubai' },
    { code: 'JFK', city: 'New York' },
    { code: 'IST', city: 'Istanbul' },
    { code: 'AGP', city: 'Malaga' },
    { code: 'FAO', city: 'Faro' },
    { code: 'PMI', city: 'Palma' },
    { code: 'TFS', city: 'Tenerife' },
    { code: 'DUB', city: 'Dublin' },
];

const STATUSES: FlightData['flight']['status'][] = [
    'scheduled', 'scheduled', 'scheduled', 'active', 'boarding', 'en-route', 'landed',
];

const GATES = ['1', '2', '3', '5', '7', '10', '15', '21', '25', '31', '33', '40', '45', '50', '55', '101', '102', '103'];

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateFlightNumber(airline: { iataCode: string }): string {
    return `${airline.iataCode}${Math.floor(100 + Math.random() * 9900)}`;
}

function generateScheduledTime(offsetHours: number): string {
    const now = new Date();
    now.setHours(now.getHours() + offsetHours);
    now.setMinutes(Math.floor(Math.random() / 0.2) * 10);
    return now.toISOString();
}

export function generateMockDepartures(count = 20): FlightData[] {
    return Array.from({ length: count }, (_, i) => {
        const airline = randomElement(AIRLINES);
        const dest = randomElement(DESTINATIONS);
        const status = randomElement(STATUSES);
        const delay = Math.random() > 0.7 ? Math.floor(Math.random() * 60) + 5 : null;
        const terminal = Math.random() > 0.5 ? 'North' : 'South';

        return {
            id: `dep-${i}-${Date.now()}`,
            airline,
            flight: {
                number: generateFlightNumber(airline),
                iataNumber: generateFlightNumber(airline),
                status,
                delay,
            },
            departure: {
                iataCode: 'LGW',
                terminal,
                gate: status === 'scheduled' ? null : randomElement(GATES),
                scheduledTime: generateScheduledTime(i * 0.5),
                estimatedTime: delay ? generateScheduledTime(i * 0.5 + delay / 60) : null,
                actualTime: status === 'active' ? generateScheduledTime(i * 0.5) : null,
            },
            arrival: {
                iataCode: dest.code,
                terminal: '',
                gate: null,
                baggage: null,
                scheduledTime: generateScheduledTime(i * 0.5 + 2 + Math.random() * 4),
                estimatedTime: null,
                actualTime: null,
            },
        };
    }).sort((a, b) => new Date(a.departure.scheduledTime).getTime() - new Date(b.departure.scheduledTime).getTime());
}

export function generateMockArrivals(count = 15): FlightData[] {
    return Array.from({ length: count }, (_, i) => {
        const airline = randomElement(AIRLINES);
        const origin = randomElement(DESTINATIONS);
        const status = randomElement(['en-route', 'landed', 'active'] as FlightData['flight']['status'][]);
        const delay = Math.random() > 0.75 ? Math.floor(Math.random() * 45) + 5 : null;
        const terminal = Math.random() > 0.5 ? 'North' : 'South';

        return {
            id: `arr-${i}-${Date.now()}`,
            airline,
            flight: {
                number: generateFlightNumber(airline),
                iataNumber: generateFlightNumber(airline),
                status,
                delay,
            },
            departure: {
                iataCode: origin.code,
                terminal: '',
                gate: null,
                scheduledTime: generateScheduledTime(-3 + i * 0.3),
                estimatedTime: null,
                actualTime: null,
            },
            arrival: {
                iataCode: 'LGW',
                terminal,
                gate: randomElement(GATES),
                baggage: status === 'landed' ? `Belt ${Math.floor(1 + Math.random() * 8)}` : null,
                scheduledTime: generateScheduledTime(i * 0.4),
                estimatedTime: delay ? generateScheduledTime(i * 0.4 + delay / 60) : null,
                actualTime: status === 'landed' ? generateScheduledTime(i * 0.4) : null,
            },
        };
    }).sort((a, b) => new Date(a.arrival.scheduledTime).getTime() - new Date(b.arrival.scheduledTime).getTime());
}

// Destination name lookup
const DEST_MAP = Object.fromEntries(DESTINATIONS.map((d) => [d.code, d.city]));
export function getCityName(iataCode: string): string {
    return DEST_MAP[iataCode] ?? iataCode;
}
