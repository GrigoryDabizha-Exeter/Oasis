import React, { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    SlideInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { OrderStatus, useOrderStore } from '../../stores/useOrderStore';
import { glassStyles } from '../../theme/glassStyles';
import { borderRadius, colors, spacing, typography } from '../../theme/tokens';

const STATUS_CONFIG: Record<OrderStatus, { label: string; emoji: string; progress: number; color: string }> = {
    preparing: { label: 'Preparing Your Order', emoji: '👨‍🍳', progress: 0.33, color: '#F59E0B' },
    en_route: { label: 'Droid En Route to Gate', emoji: '🤖', progress: 0.66, color: colors.bondi.DEFAULT },
    arrived: { label: 'Droid Arrived!', emoji: '📦', progress: 1.0, color: '#22C55E' },
};

interface RobotTrackerCardProps {
    onPinPress?: () => void;
}

export default function RobotTrackerCard({ onPinPress }: RobotTrackerCardProps) {
    const activeOrder = useOrderStore((s) => s.activeOrder);

    // Pulsing animation for the progress indicator
    const pulseOpacity = useSharedValue(1);
    useEffect(() => {
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ),
            -1,
            false
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    // Droid sliding animation
    const droidPosition = useSharedValue(0);
    useEffect(() => {
        if (activeOrder) {
            const config = STATUS_CONFIG[activeOrder.status];
            droidPosition.value = withTiming(config.progress * 100, { duration: 1200 });
        }
    }, [activeOrder?.status]);

    const droidSlideStyle = useAnimatedStyle(() => ({
        left: `${droidPosition.value}%` as any,
    }));

    if (!activeOrder) return null;

    const config = STATUS_CONFIG[activeOrder.status];

    return (
        <Animated.View entering={SlideInDown.duration(500)} style={styles.container}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <Animated.View style={[styles.statusDot, { backgroundColor: config.color }, pulseStyle]} />
                    <Text style={styles.headerLabel}>OASIS DROID SECURE DELIVERY</Text>
                </View>
                <View style={[styles.pinBadge, { borderColor: `${config.color}44` }]}>
                    <Text style={styles.pinLabel}>PIN:</Text>
                    <Text style={[styles.pinValue, { color: config.color }]}>{activeOrder.pin}</Text>
                </View>
            </View>

            {/* Item & Gate */}
            <View style={styles.orderInfoRow}>
                <Text style={styles.itemName}>{config.emoji} {activeOrder.item}</Text>
                <Text style={styles.gateText}>→ Gate {activeOrder.gate}</Text>
            </View>

            {/* Progress Track */}
            <View style={styles.progressTrack}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        {
                            width: `${config.progress * 100}%`,
                            backgroundColor: config.color,
                        },
                    ]}
                />
                {/* Step dots */}
                <View style={[styles.stepDot, { left: '0%' }, activeOrder.status !== 'preparing' && { backgroundColor: config.color }]}>
                    <Text style={styles.stepEmoji}>👨‍🍳</Text>
                </View>
                <View style={[styles.stepDot, { left: '50%' }, (activeOrder.status === 'en_route' || activeOrder.status === 'arrived') && { backgroundColor: config.color }]}>
                    <Text style={styles.stepEmoji}>🤖</Text>
                </View>
                <View style={[styles.stepDot, { left: '100%' }, activeOrder.status === 'arrived' && { backgroundColor: config.color }]}>
                    <Text style={styles.stepEmoji}>📦</Text>
                </View>
            </View>

            {/* Step labels */}
            <View style={styles.stepLabels}>
                <Text style={styles.stepLabelText}>Preparing</Text>
                <Text style={styles.stepLabelText}>En Route</Text>
                <Text style={styles.stepLabelText}>Arrived</Text>
            </View>

            {/* Status text */}
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>

            {/* Unlock Button (only when arrived) */}
            {activeOrder.status === 'arrived' && onPinPress && (
                <TouchableOpacity
                    style={styles.unlockBtn}
                    onPress={onPinPress}
                    activeOpacity={0.85}
                >
                    <Text style={styles.unlockBtnText}>🔓 Robot Arrived! Enter PIN</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...glassStyles.cardElevated,
        borderColor: 'rgba(0, 160, 178, 0.25)',
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    headerLabel: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.5,
        color: colors.text.secondary,
    },
    pinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    pinLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.text.tertiary,
    },
    pinValue: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
    orderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    itemName: {
        ...typography.bodyBold,
        color: colors.text.primary,
        fontSize: 16,
    },
    gateText: {
        ...typography.caption,
        color: colors.bondi.DEFAULT,
        fontWeight: '600',
    },
    progressTrack: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 2,
        marginBottom: 8,
        position: 'relative',
        marginHorizontal: 12,
    },
    progressFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        borderRadius: 2,
    },
    stepDot: {
        position: 'absolute',
        top: -10,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateX: -12 }],
    },
    stepEmoji: {
        fontSize: 12,
    },
    stepLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginHorizontal: 0,
    },
    stepLabelText: {
        fontSize: 9,
        fontWeight: '600',
        color: colors.text.tertiary,
        letterSpacing: 0.5,
    },
    statusText: {
        ...typography.caption,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: spacing.sm,
        letterSpacing: 0.5,
    },
    unlockBtn: {
        marginTop: spacing.md,
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.4)',
        borderRadius: borderRadius.md,
        paddingVertical: 14,
        alignItems: 'center',
    },
    unlockBtnText: {
        ...typography.bodyBold,
        color: '#22C55E',
        fontSize: 15,
    },
});
