// Mock Veovo IoT Queue Metrics Service
import { QueueMetric } from './types';

const CHECKPOINTS: { name: string; terminal: 'North' | 'South' }[] = [
    { name: 'North Security Main', terminal: 'North' },
    { name: 'North Security Fast Track', terminal: 'North' },
    { name: 'North Immigration', terminal: 'North' },
    { name: 'South Security Main', terminal: 'South' },
    { name: 'South Security Fast Track', terminal: 'South' },
    { name: 'South Immigration', terminal: 'South' },
];

function randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockQueues(): QueueMetric[] {
    return CHECKPOINTS.map((cp, i) => {
        const isFastTrack = cp.name.includes('Fast Track');
        const baseWait = isFastTrack ? randomInRange(2, 8) : randomInRange(8, 25);
        const trends: QueueMetric['trend'][] = ['increasing', 'decreasing', 'stable'];

        return {
            id: `queue-${i}`,
            checkpoint: cp.name,
            terminal: cp.terminal,
            waitTimeMinutes: baseWait,
            trend: trends[Math.floor(Math.random() * trends.length)],
            throughput: randomInRange(15, 45),
            lastUpdated: new Date().toISOString(),
        };
    });
}
