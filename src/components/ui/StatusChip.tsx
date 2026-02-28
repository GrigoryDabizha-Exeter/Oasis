import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ChipVariant = 'onTime' | 'delayed' | 'boarding' | 'landed' | 'cancelled' | 'en-route' | 'scheduled' | 'active';

interface StatusChipProps {
    status: string;
    size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    'scheduled': { label: 'Scheduled', bg: 'rgba(255, 255, 255, 0.08)', text: 'rgba(255, 255, 255, 0.6)', dot: 'rgba(255, 255, 255, 0.4)' },
    'active': { label: 'Active', bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', dot: '#3B82F6' },
    'boarding': { label: 'Boarding', bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', dot: '#F59E0B' },
    'en-route': { label: 'En Route', bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', dot: '#3B82F6' },
    'landed': { label: 'Landed', bg: 'rgba(34, 197, 94, 0.15)', text: '#4ADE80', dot: '#22C55E' },
    'cancelled': { label: 'Cancelled', bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', dot: '#EF4444' },
    'onTime': { label: 'On Time', bg: 'rgba(34, 197, 94, 0.15)', text: '#4ADE80', dot: '#22C55E' },
    'delayed': { label: 'Delayed', bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', dot: '#EF4444' },
};

export default function StatusChip({ status, size = 'md' }: StatusChipProps) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['scheduled'];
    const isSm = size === 'sm';

    return (
        <View
            style={[
                styles.chip,
                { backgroundColor: config.bg },
                isSm && styles.chipSm,
            ]}
            accessibilityRole="text"
            accessibilityLabel={`Status: ${config.label}`}
        >
            <View style={[styles.dot, { backgroundColor: config.dot }]} />
            <Text style={[styles.label, { color: config.text }, isSm && styles.labelSm]}>
                {config.label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    chipSm: {
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    labelSm: {
        fontSize: 10,
    },
});
