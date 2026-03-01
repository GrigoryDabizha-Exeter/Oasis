import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { borderRadius, colors, spacing } from '../../theme/tokens';
import { FlightData } from '../../services/types';

// ─── Airline branding ────────────────────────────────────────────────────────
const AIRLINE_COLORS: Record<string, string> = {
    BA: '#1B3D8E', EZY: '#FF6600', TK: '#CC0000',
    VS: '#C8102E', FR: '#003087', U2: '#FF6600',
    IB: '#D70029', LH: '#00308F',
};
function getAirlineColor(code: string): string {
    return AIRLINE_COLORS[code] ?? colors.bondi.DEFAULT;
}

// ─── Status pill config ───────────────────────────────────────────────────────
type FlightStatus = FlightData['flight']['status'];
const STATUS_CONFIG: Record<FlightStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
    scheduled: { label: 'Scheduled', dot: colors.bondi.DEFAULT, text: colors.bondi.DEFAULT, bg: 'rgba(0,160,178,0.12)', border: 'rgba(0,160,178,0.28)' },
    boarding:  { label: 'Boarding',  dot: '#F59E0B', text: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.32)' },
    active:    { label: 'In Flight', dot: '#22C55E', text: '#22C55E', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.28)'  },
    'en-route':{ label: 'En Route',  dot: '#22C55E', text: '#22C55E', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.28)'  },
    landed:    { label: 'Landed',    dot: '#3B82F6', text: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.28)' },
    cancelled: { label: 'Cancelled', dot: '#EF4444', text: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.28)'  },
    incident:  { label: 'Incident',  dot: '#EF4444', text: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.28)'  },
    diverted:  { label: 'Diverted',  dot: '#F59E0B', text: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.32)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTimeUntilDeparture(scheduledTime: string): { text: string; urgent: boolean } {
    const now = new Date();
    const [h, m] = scheduledTime.split(':').map(Number);
    const dep = new Date();
    dep.setHours(h, m, 0, 0);
    if (dep < now) dep.setDate(dep.getDate() + 1);
    const diffMins = Math.round((dep.getTime() - now.getTime()) / 60000);
    if (diffMins <= 0)  return { text: 'Departed', urgent: false };
    if (diffMins <= 30) return { text: `Boarding in ${diffMins}m`, urgent: true };
    if (diffMins <= 60) return { text: `${diffMins}m to departure`, urgent: false };
    return { text: `${Math.floor(diffMins / 60)}h ${diffMins % 60}m to departure`, urgent: false };
}

