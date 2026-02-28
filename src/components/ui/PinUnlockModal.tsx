import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    SlideInDown,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
    ZoomIn
} from 'react-native-reanimated';
import { useOrderStore } from '../../stores/useOrderStore';
import { glassStyles } from '../../theme/glassStyles';
import { borderRadius, colors, spacing, typography } from '../../theme/tokens';

interface PinUnlockModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function PinUnlockModal({ visible, onClose }: PinUnlockModalProps) {
    const [pin, setPin] = useState(['', '', '', '']);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const unlockContainer = useOrderStore((s) => s.unlockContainer);
    const activeOrder = useOrderStore((s) => s.activeOrder);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Shake animation for error
    const shakeX = useSharedValue(0);
    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    // Reset state on open
    useEffect(() => {
        if (visible) {
            setPin(['', '', '', '']);
            setSuccess(false);
            setError(false);
            setTimeout(() => inputRefs.current[0]?.focus(), 300);
        }
    }, [visible]);

    const handleDigit = (digit: string, index: number) => {
        if (digit.length > 1) return;
        const newPin = [...pin];
        newPin[index] = digit;
        setPin(newPin);
        setError(false);

        if (digit && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 4 digits entered
        if (digit && index === 3) {
            const fullPin = newPin.join('');
            const result = unlockContainer(fullPin);
            if (result) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setError(true);
                shakeX.value = withSequence(
                    withTiming(-12, { duration: 60 }),
                    withTiming(12, { duration: 60 }),
                    withTiming(-8, { duration: 60 }),
                    withTiming(8, { duration: 60 }),
                    withTiming(0, { duration: 60 })
                );
                // Clear PIN after shake
                setTimeout(() => {
                    setPin(['', '', '', '']);
                    inputRefs.current[0]?.focus();
                }, 400);
            }
        }
    };

    const handleBackspace = (index: number) => {
        if (pin[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newPin = [...pin];
            newPin[index - 1] = '';
            setPin(newPin);
        } else {
            const newPin = [...pin];
            newPin[index] = '';
            setPin(newPin);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    entering={SlideInDown.duration(400)}
                    style={styles.modalContainer}
                >
                    {success ? (
                        /* Success State */
                        <Animated.View entering={ZoomIn.duration(400)} style={styles.successContainer}>
                            <Text style={styles.successEmoji}>✅</Text>
                            <Text style={styles.successTitle}>Container Unlocked!</Text>
                            <Text style={styles.successSubtitle}>Enjoy your order 🎉</Text>
                        </Animated.View>
                    ) : (
                        /* PIN Entry State */
                        <>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalEmoji}>🔐</Text>
                                <Text style={styles.modalTitle}>
                                    Enter Delivery PIN
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    The 4-digit PIN was shown on your tracker
                                </Text>
                            </View>

                            {/* PIN Input Boxes */}
                            <Animated.View style={[styles.pinRow, shakeStyle]}>
                                {pin.map((digit, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.pinBox,
                                            digit && styles.pinBoxFilled,
                                            error && styles.pinBoxError,
                                        ]}
                                    >
                                        <TextInput
                                            ref={(ref) => { inputRefs.current[i] = ref; }}
                                            style={styles.pinInput}
                                            value={digit}
                                            onChangeText={(text) => handleDigit(text, i)}
                                            onKeyPress={({ nativeEvent }) => {
                                                if (nativeEvent.key === 'Backspace') {
                                                    handleBackspace(i);
                                                }
                                            }}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            selectTextOnFocus
                                        />
                                    </View>
                                ))}
                            </Animated.View>

                            {error && (
                                <Animated.Text entering={FadeIn.duration(200)} style={styles.errorText}>
                                    Incorrect PIN — try again
                                </Animated.Text>
                            )}

                            {/* Item reminder */}
                            {activeOrder && (
                                <View style={styles.orderReminder}>
                                    <Text style={styles.reminderText}>
                                        📦 {activeOrder.item} → Gate {activeOrder.gate}
                                    </Text>
                                </View>
                            )}

                            {/* Cancel */}
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContainer: {
        ...glassStyles.cardElevated,
        width: '100%',
        maxWidth: 380,
        padding: spacing.lg + 8,
        borderColor: 'rgba(0, 160, 178, 0.2)',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalEmoji: {
        fontSize: 40,
        marginBottom: spacing.sm,
    },
    modalTitle: {
        ...typography.h2,
        color: colors.text.primary,
        textAlign: 'center',
    },
    modalSubtitle: {
        ...typography.caption,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: 6,
    },
    pinRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: spacing.md,
    },
    pinBox: {
        width: 60,
        height: 72,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinBoxFilled: {
        borderColor: colors.bondi.DEFAULT,
        backgroundColor: 'rgba(0, 160, 178, 0.08)',
    },
    pinBoxError: {
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
    pinInput: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text.primary,
        textAlign: 'center',
        width: '100%',
        height: '100%',
    },
    errorText: {
        ...typography.caption,
        color: '#EF4444',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    orderReminder: {
        ...glassStyles.surface,
        padding: spacing.sm + 4,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    reminderText: {
        ...typography.caption,
        color: colors.text.secondary,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    cancelText: {
        ...typography.caption,
        color: colors.text.tertiary,
        textDecorationLine: 'underline',
    },
    // Success state
    successContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    successEmoji: {
        fontSize: 56,
        marginBottom: spacing.md,
    },
    successTitle: {
        ...typography.h2,
        color: '#22C55E',
        textAlign: 'center',
    },
    successSubtitle: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
});
