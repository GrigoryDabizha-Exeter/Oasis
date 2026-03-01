import React, { useEffect, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { SupabaseOrder, supabase } from '../services/supabaseClient';
import { useAuthStore } from '../stores/useAuthStore';
import { useOrderStore } from '../stores/useOrderStore';
import { glassStyles } from '../theme/glassStyles';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';

type VendorOrderStatus = 'new' | 'droid_arriving' | 'loading' | 'dispatched';
type CloudStatus = 'connecting' | 'live' | 'error';

export default function VendorDashboardScreen() {
    const user = useAuthStore((s) => s.user);
    const shopName = useAuthStore((s) => s.shopName);
    const zustandLogout = useAuthStore((s) => s.logout);
    const { clearSession } = useAuth0();

    const activeOrder = useOrderStore((s) => s.activeOrder);
    const placeOrder  = useOrderStore((s) => s.placeOrder);
    const setOrderStatus = useOrderStore((s) => s.setOrderStatus);
    const clearOrder = useOrderStore((s) => s.clearOrder);

    const [vendorStatus, setVendorStatus] = useState<VendorOrderStatus>('new');
    const [droidTimer, setDroidTimer] = useState<number>(0);
    const [cloudStatus, setCloudStatus] = useState<CloudStatus>('connecting');
    const [queuedOrders, setQueuedOrders] = useState<SupabaseOrder[]>([]);

    // Check if order matches this shop
    const hasOrder = activeOrder && activeOrder.shopName === shopName && activeOrder.status === 'preparing';
    const isMyOrder = activeOrder && activeOrder.shopName === shopName;

    // Reset vendor status when a new order comes in
    useEffect(() => {
        if (hasOrder && vendorStatus === 'dispatched') {
            setVendorStatus('new');
        }
        if (!isMyOrder) {
            setVendorStatus('new');
        }
    }, [activeOrder?.orderedAt]);

    // Droid arrival timer
    useEffect(() => {
        if (vendorStatus === 'droid_arriving') {
            setDroidTimer(5);
            const interval = setInterval(() => {
                setDroidTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setVendorStatus('loading');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [vendorStatus]);

    // ── Supabase realtime subscription ───────────────────────────────────────
    useEffect(() => {
        // Fetch any pending orders that already exist in the DB
        const loadExisting = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: true });

            if (error) { setCloudStatus('error'); return; }

            const relevant = (data ?? []).filter(
                (o: SupabaseOrder) => !shopName || o.shop_name === shopName
            );

            if (relevant.length > 0 && !useOrderStore.getState().activeOrder) {
                const first = relevant[0];
                placeOrder(
                    first.item,
                    first.gate ?? 'TBD',
                    first.price ?? 0,
                    first.shop_name ?? shopName ?? 'Shop',
                    first.passenger_name ?? 'Passenger',
                );
                setQueuedOrders(relevant.slice(1));
            } else {
                setQueuedOrders(relevant);
            }
        };

        loadExisting();

        // Subscribe to new inserts in real-time
        const channel = supabase
            .channel('vendor-orders')
            .on(
                'postgres_changes' as const,
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload: { new: SupabaseOrder }) => {
                    const incoming = payload.new;
                    if (shopName && incoming.shop_name !== shopName) return;

                    if (!useOrderStore.getState().activeOrder) {
                        placeOrder(
                            incoming.item,
                            incoming.gate ?? 'TBD',
                            incoming.price ?? 0,
                            incoming.shop_name ?? shopName ?? 'Shop',
                            incoming.passenger_name ?? 'Passenger',
                        );
                    } else {
                        setQueuedOrders((prev) => [incoming, ...prev]);
                    }
                }
            )
            .subscribe((status: string) => {
                setCloudStatus(
                    status === 'SUBSCRIBED'     ? 'live'
                    : status === 'CHANNEL_ERROR' ? 'error'
                    : 'connecting'
                );
            });

        return () => { supabase.removeChannel(channel); };
    }, [shopName]);

    // Pulsing live dot
    const pulseOpacity = useSharedValue(1);
    useEffect(() => {
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(0.3, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ),
            -1,
            false
        );
    }, []);
    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    const handleAcceptOrder = () => {
        setVendorStatus('droid_arriving');
    };

    const handleDispatch = () => {
        // Update the shared order store — passenger will see "en_route"
        setOrderStatus('en_route');
        setVendorStatus('dispatched');
        // Simulate droid arriving at gate after 8 seconds
        setTimeout(() => {
            const current = useOrderStore.getState().activeOrder;
            if (current && current.status === 'en_route') {
                setOrderStatus('arrived');
            }
        }, 8000);
    };

    const handleLogout = async () => {
        try {
            await clearSession();
        } catch (e) {
            console.error('Auth0 clearSession error:', e);
        }
        zustandLogout();
    };

    const totalOrders = isMyOrder ? 1 : 0;
    const dispatchedCount = vendorStatus === 'dispatched' ? 1 : 0;

    return (
        <View style={styles.container}>
            <View style={styles.gradientOverlay} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View
                    entering={FadeInUp.duration(500).delay(100)}
                    style={styles.header}
                >
                    <View>
                        <Text style={styles.labelText}>🏪 {shopName?.toUpperCase() ?? 'SHOP'} DASHBOARD</Text>
                        <Text style={styles.greeting}>
                            Hey, {user?.name?.split(' ')[0] ?? 'Partner'} 👋
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        {/* Live from Cloud badge */}
                        <View style={[
                            styles.cloudBadge,
                            cloudStatus === 'live'        && styles.cloudBadgeLive,
                            cloudStatus === 'error'       && styles.cloudBadgeError,
                            cloudStatus === 'connecting'  && styles.cloudBadgeConnecting,
                        ]}>
                            <View style={[
                                styles.cloudDot,
                                cloudStatus === 'live'       && { backgroundColor: '#22C55E' },
                                cloudStatus === 'error'      && { backgroundColor: '#EF4444' },
                                cloudStatus === 'connecting' && { backgroundColor: '#F59E0B' },
                            ]} />
                            <Text style={[
                                styles.cloudBadgeText,
                                cloudStatus === 'live'       && { color: '#22C55E' },
                                cloudStatus === 'error'      && { color: '#EF4444' },
                                cloudStatus === 'connecting' && { color: '#F59E0B' },
                            ]}>
                                {cloudStatus === 'live' ? '☁ LIVE' : cloudStatus === 'error' ? '☁ OFFLINE' : '☁ SYNC…'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.logoutBtn}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.logoutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Stats */}
                <Animated.View
                    entering={FadeInDown.duration(500).delay(250)}
                    style={styles.statsRow}
                >
                    <View style={[styles.statCard]}>
                        <Text style={[styles.statNumber, { color: colors.bondi.DEFAULT }]}>{totalOrders}</Text>
                        <Text style={styles.statLabel}>INCOMING</Text>
                    </View>
                    <View style={[styles.statCard]}>
                        <Text style={[styles.statNumber, { color: '#22C55E' }]}>{dispatchedCount}</Text>
                        <Text style={styles.statLabel}>DISPATCHED</Text>
                    </View>
                    <View style={[styles.statCard]}>
                        <Text style={[styles.statNumber, { color: '#9945FF' }]}>
                            {isMyOrder ? activeOrder?.price?.toFixed(2) ?? '0.00' : '0.00'}
                        </Text>
                        <Text style={styles.statLabel}>SOL EARNED</Text>
                    </View>
                </Animated.View>

                {/* Section Title */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(400)}
                    style={styles.sectionHeader}
                >
                    <Text style={styles.sectionTitle}>Orders</Text>
                    <View style={styles.liveBadge}>
                        <Animated.View style={[styles.liveDot, pulseStyle]} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </Animated.View>

                {/* Order Card or Empty State */}
                {isMyOrder && vendorStatus !== 'dispatched' ? (
                    <Animated.View entering={FadeInDown.duration(400).delay(500)}>
                        <View style={styles.orderCard}>
                            {/* Order Header */}
                            <View style={styles.orderTop}>
                                <View style={styles.orderLeft}>
                                    <View style={styles.orderIconCircle}>
                                        <Text style={styles.orderIcon}>📦</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.orderItem}>{activeOrder?.item}</Text>
                                        <Text style={styles.orderMeta}>
                                            Gate {activeOrder?.gate} · {activeOrder?.passengerName ?? 'Passenger'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.orderRight}>
                                    <Text style={styles.orderPrice}>{activeOrder?.price} SOL</Text>
                                    <Text style={styles.orderTime}>PIN: {activeOrder?.pin}</Text>
                                </View>
                            </View>

                            {/* State 1: New Order */}
                            {vendorStatus === 'new' && (
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={handleAcceptOrder}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.acceptText}>🤖 Accept Order & Summon Droid</Text>
                                </TouchableOpacity>
                            )}

                            {/* State 2: Droid Arriving */}
                            {vendorStatus === 'droid_arriving' && (
                                <View style={styles.droidArrivingBox}>
                                    <Text style={styles.droidArrivingEmoji}>🤖</Text>
                                    <Text style={styles.droidArrivingText}>
                                        Droid navigating to shop... ({droidTimer}s)
                                    </Text>
                                    <View style={styles.droidProgress}>
                                        <Animated.View
                                            style={[
                                                styles.droidProgressFill,
                                                { width: `${((5 - droidTimer) / 5) * 100}%` },
                                            ]}
                                        />
                                    </View>
                                </View>
                            )}

                            {/* State 3: Load Droid */}
                            {vendorStatus === 'loading' && (
                                <>
                                    <View style={styles.droidArrivedBox}>
                                        <Text style={styles.droidArrivedText}>✅ Droid Arrived at {shopName}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.dispatchButton}
                                        onPress={handleDispatch}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.dispatchText}>📦 Load Order & Dispatch to Gate</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </Animated.View>
                ) : vendorStatus === 'dispatched' ? (
                    <Animated.View entering={FadeInDown.duration(400).delay(500)}>
                        <View style={styles.dispatchedCard}>
                            <Text style={styles.dispatchedEmoji}>🚀</Text>
                            <Text style={styles.dispatchedTitle}>Order Dispatched!</Text>
                            <Text style={styles.dispatchedSubtitle}>
                                Droid is delivering to Gate {activeOrder?.gate ?? '—'}
                            </Text>
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInDown.duration(400).delay(500)}>
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyEmoji}>☕</Text>
                            <Text style={styles.emptyTitle}>No orders yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Waiting for passengers to order from {shopName}
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Tip Card */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(700)}
                    style={styles.tipCard}
                >
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>
                        When a passenger orders from your shop, the droid will auto-route to your counter for pickup
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.cod.DEFAULT,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        ...(Platform.OS === 'web'
            ? {
                background:
                    'radial-gradient(ellipse at 20% 10%, rgba(153,69,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(0,160,178,0.06) 0%, transparent 50%)',
            }
            : {}),
    },
    scroll: { flex: 1 },
    scrollContent: {
        padding: spacing.lg,
        paddingTop: 60,
        paddingBottom: 40,
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    labelText: {
        ...typography.label,
        color: '#9945FF',
        marginBottom: 4,
    },
    greeting: {
        ...typography.h1,
        color: colors.text.primary,
    },
    logoutBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    logoutText: {
        ...typography.caption,
        color: colors.text.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        ...glassStyles.card,
        padding: spacing.md,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
    },
    statLabel: {
        ...typography.label,
        color: colors.text.tertiary,
        marginTop: 4,
        fontSize: 9,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text.primary,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
    liveText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#EF4444',
        letterSpacing: 1,
    },
    orderCard: {
        ...glassStyles.card,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderColor: 'rgba(0, 160, 178, 0.2)',
    },
    orderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    orderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    orderIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.glass.surface,
        borderWidth: 1,
        borderColor: colors.glass.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderIcon: { fontSize: 22 },
    orderItem: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    orderMeta: {
        ...typography.caption,
        color: colors.text.secondary,
        marginTop: 2,
    },
    orderRight: { alignItems: 'flex-end' },
    orderPrice: {
        ...typography.bodyBold,
        color: '#9945FF',
    },
    orderTime: {
        ...typography.caption,
        color: colors.text.tertiary,
        marginTop: 2,
    },
    acceptButton: {
        ...glassStyles.buttonPrimary,
        paddingVertical: 14,
        alignItems: 'center',
    },
    acceptText: {
        ...typography.bodyBold,
        color: '#FFFFFF',
        fontSize: 15,
    },
    droidArrivingBox: {
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: 'rgba(0, 160, 178, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0, 160, 178, 0.2)',
    },
    droidArrivingEmoji: { fontSize: 32, marginBottom: 8 },
    droidArrivingText: {
        ...typography.body,
        color: colors.bondi.DEFAULT,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    droidProgress: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 2,
    },
    droidProgressFill: {
        height: '100%',
        backgroundColor: colors.bondi.DEFAULT,
        borderRadius: 2,
    },
    droidArrivedBox: {
        padding: spacing.sm + 4,
        borderRadius: borderRadius.md,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    droidArrivedText: {
        ...typography.caption,
        color: '#22C55E',
        fontWeight: '600',
    },
    dispatchButton: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.4)',
        borderRadius: borderRadius.md,
        paddingVertical: 14,
        alignItems: 'center',
    },
    dispatchText: {
        ...typography.bodyBold,
        color: '#22C55E',
        fontSize: 15,
    },
    dispatchedCard: {
        ...glassStyles.card,
        padding: spacing.xl,
        alignItems: 'center',
        borderColor: 'rgba(34, 197, 94, 0.2)',
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
    },
    dispatchedEmoji: { fontSize: 40, marginBottom: spacing.sm },
    dispatchedTitle: {
        ...typography.h3,
        color: '#22C55E',
    },
    dispatchedSubtitle: {
        ...typography.caption,
        color: colors.text.secondary,
        marginTop: 6,
    },
    emptyCard: {
        ...glassStyles.card,
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyEmoji: { fontSize: 40, marginBottom: spacing.sm },
    emptyTitle: {
        ...typography.h3,
        color: colors.text.secondary,
    },
    emptySubtitle: {
        ...typography.caption,
        color: colors.text.tertiary,
        marginTop: 6,
        textAlign: 'center',
    },
    tipCard: {
        ...glassStyles.surface,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    tipIcon: { fontSize: 20 },
    tipText: {
        ...typography.caption,
        color: colors.text.secondary,
        flex: 1,
    },

    // Header right cluster
    headerRight: {
        alignItems: 'flex-end',
        gap: spacing.xs,
    },

    // Cloud status badge
    cloudBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cloudBadgeLive: {
        backgroundColor: 'rgba(34,197,94,0.1)',
        borderColor: 'rgba(34,197,94,0.3)',
    },
    cloudBadgeConnecting: {
        backgroundColor: 'rgba(245,158,11,0.1)',
        borderColor: 'rgba(245,158,11,0.3)',
    },
    cloudBadgeError: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderColor: 'rgba(239,68,68,0.3)',
    },
    cloudDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    cloudBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: 'rgba(255,255,255,0.4)',
    },
});
