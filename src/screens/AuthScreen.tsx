import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
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
    withTiming
} from 'react-native-reanimated';
import { useAuthStore } from '../stores/useAuthStore';
import { glassStyles } from '../theme/glassStyles';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
    const login = useAuthStore((s) => s.login);
    const { authorize, user: auth0User, isLoading: auth0Loading } = useAuth0();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // Sync Auth0 persisted session → Zustand on page reload / redirect return
    useEffect(() => {
        if (auth0User && !auth0Loading) {
            login({
                id: (auth0User as any).sub ?? 'auth0|unknown',
                name: (auth0User as any).name ?? (auth0User as any).nickname ?? 'Traveller',
                email: (auth0User as any).email ?? '',
                picture: (auth0User as any).picture,
            });
        }
    }, [auth0User, auth0Loading]);

    // Pulsing glow animation
    const glowOpacity = useSharedValue(0.3);
    React.useEffect(() => {
        glowOpacity.value = withRepeat(
            withTiming(0.8, { duration: 2000 }),
            -1,
            true
        );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const isLoading = isSigningIn || auth0Loading;

    const handleSignIn = async () => {
        setIsSigningIn(true);
        setAuthError(null);
        try {
            const credentials = await authorize();
            if (credentials) {
                const idTokenPayload = credentials.idToken
                    ? JSON.parse(atob(credentials.idToken.split('.')[1]))
                    : {};
                login({
                    id: idTokenPayload.sub ?? 'auth0|unknown',
                    name: idTokenPayload.name ?? idTokenPayload.nickname ?? 'Traveller',
                    email: idTokenPayload.email ?? '',
                    picture: idTokenPayload.picture,
                });
            }
        } catch (error: any) {
            console.error('Auth0 login error:', error);
            if (error?.message !== 'USER_CANCELLED') {
                setAuthError(error?.message ?? 'Authentication failed');
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Background gradient overlay */}
            <View style={styles.gradientOverlay} />

            {/* Animated glow orb */}
            <Animated.View style={[styles.glowOrb, glowStyle]} />

            {/* Content */}
            <View style={styles.content}>
                {/* Logo Section */}
                <Animated.View
                    entering={FadeInUp.duration(800).delay(200)}
                    style={styles.logoSection}
                >
                    <Text style={styles.airportLabel}>LONDON GATWICK</Text>
                    <Text style={styles.appName}>Oasis</Text>
                    <View style={styles.taglineRow}>
                        <View style={styles.accentDot} />
                        <Text style={styles.tagline}>Your journey starts here</Text>
                    </View>
                </Animated.View>

                {/* Feature pills */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(600)}
                    style={styles.featurePills}
                >
                    {['AI Concierge', 'Live Flights', 'Gate Delivery', 'Solana Pay'].map(
                        (feature, i) => (
                            <View key={feature} style={styles.pill}>
                                <Text style={styles.pillText}>{feature}</Text>
                            </View>
                        )
                    )}
                </Animated.View>

                {/* Sign In Button */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(900)}
                    style={styles.buttonSection}
                >
                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={handleSignIn}
                        activeOpacity={0.85}
                        disabled={isLoading}
                    >
                        <View style={styles.buttonInner}>
                            {isLoading ? (
                                <ActivityIndicator color={colors.bondi.DEFAULT} size="small" />
                            ) : (
                                <Text style={styles.lockIcon}>🔐</Text>
                            )}
                            <View>
                                <Text style={styles.buttonTitle}>
                                    {isLoading ? 'Authenticating...' : 'Sign In with Auth0'}
                                </Text>
                                <Text style={styles.buttonSubtitle}>
                                    Secure Universal Login
                                </Text>
                            </View>
                        </View>
                        {!isLoading && <Text style={styles.arrow}>→</Text>}
                    </TouchableOpacity>

                    {authError && (
                        <Text style={styles.errorText}>{authError}</Text>
                    )}

                    <Text style={styles.disclaimer}>
                        MLH Auth0 Track · Privacy-first · No tracking
                    </Text>
                </Animated.View>

                {/* Bottom branding */}
                <Animated.View
                    entering={FadeInDown.duration(400).delay(1200)}
                    style={styles.bottomBrand}
                >
                    <Text style={styles.poweredBy}>
                        Powered by{' '}
                        <Text style={{ color: colors.bondi.DEFAULT }}>Gemini AI</Text>
                        {' · '}
                        <Text style={{ color: '#9945FF' }}>Solana</Text>
                        {' · '}
                        <Text style={{ color: '#EB5424' }}>Auth0</Text>
                    </Text>
                </Animated.View>
            </View>
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
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
        // Subtle radial-like effect via layered shadows on web
        ...(Platform.OS === 'web'
            ? {
                background:
                    'radial-gradient(ellipse at 50% 0%, rgba(0,160,178,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(153,69,255,0.08) 0%, transparent 50%)',
            }
            : {}),
    },
    glowOrb: {
        position: 'absolute',
        top: -80,
        alignSelf: 'center',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: colors.bondi.DEFAULT,
        ...(Platform.OS === 'web'
            ? { filter: 'blur(120px)' }
            : {
                shadowColor: colors.bondi.DEFAULT,
                shadowRadius: 120,
                shadowOpacity: 0.4,
            }),
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    airportLabel: {
        ...typography.label,
        color: colors.bondi.DEFAULT,
        marginBottom: spacing.xs,
    },
    appName: {
        fontSize: 64,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -2,
    },
    taglineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        gap: spacing.sm,
    },
    accentDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.bondi.DEFAULT,
    },
    tagline: {
        ...typography.body,
        color: colors.text.secondary,
    },
    featurePills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xxl + 16,
        maxWidth: 400,
    },
    pill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.glass.border,
        backgroundColor: colors.glass.surface,
    },
    pillText: {
        ...typography.caption,
        color: colors.text.secondary,
    },
    buttonSection: {
        width: '100%',
        maxWidth: 420,
        alignItems: 'center',
    },
    signInButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...glassStyles.cardElevated,
        borderColor: 'rgba(0, 160, 178, 0.3)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + 4,
        backgroundColor: 'rgba(0, 160, 178, 0.12)',
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    lockIcon: {
        fontSize: 28,
    },
    buttonTitle: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    buttonSubtitle: {
        ...typography.caption,
        color: colors.text.secondary,
        marginTop: 2,
    },
    arrow: {
        fontSize: 22,
        color: colors.bondi.DEFAULT,
        fontWeight: '700',
    },
    errorText: {
        ...typography.caption,
        color: '#EF4444',
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    disclaimer: {
        ...typography.caption,
        color: colors.text.tertiary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    bottomBrand: {
        position: 'absolute',
        bottom: spacing.xxl,
        alignItems: 'center',
    },
    poweredBy: {
        ...typography.caption,
        color: colors.text.tertiary,
    },
});
