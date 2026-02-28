import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import GlassCard from '../components/ui/GlassCard';
import HeroSearchConcierge from '../components/ui/HeroSearchConcierge';
import { GateInfo, NavigationRoute } from '../services/types';
import { getNearbyPOIs, getRoute } from '../services/wayfindingService';

type AccessibilityMode = 'standard' | 'wheelchair' | 'visually-impaired';

export default function NavigateScreen() {
    const [selectedTerminal, setSelectedTerminal] = useState<'North' | 'South'>('North');
    const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('standard');
    const [selectedDestination, setSelectedDestination] = useState<GateInfo | null>(null);
    const [route, setRoute] = useState<NavigationRoute | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    const gates = useMemo(
        () => getNearbyPOIs(selectedTerminal, 'gate'),
        [selectedTerminal]
    );
    const amenities = useMemo(
        () => getNearbyPOIs(selectedTerminal).filter((p) => p.type !== 'gate'),
        [selectedTerminal]
    );

    const handleNavigate = (poi: GateInfo) => {
        setSelectedDestination(poi);
        const fromId = selectedTerminal === 'North' ? 'security-north' : 'security-south';
        const newRoute = getRoute(fromId, poi.id, accessibilityMode);
        setRoute(newRoute);
        setIsNavigating(true);
    };

    const accessibilityOptions: { mode: AccessibilityMode; icon: string; label: string }[] = [
        { mode: 'standard', icon: '🚶', label: 'Standard' },
        { mode: 'wheelchair', icon: '♿', label: 'Step-Free' },
        { mode: 'visually-impaired', icon: '🦯', label: 'Audio Guide' },
    ];

    const getTypeIcon = (type: GateInfo['type']) => {
        const icons: Record<string, string> = {
            gate: '🚪', shop: '🛍️', restaurant: '🍽️', lounge: '✨', restroom: '🚻', security: '🔒', immigration: '🛂',
        };
        return icons[type] ?? '📍';
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.label}>INDOOR NAVIGATION</Text>
                    <Text style={styles.title}>Navigate</Text>
                    <Text style={styles.subtitle}>LiDAR-powered wayfinding • 3ft accuracy</Text>
                    <View style={{ marginTop: 16 }}>
                        <HeroSearchConcierge />
                    </View>
                </View>

                {/* Terminal Toggle */}
                <View style={styles.toggleRow}>
                    {(['North', 'South'] as const).map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.terminalBtn, selectedTerminal === t && styles.terminalBtnActive]}
                            onPress={() => { setSelectedTerminal(t); setIsNavigating(false); setRoute(null); }}
                        >
                            <Text style={[styles.terminalText, selectedTerminal === t && styles.terminalTextActive]}>
                                Terminal {t}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Accessibility Mode */}
                <View style={styles.accessRow}>
                    {accessibilityOptions.map(({ mode, icon, label }) => (
                        <TouchableOpacity
                            key={mode}
                            style={[styles.accessBtn, accessibilityMode === mode && styles.accessBtnActive]}
                            onPress={() => setAccessibilityMode(mode)}
                            accessibilityLabel={`${label} routing mode`}
                        >
                            <Text style={styles.accessIcon}>{icon}</Text>
                            <Text style={[styles.accessLabel, accessibilityMode === mode && styles.accessLabelActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Active Route */}
                {isNavigating && route && selectedDestination && (
                    <GlassCard highlight style={styles.routeCard}>
                        <View style={styles.routeHeader}>
                            <View>
                                <Text style={styles.routeTitle}>
                                    {getTypeIcon(selectedDestination.type)} Navigating to {selectedDestination.name}
                                </Text>
                                <Text style={styles.routeMeta}>
                                    {route.totalDistance}m • {route.estimatedTime} min • {route.accessibility}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => { setIsNavigating(false); setRoute(null); }}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Waypoint steps */}
                        <View style={styles.stepsContainer}>
                            {route.waypoints.map((wp, i) => (
                                <View key={i} style={styles.step}>
                                    <View style={styles.stepIndicator}>
                                        <View style={[
                                            styles.stepDot,
                                            i === 0 && styles.stepDotStart,
                                            i === route.waypoints.length - 1 && styles.stepDotEnd,
                                        ]} />
                                        {i < route.waypoints.length - 1 && <View style={styles.stepLine} />}
                                    </View>
                                    <View style={styles.stepContent}>
                                        <Text style={styles.stepInstruction}>{wp.instruction}</Text>
                                        {wp.distance > 0 && (
                                            <Text style={styles.stepDistance}>{wp.distance}m</Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </GlassCard>
                )}

                {/* Map Placeholder */}
                {!isNavigating && (
                    <GlassCard style={styles.mapPlaceholder}>
                        <View style={styles.mapInner}>
                            <Text style={styles.mapIcon}>🗺️</Text>
                            <Text style={styles.mapText}>Mapbox IMDF Indoor Map</Text>
                            <Text style={styles.mapSubtext}>Terminal {selectedTerminal} • Floor 1</Text>
                            <View style={styles.mapGrid}>
                                {gates.concat(amenities).slice(0, 6).map((poi) => (
                                    <TouchableOpacity
                                        key={poi.id}
                                        style={styles.mapPin}
                                        onPress={() => handleNavigate(poi)}
                                        accessibilityLabel={`Navigate to ${poi.name}`}
                                    >
                                        <Text style={styles.mapPinIcon}>{getTypeIcon(poi.type)}</Text>
                                        <Text style={styles.mapPinLabel}>{poi.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </GlassCard>
                )}

                {/* Destination List */}
                {!isNavigating && (
                    <>
                        <Text style={styles.sectionTitle}>Gates</Text>
                        <View style={styles.destinationGrid}>
                            {gates.map((g) => (
                                <TouchableOpacity
                                    key={g.id}
                                    style={styles.destChip}
                                    onPress={() => handleNavigate(g)}
                                >
                                    <Text style={styles.destChipIcon}>🚪</Text>
                                    <Text style={styles.destChipText}>{g.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Amenities</Text>
                        <View style={styles.destinationGrid}>
                            {amenities.map((a) => (
                                <TouchableOpacity
                                    key={a.id}
                                    style={styles.destChip}
                                    onPress={() => handleNavigate(a)}
                                >
                                    <Text style={styles.destChipIcon}>{getTypeIcon(a.type)}</Text>
                                    <Text style={styles.destChipText}>{a.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}
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
    subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
    toggleRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
    terminalBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    terminalBtnActive: { backgroundColor: 'rgba(0, 160, 178, 0.12)', borderColor: 'rgba(0, 160, 178, 0.3)' },
    terminalText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
    terminalTextActive: { color: '#00A0B2' },
    accessRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 },
    accessBtn: {
        flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    accessBtnActive: { backgroundColor: 'rgba(0, 160, 178, 0.12)', borderColor: 'rgba(0, 160, 178, 0.3)' },
    accessIcon: { fontSize: 20, marginBottom: 4 },
    accessLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600' },
    accessLabelActive: { color: '#00A0B2' },
    routeCard: { marginHorizontal: 16, marginBottom: 16 },
    routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    routeTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    routeMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
    closeBtn: { color: 'rgba(255,255,255,0.4)', fontSize: 20, padding: 4 },
    stepsContainer: { gap: 0 },
    step: { flexDirection: 'row', minHeight: 48 },
    stepIndicator: { width: 24, alignItems: 'center' },
    stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(0, 160, 178, 0.4)', borderWidth: 2, borderColor: '#00A0B2' },
    stepDotStart: { backgroundColor: '#00A0B2' },
    stepDotEnd: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
    stepLine: { width: 2, flex: 1, backgroundColor: 'rgba(0, 160, 178, 0.2)', marginVertical: 2 },
    stepContent: { flex: 1, paddingLeft: 12, paddingBottom: 12 },
    stepInstruction: { color: '#FFFFFF', fontSize: 14, fontWeight: '500', lineHeight: 20 },
    stepDistance: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 },
    mapPlaceholder: { marginHorizontal: 16, marginBottom: 20 },
    mapInner: { alignItems: 'center', paddingVertical: 24 },
    mapIcon: { fontSize: 48, marginBottom: 12 },
    mapText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    mapSubtext: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4, marginBottom: 24 },
    mapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    mapPin: { alignItems: 'center', width: 80 },
    mapPinIcon: { fontSize: 24, marginBottom: 4 },
    mapPinLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textAlign: 'center' },
    sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12, marginTop: 4 },
    destinationGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 20 },
    destChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 10, paddingHorizontal: 14,
        borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    destChipIcon: { fontSize: 16 },
    destChipText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
});
