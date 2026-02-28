import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import GlassCard from '../components/ui/GlassCard';
import { useSolana } from '../providers/SolanaProvider';

export default function ProfileScreen() {
    const { connected, publicKey } = useSolana();

    const truncatedKey = publicKey
        ? `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 6)}`
        : null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.label}>SETTINGS & INFO</Text>
                    <Text style={styles.title}>Profile</Text>
                </View>

                {/* User Info */}
                <GlassCard elevated style={styles.profileCard}>
                    <View style={styles.avatarRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>✈️</Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>Oasis Traveler</Text>
                            <Text style={styles.userStatus}>
                                {connected ? `Wallet: ${truncatedKey}` : 'Wallet not connected'}
                            </Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Accessibility Settings */}
                <Text style={styles.sectionTitle}>Accessibility</Text>
                <GlassCard style={styles.settingsCard}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingIcon}>🔤</Text>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingName}>Font Size</Text>
                            <Text style={styles.settingValue}>System Default</Text>
                        </View>
                    </View>
                    <View style={styles.settingDivider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingIcon}>🎙️</Text>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingName}>Voice Guidance</Text>
                            <Text style={styles.settingValue}>Enabled</Text>
                        </View>
                    </View>
                    <View style={styles.settingDivider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingIcon}>📳</Text>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingName}>Haptic Feedback</Text>
                            <Text style={styles.settingValue}>Enabled</Text>
                        </View>
                    </View>
                    <View style={styles.settingDivider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingIcon}>🌗</Text>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingName}>High Contrast Mode</Text>
                            <Text style={styles.settingValue}>Off</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* About */}
                <Text style={styles.sectionTitle}>About</Text>
                <GlassCard style={styles.aboutCard}>
                    <Text style={styles.aboutTitle}>Oasis</Text>
                    <Text style={styles.aboutVersion}>v1.0.0 • HackSussex 2026</Text>
                    <Text style={styles.aboutDesc}>
                        AI-powered, zero-stress passenger flow and micro-economy app for London Gatwick Airport.
                    </Text>

                    <View style={styles.techStack}>
                        <Text style={styles.techLabel}>TECHNOLOGY STACK</Text>
                        <View style={styles.techGrid}>
                            {[
                                'React Native (Expo)',
                                'NativeWind / Tailwind CSS',
                                'Solana Web3 + Blinks',
                                'Mapbox IMDF',
                                'GoodMaps LiDAR CPS',
                                'Zustand State',
                                'Reanimated 4',
                                'TypeScript',
                            ].map((tech) => (
                                <View key={tech} style={styles.techChip}>
                                    <Text style={styles.techText}>{tech}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </GlassCard>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Built with 💙 for HackSussex 2026</Text>
                    <Text style={styles.footerSub}>London Gatwick Airport • Bondi Blue</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111111' },
    scrollContent: { paddingBottom: 100 },
    header: { paddingHorizontal: 16, paddingTop: 24, marginBottom: 20 },
    label: { color: '#00A0B2', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
    profileCard: { marginHorizontal: 16, marginBottom: 24 },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatar: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: 'rgba(0, 160, 178, 0.15)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: 'rgba(0, 160, 178, 0.3)',
    },
    avatarText: { fontSize: 24 },
    userInfo: { flex: 1 },
    userName: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    userStatus: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
    sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
    settingsCard: { marginHorizontal: 16, marginBottom: 24 },
    settingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
    settingIcon: { fontSize: 22 },
    settingInfo: { flex: 1 },
    settingName: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
    settingValue: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
    settingDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 4 },
    aboutCard: { marginHorizontal: 16, marginBottom: 24 },
    aboutTitle: { color: '#00A0B2', fontSize: 24, fontWeight: '800', marginBottom: 4 },
    aboutVersion: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 },
    aboutDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 20, marginBottom: 20 },
    techStack: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 16 },
    techLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '600', letterSpacing: 1, marginBottom: 10 },
    techGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    techChip: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    techText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500' },
    footer: { alignItems: 'center', padding: 24 },
    footerText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
    footerSub: { color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 4 },
});
