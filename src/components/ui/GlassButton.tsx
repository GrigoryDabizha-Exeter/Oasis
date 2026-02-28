import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GlassButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    loading?: boolean;
}

export default function GlassButton({
    title,
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    onPress,
    disabled,
    style,
    ...props
}: GlassButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const handlePress = (e: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    const variantStyles = variant === 'primary'
        ? styles.primary
        : variant === 'secondary'
            ? styles.secondary
            : styles.ghost;

    const sizeStyles = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;
    const textVariant = variant === 'primary' ? styles.textPrimary : styles.textSecondary;
    const textSize = size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd;

    return (
        <AnimatedTouchable
            style={[variantStyles, sizeStyles, animatedStyle, disabled && styles.disabled, style]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={title}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <Text style={[textVariant, textSize]}>
                    {icon ? `${icon}  ${title}` : title}
                </Text>
            )}
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    primary: {
        backgroundColor: '#00A0B2',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00A0B2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ghost: {
        backgroundColor: 'transparent',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
    disabled: { opacity: 0.4 },
    textPrimary: { color: '#FFFFFF', fontWeight: '700' },
    textSecondary: { color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' },
    textSm: { fontSize: 13 },
    textMd: { fontSize: 16 },
    textLg: { fontSize: 18 },
});
