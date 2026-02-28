import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FlightData, FlightType } from '../services/types';

interface FlightStore {
    departures: FlightData[];
    arrivals: FlightData[];
    selectedFlight: FlightData | null;
    flightType: FlightType;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
    setDepartures: (flights: FlightData[]) => void;
    setArrivals: (flights: FlightData[]) => void;
    setSelectedFlight: (flight: FlightData | null) => void;
    setFlightType: (type: FlightType) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useFlightStore = create<FlightStore>()(
    persist(
        (set) => ({
            departures: [],
            arrivals: [],
            selectedFlight: null,
            flightType: 'departure',
            isLoading: false,
            error: null,
            lastUpdated: null,
            setDepartures: (flights) => set({ departures: flights, lastUpdated: new Date().toISOString() }),
            setArrivals: (flights) => set({ arrivals: flights, lastUpdated: new Date().toISOString() }),
            setSelectedFlight: (flight) => set({ selectedFlight: flight }),
            setFlightType: (type) => set({ flightType: type }),
            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
        }),
        {
            name: 'oasis-flight-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                selectedFlight: state.selectedFlight,
                flightType: state.flightType,
            }),
        }
    )
);