function getDepartureProgress(scheduledTime: string): number {
    const now = new Date();
    const [h, m] = scheduledTime.split(':').map(Number);
    const dep = new Date();
    dep.setHours(h, m, 0, 0);
    if (dep < now) dep.setDate(dep.getDate() + 1);
    const diffMs = dep.getTime() - now.getTime();
    return Math.max(0, Math.min(1, 1 - diffMs / (3 * 60 * 60 * 1000)));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusPill({ status, loading }: { status?: FlightStatus; loading?: boolean }) {
    const cfg = status ? STATUS_CONFIG[status] : null;
    return (
        <View style={[
            styles.statusPill,
            {
                backgroundColor: cfg?.bg ?? 'rgba(255,255,255,0.06)',
                borderColor:     cfg?.border ?? 'rgba(255,255,255,0.1)',
            },
        ]}>
            <View style={[styles.statusDot, { backgroundColor: cfg?.dot ?? colors.text.tertiary }]} />
            <Text style={[styles.statusPillText, { color: cfg?.text ?? colors.text.tertiary }]}>
                {loading ? 'Loading…' : (cfg?.label ?? 'Unknown')}
            </Text>
        </View>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HeroFlightCard() {
    const flightNumber = useAuthStore((s) => s.flightNumber);
    const departures   = useFlightStore((s) => s.departures);

    const myFlight = departures.find(
        (f) => f.flight.iataNumber.replace(/\s/g, '').toUpperCase() ===
               (flightNumber ?? '').replace(/\s/g, '').toUpperCase()
    );

    // Gate pulse glow animation
    const gatePulse = useSharedValue(1);
    useEffect(() => {
        gatePulse.value = withRepeat(
            withSequence(
                withTiming(0.45, { duration: 1800 }),
                withTiming(1,    { duration: 1800 })
            ),
            -1,
            false
        );
    }, []);
    const gatePulseStyle = useAnimatedStyle(() => ({ opacity: gatePulse.value }));

    if (!flightNumber) return null;

    // ── Placeholder (flight not yet matched) ──────────────────────────────────
    if (!myFlight) {
        return (
            <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
                <View style={styles.topRow}>
                    <Text style={styles.flightNumber}>{flightNumber}</Text>
                    <StatusPill loading />
                </View>

                <View style={styles.accentLine} />

                <View style={styles.middleRow}>
                    <View style={styles.destinationBlock}>
                        <Text style={styles.routeLabel}>DESTINATION</Text>
                        <Text style={styles.destCode}>—</Text>
                        <Text style={styles.departureDetail}>––:–– · Terminal –</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.gateBlock}>
                        <Text style={styles.gateLabel}>GATE</Text>
                        <Text style={styles.waitInLounge}>{'Wait in\nLounge'}</Text>
                    </View>
                </View>

                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '0%', backgroundColor: colors.bondi.DEFAULT }]} />
                </View>
                <Text style={styles.progressHint}>Gate assignment pending</Text>
            </Animated.View>
        );
    }

    // ── Full card ─────────────────────────────────────────────────────────────
    const gate        = myFlight.departure.gate && myFlight.departure.gate !== '—' ? myFlight.departure.gate : null;
    const delay       = myFlight.flight.delay ?? 0;
    const { text: timeText, urgent } = getTimeUntilDeparture(myFlight.departure.scheduledTime);
    const progress    = getDepartureProgress(myFlight.departure.scheduledTime);
    const progressClr = urgent ? '#F59E0B' : colors.bondi.DEFAULT;

    return (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>

            {/* ── Top Row: airline badge + flight number | delay + status ── */}
            <View style={styles.topRow}>
                <View style={styles.flightNumberBlock}>
                    <View style={[styles.airlineBadge, { backgroundColor: getAirlineColor(myFlight.airline.iataCode) }]}>
                        <Text style={styles.airlineCode}>{myFlight.airline.iataCode}</Text>
                    </View>
                    <View>
                        <Text style={styles.airlineName}>{myFlight.airline.name}</Text>
                        <Text style={styles.flightNumber}>{myFlight.flight.iataNumber}</Text>
                    </View>
                </View>

                <View style={styles.pillsRow}>
                    {delay > 0 && (
                        <View style={styles.delayPill}>
                            <Text style={styles.delayText}>+{delay}m</Text>
                        </View>
                    )}
                    <StatusPill status={myFlight.flight.status} />
                </View>
            </View>

            {/* ── Thin cyan accent separator ── */}
            <View style={styles.accentLine} />

            {/* ── Middle Row: destination left | gate right ── */}
            <View style={styles.middleRow}>

                {/* Left: Destination */}
                <View style={styles.destinationBlock}>
                    <Text style={styles.routeLabel}>
                        {myFlight.departure.iataCode}  →  {myFlight.arrival.iataCode}
                    </Text>
                    <Text style={styles.destCode}>{myFlight.arrival.iataCode}</Text>
                    <Text style={styles.departureDetail}>
                        {myFlight.departure.scheduledTime}
                        {myFlight.departure.terminal ? `  ·  Terminal ${myFlight.departure.terminal}` : ''}
                    </Text>
                    {urgent ? (
                        <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>{timeText}</Text>
                        </View>
                    ) : (
                        <Text style={styles.timeUntilText}>{timeText}</Text>
                    )}
                </View>

                {/* Vertical divider */}
                <View style={styles.divider} />

                {/* Right: Gate */}
                <View style={styles.gateBlock}>
                    <Text style={styles.gateLabel}>GATE</Text>
                    {gate ? (
                        <>
                            <Animated.Text style={[styles.gateNumber, gatePulseStyle]}>
                                {gate}
                            </Animated.Text>
                            <Text style={styles.gateTerminal}>
                                Terminal {myFlight.departure.terminal}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.waitInLounge}>{'Wait in\nLounge'}</Text>
                    )}
                </View>
            </View>

            {/* ── Progress bar ── */}
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${Math.round(progress * 100)}%`, backgroundColor: progressClr },
                    ]}
                />
            </View>
            <Text style={styles.progressHint}>
                {gate
                    ? (urgent ? 'Board now — gate closes soon' : 'Boarding soon')
                    : 'Gate assignment pending'}
            </Text>
        </Animated.View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        ...glassStyles.cardElevated,
        borderColor: 'rgba(0, 160, 178, 0.22)',
        padding: spacing.lg,
        marginBottom: spacing.md,
    },

    // Top row
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm + 2,
    },
    flightNumberBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    airlineBadge: {
        width: 36,
        height: 36,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    airlineCode: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    airlineName: {
        fontSize: 10,
        fontWeight: '500',
        color: colors.text.tertiary,
        letterSpacing: 0.2,
        marginBottom: 1,
    },
    flightNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: 0.4,
    },
    pillsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    delayPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(245,158,11,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.3)',
    },
    delayText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#F59E0B',
    },

    // Accent separator
    accentLine: {
        height: 1,
        backgroundColor: 'rgba(0, 160, 178, 0.18)',
        marginBottom: spacing.md,
    },

    // Middle row
    middleRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: spacing.md,
    },
    destinationBlock: {
        flex: 1,
        paddingRight: spacing.md,
    },
    routeLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.text.tertiary,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    destCode: {
        fontSize: 54,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -2,
        lineHeight: 58,
        marginBottom: 6,
    },
    departureDetail: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.text.secondary,
        marginBottom: 8,
        letterSpacing: 0.1,
    },
    timeUntilText: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.text.tertiary,
    },
    urgentBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(245,158,11,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.3)',
    },
    urgentText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#F59E0B',
    },

    // Divider
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: 2,
    },

    // Gate block
    gateBlock: {
        width: 112,
        paddingLeft: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.text.tertiary,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    gateNumber: {
        fontSize: 64,
        fontWeight: '800',
        color: '#4DD0E1',          // bondi.300 — bright cyan pop
        letterSpacing: -2,
        lineHeight: 70,
        textShadowColor: 'rgba(77, 208, 225, 0.35)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 16,
    },
    gateTerminal: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.text.secondary,
        marginTop: 4,
        textAlign: 'center',
    },
    waitInLounge: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.tertiary,
        textAlign: 'center',
        lineHeight: 22,
    },

    // Progress
    progressTrack: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 2,
        marginBottom: spacing.xs,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressHint: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.text.tertiary,
        letterSpacing: 0.2,
    },
});
