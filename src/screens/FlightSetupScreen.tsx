import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../stores/useAuthStore';
import { glassStyles } from '../theme/glassStyles';
import { colors, spacing, typography } from '../theme/tokens';

export default function FlightSetupScreen() {
    const [flightNum, setFlightNum] = useState('');
    const setFlightNumber = useAuthStore((s) => s.setFlightNumber);
    const user = useAuthStore((s) => s.user);

    const isValid = flightNum.trim().length >= 3;

    const handleSubmit = () => {
        if (!isValid) return;
        setFlightNumber(flightNum.trim().toUpperCase());
    };

    const handleSkip = () => {
        setFlightNumber('SKIP');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.gradientOverlay} />

            <View style={styles.content}>
                <Animated.View
                    entering={FadeInUp.duration(600).delay(100)}
                    style={styles.header}
                >
                    <Text style={styles.icon}>✈️</Text>
                    <Text style={styles.title}>What's your flight?</Text>
                    <Text style={styles.subtitle}>
                        Enter your flight number so we can track it and find your gate automatically
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.duration(500).delay(300)}
                    style={styles.inputSection}
                >
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>FLIGHT NUMBER</Text>
                        <TextInput
                            style={styles.input}
                            value={flightNum}
                            onChangeText={setFlightNum}
                            placeholder="e.g. BA2490"
                            placeholderTextColor={colors.text.tertiary}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            maxLength={8}
                            onSubmitEditing={handleSubmit}
                            returnKeyType="go"
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            !isValid && styles.continueButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        activeOpacity={0.85}
                        disabled={!isValid}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                        <Text style={styles.continueArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleSkip}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.skipText}>Skip for now — I'll browse the terminal</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.duration(400).delay(600)}
                    style={styles.hintSection}
                >
                    <View style={styles.hintCard}>
                        <Text style={styles.hintIcon}>💡</Text>
                        <Text style={styles.hintText}>
                            Your flight number is printed on your boarding pass, e.g. BA2490, EK6424, DY4673
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
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
                    'radial-gradient(ellipse at 50% 30%, rgba(0,160,178,0.1) 0%, transparent 60%)',
            }
            : {}),
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        maxWidth: 480,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl + 8,
    },
    icon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    title: {
        ...typography.h1,
        color: colors.text.primary,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    inputSection: {
        gap: spacing.md,
    },
    inputContainer: {
        ...glassStyles.card,
        padding: spacing.md,
    },
    inputLabel: {
        ...typography.label,
        color: colors.bondi.DEFAULT,
        marginBottom: spacing.sm,
    },
    input: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: 2,
        paddingVertical: spacing.sm,
        textAlign: 'center',
    },
    continueButton: {
        ...glassStyles.buttonPrimary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    continueButtonDisabled: {
        opacity: 0.4,
        shadowOpacity: 0,
    },
    continueText: {
        ...typography.bodyBold,
        color: '#FFFFFF',
    },
    continueArrow: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    skipText: {
        ...typography.caption,
        color: colors.text.tertiary,
        textDecorationLine: 'underline',
    },
    hintSection: {
        marginTop: spacing.xxl,
    },
    hintCard: {
        ...glassStyles.surface,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.sm,
    },
    hintIcon: {
        fontSize: 20,
    },
    hintText: {
        ...typography.caption,
        color: colors.text.secondary,
        flex: 1,
    },
});
