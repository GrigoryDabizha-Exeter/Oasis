import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../stores/useAuthStore';
import { glassStyles } from '../theme/glassStyles';
import { colors, spacing, typography } from '../theme/tokens';

const GATWICK_VENDORS = [
    { name: 'Pret a Manger', emoji: '🥖', category: 'Food & Coffee' },
    { name: 'Wagamama', emoji: '🍜', category: 'Restaurant' },
    { name: 'World Duty Free', emoji: '🛍️', category: 'Retail' },
    { name: 'Shake Shack', emoji: '🍔', category: 'Fast Food' },
    { name: 'Costa Coffee', emoji: '☕', category: 'Coffee' },
    { name: 'Joe & The Juice', emoji: '🥤', category: 'Juice Bar' },
    { name: 'The Red Lion', emoji: '🍺', category: 'Pub & Bar' },
];

export default function ShopSelectionScreen() {
    const user = useAuthStore((s) => s.user);
    const setShopName = useAuthStore((s) => s.setShopName);

    return (
        <View style={styles.container}>
            <View style={styles.gradientOverlay} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    entering={FadeInUp.duration(600).delay(100)}
                    style={styles.header}
                >
                    <Text style={styles.labelText}>SHOP PARTNER SETUP</Text>
                    <Text style={styles.title}>
                        Select Your Shop
                    </Text>
                    <Text style={styles.subtitle}>
                        Hey {user?.name?.split(' ')[0] ?? 'Partner'}, which shop do you work at?
                    </Text>
                </Animated.View>

                <View style={styles.vendorList}>
                    {GATWICK_VENDORS.map((vendor, index) => (
                        <Animated.View
                            key={vendor.name}
                            entering={FadeInDown.duration(400).delay(250 + index * 100)}
                        >
                            <TouchableOpacity
                                style={styles.vendorCard}
                                onPress={() => setShopName(vendor.name)}
                                activeOpacity={0.85}
                            >
                                <View style={styles.vendorLeft}>
                                    <View style={styles.emojiCircle}>
                                        <Text style={styles.emoji}>{vendor.emoji}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.vendorName}>{vendor.name}</Text>
                                        <Text style={styles.vendorCategory}>{vendor.category}</Text>
                                    </View>
                                </View>
                                <Text style={styles.selectArrow}>→</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <Animated.View
                    entering={FadeInDown.duration(400).delay(1100)}
                    style={styles.footer}
                >
                    <Text style={styles.footerText}>
                        🤖 Oasis Droids will pick up orders from your shop
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
                    'radial-gradient(ellipse at 30% 10%, rgba(153,69,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 90%, rgba(0,160,178,0.06) 0%, transparent 50%)',
            }
            : {}),
    },
    scroll: { flex: 1 },
    scrollContent: {
        padding: spacing.lg,
        paddingTop: 60,
        paddingBottom: 40,
        maxWidth: 520,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        marginBottom: spacing.lg + 8,
    },
    labelText: {
        ...typography.label,
        color: '#9945FF',
        marginBottom: spacing.sm,
    },
    title: {
        ...typography.h1,
        color: colors.text.primary,
    },
    subtitle: {
        ...typography.body,
        color: colors.text.secondary,
        marginTop: spacing.sm,
    },
    vendorList: {
        gap: spacing.sm,
    },
    vendorCard: {
        ...glassStyles.cardElevated,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md + 2,
        borderColor: 'rgba(153, 69, 255, 0.15)',
    },
    vendorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    emojiCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(153, 69, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 24,
    },
    vendorName: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    vendorCategory: {
        ...typography.caption,
        color: colors.text.secondary,
        marginTop: 2,
    },
    selectArrow: {
        fontSize: 22,
        fontWeight: '700',
        color: '#9945FF',
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        ...typography.caption,
        color: colors.text.tertiary,
        textAlign: 'center',
    },
});
