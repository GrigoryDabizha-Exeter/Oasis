import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import GlassCard from '../components/ui/GlassCard';
import { useSolana } from '../providers/SolanaProvider';
import { useAuthStore } from '../stores/useAuthStore';
import { useFlightStore } from '../stores/useFlightStore';
import { FontSize, useSettingsStore } from '../stores/useSettingsStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const FONT_LABELS: Record<FontSize, string> = {
    small: 'Small',
    default: 'Default',
    large: 'Large',
};

// ─── Setting row types ────────────────────────────────────────────────────────
interface ToggleRowProps {
    icon: string;
    label: string;
    value: boolean;
    onToggle: () => void;
}

function ToggleRow({ icon, label, value, onToggle }: ToggleRowProps) {
    return (
        <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>{icon}</Text>
            <Text style={styles.settingName}>{label}</Text>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(0,160,178,0.5)' }}
                thumbColor={value ? '#00A0B2' : 'rgba(255,255,255,0.4)'}
                ios_backgroundColor="rgba(255,255,255,0.1)"
            />
        </View>
    );
}

interface TapRowProps {
    icon: string;
    label: string;
    value: string;
    onPress: () => void;
}

function TapRow({ icon, label, value, onPress }: TapRowProps) {
    return (
        <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.settingIcon}>{icon}</Text>
            <View style={styles.settingInfo}>
                <Text style={styles.settingName}>{label}</Text>
            </View>
            <View style={styles.valuePill}>
                <Text style={styles.valuePillText}>{value}</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const user       = useAuthStore((s) => s.user);
    const logout     = useAuthStore((s) => s.logout);
    const flightNumber = useAuthStore((s) => s.flightNumber);
    const { connected, publicKey } = useSolana();

    const { fontSize, voiceGuidance, hapticFeedback, highContrast,
            cycleFontSize, toggleVoiceGuidance, toggleHapticFeedback, toggleHighContrast } = useSettingsStore();

    const displayName = user?.name ?? 'Oasis Guest';
    const displayEmail = user?.email ?? null;

    const walletLabel = connected && publicKey
        ? `${publicKey.slice(0, 6)}…${publicKey.slice(-4)}`
        : 'Demo Mode';

    function handleLogout() {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: logout },
            ]
        );
    }

    function handleClearCache() {
        Alert.alert(
            'Clear App Cache',
            'This will clear all cached data and saved preferences. The app will need to reload your settings.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        useFlightStore.getState().setDepartures([]);
                        useFlightStore.getState().setArrivals([]);
                        Alert.alert('Done', 'Cache cleared. Please restart the app for settings to take effect.');
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.label}>SETTINGS & INFO</Text>
                    <Text style={styles.title}>Profile</Text>
                </View>

                {/* ── User Card ── */}
                <GlassCard elevated style={styles.profileCard}>
                    <View style={styles.avatarRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{displayName}</Text>
                            {displayEmail && (
                                <Text style={styles.userEmail}>{displayEmail}</Text>
                            )}
                            <View style={styles.metaRow}>
                                <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>
                                        {connected ? '◉ Wallet' : '○ Demo'}
                                    </Text>
                                </View>
                                <Text style={styles.metaValue}>{walletLabel}</Text>
                            </View>
                            {flightNumber && (
                                <View style={[styles.metaRow, { marginTop: 4 }]}>
                                    <View style={[styles.metaChip, styles.metaChipCyan]}>
                                        <Text style={[styles.metaChipText, styles.metaChipTextCyan]}>✈ Flight</Text>
                                    </View>
                                    <Text style={styles.metaValue}>{flightNumber}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </GlassCard>

                {/* ── Accessibility ── */}
                <Text style={styles.sectionTitle}>Accessibility</Text>
                <GlassCard style={styles.settingsCard}>
                    <TapRow
                        icon="🔤"
                        label="Font Size"
                        value={FONT_LABELS[fontSize]}
                        onPress={cycleFontSize}
                    />
                    <View style={styles.settingDivider} />
                    <ToggleRow
                        icon="🎙️"
                        label="Voice Guidance"
                        value={voiceGuidance}
                        onToggle={toggleVoiceGuidance}
                    />
                    <View style={styles.settingDivider} />
                    <ToggleRow
                        icon="📳"
                        label="Haptic Feedback"
                        value={hapticFeedback}
                        onToggle={toggleHapticFeedback}
                    />
                    <View style={styles.settingDivider} />
                    <ToggleRow
                        icon="🌗"
                        label="High Contrast Mode"
                        value={highContrast}
                        onToggle={toggleHighContrast}
                    />
                </GlassCard>

                {/* ── Account ── */}
                <Text style={styles.sectionTitle}>Account</Text>
                <GlassCard style={styles.settingsCard}>
                    <TouchableOpacity style={styles.settingRow} onPress={handleLogout} activeOpacity={0.7}>
                        <Text style={styles.settingIcon}>🚪</Text>
                        <Text style={[styles.settingName, styles.logoutText]}>Log Out</Text>
                    </TouchableOpacity>
                </GlassCard>

                {/* ── Danger Zone ── */}
                <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
                <GlassCard style={[styles.settingsCard, styles.dangerCard]}>
                    <TouchableOpacity style={styles.settingRow} onPress={handleClearCache} activeOpacity={0.7}>
                        <Text style={styles.settingIcon}>🗑️</Text>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingName, styles.dangerText]}>Clear App Cache</Text>
                            <Text style={styles.settingSubtext}>Resets cached flight & queue data</Text>
                        </View>
                    </TouchableOpacity>
                </GlassCard>

                {/* ── Demo Tools ── */}
                <Text style={styles.sectionTitle}>Demo Tools</Text>
                <GlassCard style={styles.settingsCard}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => router.push('/partner')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.settingIcon}>🏪</Text>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingName}>Switch to Merchant Portal</Text>
                            <Text style={styles.settingSubtext}>Partner dashboard &amp; live order queue</Text>
                        </View>
                        <Text style={styles.chevron}>→</Text>
                    </TouchableOpacity>
                </GlassCard>

                {/* ── Credits ── */}
                <Text style={styles.sectionTitle}>Credits</Text>
                <GlassCard style={styles.aboutCard}>
                    <Text style={styles.aboutTitle}>Oasis</Text>
                    <Text style={styles.aboutVersion}>v1.0.0 · HackSussex 2026</Text>
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
                    <Text style={styles.footerSub}>London Gatwick Airport · Bondi Blue</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    scrollContent: { paddingBottom: 100 },

    // Header
    header: { paddingHorizontal: 16, paddingTop: 24, marginBottom: 20 },
    label: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },

    // Profile card
    profileCard: { marginHorizontal: 16, marginBottom: 28 },
    avatarRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
    avatar: {
        width: 56, height: 56, borderRadius: 28,   // keep circular
        backgroundColor: '#1A1A1A',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#FFFFFF',
        flexShrink: 0,
    },
    avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
    userInfo: { flex: 1 },
    userName: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 3 },
    userEmail: { color: '#666666', fontSize: 12, marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    metaChip: {
        paddingHorizontal: 7, paddingVertical: 2,
        borderRadius: 0,
        backgroundColor: '#1A1A1A',
        borderWidth: 1, borderColor: '#333333',
    },
    metaChipCyan: {
        backgroundColor: '#1A1A1A',
        borderColor: '#FFFFFF',
    },
    metaChipText: { color: '#888888', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    metaChipTextCyan: { color: '#FFFFFF' },
    metaValue: { color: '#888888', fontSize: 12, fontWeight: '500' },

    // Section headers
    sectionTitle: {
        color: '#FFFFFF', fontSize: 11, fontWeight: '800',
        letterSpacing: 2, paddingHorizontal: 16, marginBottom: 10,
    },
    dangerTitle: { color: '#EF4444' },

    // Settings card
    settingsCard: { marginHorizontal: 16, marginBottom: 24 },
    settingRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 10, minHeight: 48,
    },
    settingIcon: { fontSize: 20, width: 28, textAlign: 'center' },
    settingInfo: { flex: 1 },
    settingName: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
    settingSubtext: { color: '#555555', fontSize: 12, marginTop: 2 },
    settingDivider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 2 },

    valuePill: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 0,
        backgroundColor: '#1A1A1A',
        borderWidth: 1, borderColor: '#FFFFFF',
    },
    valuePillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

    logoutText: { color: '#EF4444' },

    // Danger zone
    dangerCard: {
        marginHorizontal: 16, marginBottom: 28,
        borderColor: '#EF4444',
    },
    dangerText: { color: '#EF4444' },

    // Credits / About
    aboutCard: { marginHorizontal: 16, marginBottom: 24 },
    aboutTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 4 },
    aboutVersion: { color: '#555555', fontSize: 12, marginBottom: 10 },
    aboutDesc: { color: '#666666', fontSize: 14, lineHeight: 20, marginBottom: 18 },
    techStack: { borderTopWidth: 1, borderTopColor: '#2A2A2A', paddingTop: 14 },
    techLabel: {
        color: '#555555', fontSize: 10, fontWeight: '700',
        letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase',
    },
    techGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    techChip: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 0, borderWidth: 1, borderColor: '#2A2A2A',
    },
    techText: { color: '#666666', fontSize: 11, fontWeight: '500' },

    // Footer
    footer: { alignItems: 'center', paddingVertical: 24 },
    chevron: { color: '#444444', fontSize: 18, fontWeight: '300' },
    footerText: { color: '#444444', fontSize: 13 },
    footerSub: { color: '#333333', fontSize: 11, marginTop: 4 },
});
