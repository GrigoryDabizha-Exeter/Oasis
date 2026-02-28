import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QueueMetric } from '../../services/types';
import GlassCard from '../ui/GlassCard';

interface QueueCardProps {
    queue: QueueMetric;
}

export default function QueueCard({ queue }: QueueCardProps) {
    const getTrendIcon = () => {
        switch (queue.trend) {
            case 'increasing': return '📈';
            case 'decreasing': return '📉';
            case 'stable': return '➡️';
        }
    };

    const getWaitColor = () => {
        if (queue.waitTimeMinutes <= 5) return '#4ADE80';
        if (queue.waitTimeMinutes <= 15) return '#FBBF24';
        return '#F87171';
    };

    return (
        <GlassCard>
            <View style={styles.row}>
                <View style={styles.nameSection}>
                    <Text style={styles.checkpoint}>{queue.checkpoint}</Text>
                    <Text style={styles.terminal}>Terminal {queue.terminal}</Text>
                </View>
                <View style={styles.waitSection}>
                    <Text style={[styles.waitTime, { color: getWaitColor() }]}>
                        {queue.waitTimeMinutes}
                    </Text>
                    <Text style={styles.waitUnit}>min</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <Text style={styles.trend}>{getTrendIcon()} {queue.trend}</Text>
                <Text style={styles.throughput}>{queue.throughput} pax/min</Text>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    nameSection: { flex: 1 },
    checkpoint: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    terminal: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 2,
    },
    waitSection: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 3,
    },
    waitTime: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -1,
    },
    waitUnit: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        paddingTop: 8,
    },
    trend: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    throughput: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 11,
    },
});
