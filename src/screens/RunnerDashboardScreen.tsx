import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../stores/useAuthStore';
import { glassStyles } from '../theme/glassStyles';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';

interface Order {
    id: string;
    item: string;
    gate: string;
    terminal: string;
    status: 'pending' | 'accepted';
    time: string;
    price: string;
    icon: string;
}

const MOCK_ORDERS: Order[] = [
    {
        id: '1',
        item: 'Flat White',
        gate: '45',
        terminal: 'South',
        status: 'pending',
        time: '2 min ago',
        price: '0.05 SOL',
        icon: '☕',
    },
    {
        id: '2',
        item: 'Noise-Cancelling Headphones',
        gate: '12',
        terminal: 'North',
        status: 'pending',
        time: '5 min ago',
        price: '1.20 SOL',
        icon: '🎧',
    },
    {
        id: '3',
        item: 'Travel Pillow',
        gate: '7',
        terminal: 'South',
        status: 'pending',
        time: '8 min ago',
        price: '0.35 SOL',
        icon: '🛏️',
    },
];

export default function RunnerDashboardScreen() {
    const user = useAuthStore((s) => s.user);
    const zustandLogout = useAuthStore((s) => s.logout);
    const { clearSession } = useAuth0();
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const acceptedCount = orders.filter((o) => o.status === 'accepted').length;

    const handleLogout = async () => {
        try {
            await clearSession();
        } catch (e) {
            console.error('Auth0 clearSession error:', e);
        }
        zustandLogout();
    };

    const handleAccept = (orderId: string) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId ? { ...o, status: 'accepted' as const } : o
            )
        );
    };

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
                        <Text style={styles.labelText}>OASIS RUNNER</Text>
                        <Text style={styles.greeting}>
                            Hey, {user?.name?.split(' ')[0] ?? 'Runner'} 🏃
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Stats Row */}
                <Animated.View
                    entering={FadeInDown.duration(500).delay(250)}
                    style={styles.statsRow}
                >
                    <View style={[styles.statCard, styles.statPending]}>
                        <Text style={styles.statNumber}>{pendingCount}</Text>
                        <Text style={styles.statLabel}>PENDING</Text>
                    </View>
                    <View style={[styles.statCard, styles.statAccepted]}>
                        <Text style={[styles.statNumber, { color: colors.status.onTime }]}>
                            {acceptedCount}
                        </Text>
                        <Text style={styles.statLabel}>ACCEPTED</Text>
                    </View>
                    <View style={[styles.statCard, styles.statEarnings]}>
                        <Text style={[styles.statNumber, { color: '#9945FF' }]}>
                            {orders
                                .filter((o) => o.status === 'accepted')
                                .reduce((sum, o) => sum + parseFloat(o.price), 0)
                                .toFixed(2)}
                        </Text>
                        <Text style={styles.statLabel}>SOL EARNED</Text>
                    </View>
                </Animated.View>

                {/* Section Title */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(400)}
                    style={styles.sectionHeader}
                >
                    <Text style={styles.sectionTitle}>Incoming Orders</Text>
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </Animated.View>

                {/* Order Cards */}
                {orders.map((order, index) => (
                    <Animated.View
                        key={order.id}
                        entering={FadeInDown.duration(400).delay(500 + index * 150)}
                    >
                        <View
                            style={[
                                styles.orderCard,
                                order.status === 'accepted' && styles.orderCardAccepted,
                            ]}
                        >
                            <View style={styles.orderTop}>
                                <View style={styles.orderLeft}>
                                    <View style={styles.orderIconCircle}>
                                        <Text style={styles.orderIcon}>{order.icon}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.orderItem}>{order.item}</Text>
                                        <Text style={styles.orderMeta}>
                                            Gate {order.gate} · {order.terminal} Terminal
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.orderRight}>
                                    <Text style={styles.orderPrice}>{order.price}</Text>
                                    <Text style={styles.orderTime}>{order.time}</Text>
                                </View>
                            </View>

                            {order.status === 'pending' ? (
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => handleAccept(order.id)}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.acceptText}>Accept Order</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.acceptedBadge}>
                                    <Text style={styles.acceptedText}>
                                        ✓ Accepted — Deliver to Gate {order.gate}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                ))}

                {/* Tips */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(1000)}
                    style={styles.tipCard}
                >
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>
                        Runners earn 10% commission on each delivery paid directly to your Solana wallet
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
    scroll: {
        flex: 1,
    },
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
    statPending: {},
    statAccepted: {},
    statEarnings: {},
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.bondi.DEFAULT,
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
    },
    orderCardAccepted: {
        borderColor: 'rgba(34, 197, 94, 0.3)',
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
    },
    orderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
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
    orderIcon: {
        fontSize: 22,
    },
    orderItem: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    orderMeta: {
        ...typography.caption,
        color: colors.text.secondary,
        marginTop: 2,
    },
    orderRight: {
        alignItems: 'flex-end',
    },
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
        paddingVertical: 12,
        alignItems: 'center',
    },
    acceptText: {
        ...typography.bodyBold,
        color: '#FFFFFF',
    },
    acceptedBadge: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    acceptedText: {
        ...typography.caption,
        color: colors.status.onTime,
        fontWeight: '600',
    },
    tipCard: {
        ...glassStyles.surface,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    tipIcon: {
        fontSize: 20,
    },
    tipText: {
        ...typography.caption,
        color: colors.text.secondary,
        flex: 1,
    },
});
