import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore, UserRole } from '../stores/useAuthStore';
import { glassStyles } from '../theme/glassStyles';
import { colors, spacing, typography } from '../theme/tokens';

export default function RoleSelectionScreen() {
    const user = useAuthStore((s) => s.user);
    const setRole = useAuthStore((s) => s.setRole);

    const roles: { key: UserRole; emoji: string; title: string; subtitle: string; accent: string }[] = [
        {
            key: 'passenger',
            emoji: '✈️',
            title: 'I am a Passenger',
            subtitle: 'Track flights · Order to gate · Navigate terminal',
            accent: colors.bondi.DEFAULT,
        },
        {
            key: 'runner',
            emoji: '🏃',
            title: 'I am an Oasis Runner',
            subtitle: 'Accept orders · Deliver to gates · Earn rewards',
            accent: '#9945FF',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Background effects */}
            <View style={styles.gradientOverlay} />

            <Animated.View
                entering={FadeInUp.duration(600).delay(100)}
                style={styles.header}
            >
                <Text style={styles.greeting}>
                    Welcome, {user?.name?.split(' ')[0] ?? 'Traveller'} 👋
                </Text>
                <Text style={styles.question}>
                    How will you use Oasis today?
                </Text>
            </Animated.View>

            <View style={styles.cardsContainer}>
                {roles.map((role, index) => (
                    <Animated.View
                        key={role.key}
                        entering={FadeInDown.duration(500).delay(300 + index * 200)}
                    >
                        <TouchableOpacity
                            style={[
                                styles.roleCard,
                                { borderColor: `${role.accent}33` },
                            ]}
                            onPress={() => setRole(role.key)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.emojiCircle, { backgroundColor: `${role.accent}1A` }]}>
                                <Text style={styles.emoji}>{role.emoji}</Text>
                            </View>
                            <View style={styles.roleTextBlock}>
                                <Text style={styles.roleTitle}>{role.title}</Text>
                                <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                            </View>
                            <Text style={[styles.selectArrow, { color: role.accent }]}>→</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>

            <Animated.View
                entering={FadeInDown.duration(400).delay(800)}
                style={styles.footer}
            >
                <Text style={styles.footerText}>
                    You can switch roles anytime from your Profile
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.cod.DEFAULT,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        ...(Platform.OS === 'web'
            ? {
                background:
                    'radial-gradient(ellipse at 30% 20%, rgba(0,160,178,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(153,69,255,0.06) 0%, transparent 50%)',
            }
            : {}),
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl + 8,
    },
    greeting: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    question: {
        ...typography.body,
        color: colors.text.secondary,
    },
    cardsContainer: {
        gap: spacing.md,
        maxWidth: 480,
        alignSelf: 'center',
        width: '100%',
    },
    roleCard: {
        ...glassStyles.cardElevated,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    emojiCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 28,
    },
    roleTextBlock: {
        flex: 1,
    },
    roleTitle: {
        ...typography.h3,
        color: colors.text.primary,
        marginBottom: 4,
    },
    roleSubtitle: {
        ...typography.caption,
        color: colors.text.secondary,
        lineHeight: 18,
    },
    selectArrow: {
        fontSize: 24,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xxl,
    },
    footerText: {
        ...typography.caption,
        color: colors.text.tertiary,
    },
});
