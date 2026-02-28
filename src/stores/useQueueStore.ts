import { create } from 'zustand';
import { QueueMetric } from '../services/types';

interface QueueStore {
    queues: QueueMetric[];
    isLoading: boolean;
    lastUpdated: string | null;
    setQueues: (queues: QueueMetric[]) => void;
    setLoading: (loading: boolean) => void;
    getQueueForTerminal: (terminal: 'North' | 'South') => QueueMetric[];
}

export const useQueueStore = create<QueueStore>((set, get) => ({
    queues: [],
    isLoading: false,
    lastUpdated: null,
    setQueues: (queues) => set({ queues, lastUpdated: new Date().toISOString() }),
    setLoading: (loading) => set({ isLoading: loading }),
    getQueueForTerminal: (terminal) => get().queues.filter((q) => q.terminal === terminal),
}));
