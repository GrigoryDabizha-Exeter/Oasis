import React, { useEffect } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
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
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#2A2A2A',
        borderRadius: 0,
        padding: 16,
        overflow: 'hidden',
    },
    elevated: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333333',
        elevation: 2,
    },
    highlight: {
        borderColor: '#FFFFFF',
        elevation: 2,
    },
    innerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#FFFFFF',
    },
});
