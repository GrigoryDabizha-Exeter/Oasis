import React, { useEffect } from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface GlassCardProps extends ViewProps {
    children: React.ReactNode;
    elevated?: boolean;
    highlight?: boolean;
    className?: string;
}

export default function GlassCard({ children, elevated, highlight, style, className, ...props }: GlassCardProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(12);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View
            style={[
                styles.card,
                elevated && styles.elevated,
                highlight && styles.highlight,
                animatedStyle,
                style,
            ]}
            accessibilityRole="summary"
            {...props}
        >
            {highlight && <View style={styles.innerGlow} />}
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 16,
        overflow: 'hidden',
        ...(Platform.OS === 'web'
            ? { backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }
            : {}),
    },
    elevated: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
        elevation: 8,
    },
    highlight: {
        borderColor: 'rgba(0, 160, 178, 0.3)',
        shadowColor: '#00A0B2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 4,
    },
    innerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(0, 160, 178, 0.3)',
    },
});
