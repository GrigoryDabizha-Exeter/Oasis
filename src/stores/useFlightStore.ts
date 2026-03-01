import { create } from 'zustand';
import { fetchLiveFlights } from '../services/liveFlightApi';
import { FlightData, FlightType } from '../services/types';

interface FlightStore {
    departures: FlightData[];
    arrivals: FlightData[];
    selectedFlight: FlightData | null;
    flightType: FlightType;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
    dataSource: 'live' | 'error' | null;
    setDepartures: (flights: FlightData[]) => void;
    setArrivals: (flights: FlightData[]) => void;
    setSelectedFlight: (flight: FlightData | null) => void;
    setFlightType: (type: FlightType) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    loadLiveFlights: () => Promise<void>;
}

export const useFlightStore = create<FlightStore>((set) => ({
    departures: [],
    arrivals: [],
    selectedFlight: null,
    flightType: 'departure',
    isLoading: false,
    error: null,
    lastUpdated: null,
    dataSource: null,
    setDepartures: (flights) => set({ departures: flights, lastUpdated: new Date().toISOString() }),
    setArrivals:   (flights) => set({ arrivals:    flights, lastUpdated: new Date().toISOString() }),
    setSelectedFlight: (flight) => set({ selectedFlight: flight }),
    setFlightType: (type)   => set({ flightType: type }),
    setLoading:    (loading) => set({ isLoading: loading }),
    setError:      (error)   => set({ error }),

    loadLiveFlights: async () => {
        set({ isLoading: true, error: null });
        const result = await fetchLiveFlights();

        if (result.source === 'error') {
            console.error('[FlightStore] Live fetch failed:', result.error);
            set({
                departures: [],
                arrivals: [],
                dataSource: 'error',
                isLoading: false,
                error: result.error,
                lastUpdated: new Date().toISOString(),
            });
            return;
        }

        set({
            departures: result.departures,
            arrivals: [],
            dataSource: 'live',
            isLoading: false,
            error: null,
            lastUpdated: new Date().toISOString(),
        });
        console.log(`[FlightStore] Loaded ${result.departures.length} live departures`);
    },
}));
