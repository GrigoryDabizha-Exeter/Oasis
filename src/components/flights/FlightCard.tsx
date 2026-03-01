import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCityName } from '../../services/flightApi';
import { FlightData } from '../../services/types';
import GlassCard from '../ui/GlassCard';
import StatusChip from '../ui/StatusChip';

function formatTime(raw: string): string {
    if (!raw) return 'TBD';
    // Already HH:mm — pass through
    if (/^\d{2}:\d{2}$/.test(raw)) return raw;
    try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return 'TBD';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        return 'TBD';
    }
}

interface FlightCardProps {
    flight: FlightData;
    type: 'departure' | 'arrival';
    onPress?: () => void;
}

export default function FlightCard({ flight, type, onPress }: FlightCardProps) {
    const isDeparture = type === 'departure';
    const cityCode = isDeparture ? flight.arrival.iataCode : flight.departure.iataCode;
    const city = getCityName(cityCode);
    const time = isDeparture ? flight.departure.scheduledTime : flight.arrival.scheduledTime;
    const terminal = isDeparture ? flight.departure.terminal : flight.arrival.terminal;
    const gate = isDeparture ? flight.departure.gate : flight.arrival.gate;
    const hasDelay = flight.flight.delay && flight.flight.delay > 0;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={`${flight.airline.name} flight ${flight.flight.number} to ${city}`}>
            <GlassCard highlight={flight.flight.status === 'boarding'}>
                <View style={styles.topRow}>
                    <View style={styles.airlineRow}>
                        <Text style={styles.airlineCode}>{flight.airline.iataCode}</Text>
                        <Text style={styles.flightNumber}>{flight.flight.number}</Text>
                    </View>
                    <StatusChip status={flight.flight.status} />
                </View>

                <View style={styles.routeRow}>
                    <View style={styles.routeEndpoint}>
                        <Text style={styles.iataCode}>{isDeparture ? 'LGW' : cityCode}</Text>
                        <Text style={styles.cityName}>{isDeparture ? 'Gatwick' : city}</Text>
                    </View>

                    <View style={styles.routeMiddle}>
                        <View style={styles.routeLine}>
                            <View style={styles.dot} />
                            <View style={styles.line} />
                            <Text style={styles.planeIcon}>{isDeparture ? '✈️' : '🛬'}</Text>
                            <View style={styles.line} />
                            <View style={styles.dot} />
                        </View>
                    </View>

                    <View style={[styles.routeEndpoint, styles.routeEndpointRight]}>
                        <Text style={styles.iataCode}>{isDeparture ? cityCode : 'LGW'}</Text>
                        <Text style={styles.cityName}>{isDeparture ? city : 'Gatwick'}</Text>
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.infoChip}>
                        <Text style={styles.infoLabel}>TIME</Text>
                        <Text style={[styles.infoValue, hasDelay ? styles.delayed : null]}>{formatTime(time)}</Text>
                    </View>
                    <View style={styles.infoChip}>
                        <Text style={styles.infoLabel}>TERMINAL</Text>
                        <Text style={styles.infoValue}>{terminal || '—'}</Text>
                    </View>
                    <View style={styles.infoChip}>
                        <Text style={styles.infoLabel}>GATE</Text>
                        <Text style={styles.infoValue}>{gate || '—'}</Text>
                    </View>
                    {hasDelay && (
                        <View style={styles.delayChip}>
                            <Text style={styles.delayText}>+{flight.flight.delay}m</Text>
                        </View>
                    )}
                </View>
            </GlassCard>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    airlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    airlineCode: {
        color: '#00A0B2',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
    },
    flightNumber: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontWeight: '500',
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    routeEndpoint: {
        flex: 1,
    },
    routeEndpointRight: {
        alignItems: 'flex-end',
    },
    iataCode: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    cityName: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        marginTop: 2,
    },
    routeMiddle: {
        flex: 1.5,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    routeLine: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    planeIcon: {
        fontSize: 16,
        marginHorizontal: 6,
    },
    bottomRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    infoChip: {
        flex: 1,
    },
    infoLabel: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    infoValue: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    delayed: {
        color: '#F87171',
    },
    delayChip: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    delayText: {
        color: '#F87171',
        fontSize: 13,
        fontWeight: '700',
    },
});
