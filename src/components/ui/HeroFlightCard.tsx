import React, { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFlightStore } from '../../stores/useFlightStore';
import { glassStyles } from '../../theme/glassStyles';
import { borderRadius, colors, spacing, typography } from '../../theme/tokens';

// Airline branding
const AIRLINE_COLORS: Record<string, string> = {
    BA: '#1B3D8E', EZY: '#FF6600', TK: '#CC0000', VS: '#E00',
    FR: '#003087', U2: '#FF6600', IB: '#D70029', LH: '#00308F',
};

function getAirlineColor(code: string): string {
    return AIRLINE_COLORS[code] ?? colors.bondi.DEFAULT;
}

function getTimeUntilDeparture(scheduledTime: string): { text: string; urgent: boolean } {
    const now = new Date();
    const [hours, mins] = scheduledTime.split(':').map(Number);
    const dep = new Date();
    dep.setHours(hours, mins, 0, 0);
    if (dep < now) dep.setDate(dep.getDate() + 1);

    const diffMs = dep.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins <= 0) return { text: 'Departed', urgent: false };
    if (diffMins <= 30) return { text: `Boarding in ${diffMins}m`, urgent: true };
    if (diffMins <= 60) return { text: `${diffMins}m until departure`, urgent: false };
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return { text: `${h}h ${m}m until departure`, urgent: false };
}

function getDepartureProgress(scheduledTime: string): number {
    const now = new Date();
    const [hours, mins] = scheduledTime.split(':').map(Number);
    const dep = new Date();
    dep.setHours(hours, mins, 0, 0);
    if (dep < now) dep.setDate(dep.getDate() + 1);

    const diffMs = dep.getTime() - now.getTime();
    const totalWindow = 3 * 60 * 60 * 1000; // 3 hour window
    return Math.max(0, Math.min(1, 1 - diffMs / totalWindow));
}

export default function HeroFlightCard() {
    const flightNumber = useAuthStore((s) => s.flightNumber);
    const departures = useFlightStore((s) => s.departures);

    // Find user's flight
    const myFlight = departures.find((f) =>
        f.flight.iataNumber.replace(/\s/g, '').toUpperCase() ===
        (flightNumber ?? '').replace(/\s/g, '').toUpperCase()
    );

    // Pulsing gate animation
    const gatePulse = useSharedValue(1);
    useEffect(() => {
        gatePulse.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1500 }),
                withTiming(1, { duration: 1500 })
            ),
            -1,
            false
        );
    }, []);
    const gatePulseStyle = useAnimatedStyle(() => ({
        opacity: gatePulse.value,
    }));

    if (!myFlight) {
        // Show a placeholder card for the flight number
        if (!flightNumber) return null;
        return (
            <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionLabel}>YOUR FLIGHT</Text>
                    <Text style={styles.flightCode}>{flightNumber}</Text>
                </View>
                <View style={styles.gateSection}>
                    <Text style={styles.gateLabel}>GATE</Text>
                    <Text style={styles.gateNumber}>—</Text>
                    <Text style={styles.gateHint}>Wait in Lounge</Text>
                </View>
                <Text style={styles.statusText}>Gate assignment pending</Text>
            </Animated.View>
        );
    }

    const gate = myFlight.departure.gate !== '—' ? myFlight.departure.gate : null;
    const airline = myFlight.airline;
    const { text: timeText, urgent } = getTimeUntilDeparture(myFlight.departure.scheduledTime);
    const progress = getDepartureProgress(myFlight.departure.scheduledTime);
    const airlineColor = getAirlineColor(airline.iataCode);
    const delay = myFlight.flight.delay ?? 0;

    return (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
            {/* Airline & Flight */}
            <View style={styles.headerRow}>
                <View style={styles.airlineInfo}>
                    <View style={[styles.airlineBadge, { backgroundColor: airlineColor }]}>
                        <Text style={styles.airlineCode}>{airline.iataCode}</Text>
                    </View>
                    <View>
                        <Text style={styles.airlineName}>{airline.name}</Text>
                        <Text style={styles.flightCode}>{myFlight.flight.iataNumber}</Text>
                    </View>
                </View>
                <View style={styles.routeInfo}>
                    <Text style={styles.routeText}>
                        {myFlight.departure.iataCode} → {myFlight.arrival.iataCode}
                    </Text>
                    {delay > 0 && (
                        <View style={styles.delayBadge}>
                            <Text style={styles.delayText}>+{delay}m</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Giant Gate Number */}
            <View style={styles.gateSection}>
                <Text style={styles.gateLabel}>GATE</Text>
                <Animated.Text style={[styles.gateNumber, gate && gatePulseStyle]}>
                    {gate ?? '—'}
                </Animated.Text>
                <Text style={styles.gateHint}>
                    {gate ? `Terminal ${myFlight.departure.terminal}` : 'Wait in Lounge'}
                </Text>
            </View>

            {/* Status & Time */}
            <View style={styles.statusRow}>
                <View
                    style={[
                        styles.statusBadge,
                        urgent && styles.statusBadgeUrgent,
                    ]}
                >
                    <Text style={[styles.statusText, urgent && styles.statusTextUrgent]}>
                        {urgent ? '⚠️ ' : '✈️ '}{timeText}
                    </Text>
                </View>
                <Text style={styles.depTime}>{myFlight.departure.scheduledTime}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progress * 100}%`,
                            backgroundColor: urgent ? '#F59E0B' : colors.bondi.DEFAULT,
                        },
                    ]}
                />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...glassStyles.cardElevated,
        borderColor: 'rgba(0, 160, 178, 0.25)',
        padding: spacing.md + 4,
        marginBottom: spacing.md,
    },
    sectionLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.bondi.DEFAULT,
        letterSpacing: 1.5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    airlineInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    airlineBadge: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    airlineCode: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    airlineName: {
        ...typography.caption,
        color: colors.text.secondary,
    },
    flightCode: {
        ...typography.bodyBold,
        color: colors.text.primary,
        fontSize: 15,
    },
    routeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    routeText: {
        ...typography.caption,
        color: colors.bondi.DEFAULT,
        fontWeight: '600',
    },
    delayBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    delayText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#F59E0B',
    },
    gateSection: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    gateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.text.tertiary,
        letterSpacing: 2,
        marginBottom: 4,
    },
    gateNumber: {
        fontSize: 72,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -2,
        lineHeight: 80,
    },
    gateHint: {
        ...typography.caption,
        color: colors.text.secondary,
        marginTop: 4,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(0, 160, 178, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 160, 178, 0.2)',
    },
    statusBadgeUrgent: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    statusText: {
        ...typography.caption,
        color: colors.bondi.DEFAULT,
        fontWeight: '600',
    },
    statusTextUrgent: {
        color: '#F59E0B',
    },
    depTime: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    progressTrack: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 2,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
