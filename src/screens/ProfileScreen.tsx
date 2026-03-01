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
import { FontSize, useSettingsStore } from '../stores/useSettingsStore';
import { useFlightStore } from '../stores/useFlightStore';

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
            'This will reset all cached flight and queue data. Your account and settings are unaffected.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        // Reset volatile data stores
                        useFlightStore.getState().setDepartures([]);
                        useFlightStore.getState().setArrivals([]);
                        Alert.alert('Done', 'Cache cleared. Pull to refresh on the Flights tab.');
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
    container: { flex: 1, backgroundColor: '#111111' },
    scrollContent: { paddingBottom: 100 },

    // Header
    header: { paddingHorizontal: 16, paddingTop: 24, marginBottom: 20 },
    label: { color: '#00A0B2', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },

    // Profile card
    profileCard: { marginHorizontal: 16, marginBottom: 28 },
    avatarRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
    avatar: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: 'rgba(0, 160, 178, 0.15)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: 'rgba(0, 160, 178, 0.35)',
        flexShrink: 0,
    },
    avatarText: { color: '#00A0B2', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
    userInfo: { flex: 1 },
    userName: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 3 },
    userEmail: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    metaChip: {
        paddingHorizontal: 7, paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    metaChipCyan: {
        backgroundColor: 'rgba(0,160,178,0.1)',
        borderColor: 'rgba(0,160,178,0.25)',
    },
    metaChipText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' },
    metaChipTextCyan: { color: '#00A0B2' },
    metaValue: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '500' },

    // Section headers
    sectionTitle: {
        color: '#FFFFFF', fontSize: 17, fontWeight: '700',
        paddingHorizontal: 16, marginBottom: 10,
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
    settingSubtext: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 },
    settingDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 2 },

    valuePill: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(0,160,178,0.1)',
        borderWidth: 1, borderColor: 'rgba(0,160,178,0.25)',
    },
    valuePillText: { color: '#00A0B2', fontSize: 12, fontWeight: '600' },

    logoutText: { color: '#EF4444' },

    // Danger zone
    dangerCard: {
        marginHorizontal: 16, marginBottom: 28,
        borderColor: 'rgba(239,68,68,0.2)',
    },
    dangerText: { color: '#EF4444' },

    // Credits / About
    aboutCard: { marginHorizontal: 16, marginBottom: 24 },
    aboutTitle: { color: '#00A0B2', fontSize: 22, fontWeight: '800', marginBottom: 4 },
    aboutVersion: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 10 },
    aboutDesc: { color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 20, marginBottom: 18 },
    techStack: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 14 },
    techLabel: {
        color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700',
        letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase',
    },
    techGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    techChip: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    techText: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '500' },

    // Footer
    footer: { alignItems: 'center', paddingVertical: 24 },
    footerText: { color: 'rgba(255,255,255,0.25)', fontSize: 13 },
    footerSub: { color: 'rgba(255,255,255,0.12)', fontSize: 11, marginTop: 4 },
});
