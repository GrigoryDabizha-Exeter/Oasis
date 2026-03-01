import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LeafletMap from '../components/map/LeafletMap';
import GlassCard from '../components/ui/GlassCard';
import HeroSearchConcierge from '../components/ui/HeroSearchConcierge';
import { GateInfo, NavigationRoute } from '../services/types';
import { getNearbyPOIs, getRoute } from '../services/wayfindingService';

const TERMINAL_COORDS: Record<'North' | 'South', [number, number]> = {
    North: [51.1512, -0.1635],
    South: [51.1537, -0.1821],
};

export default function NavigateScreen() {
    const [selectedTerminal, setSelectedTerminal] = useState<'North' | 'South'>('North');
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
        const newRoute = getRoute(fromId, poi.id, 'standard');
        setRoute(newRoute);
        setIsNavigating(true);
    };

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
                    <Text style={styles.label}>LIVE TERMINAL MAP</Text>
                    <Text style={styles.title}>Navigate</Text>
                    <Text style={styles.subtitle}>London Gatwick Airport • OpenStreetMap</Text>
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

                {/* Live Map */}
                {!isNavigating && (
                    <View style={styles.mapSection}>
                        <View style={styles.mapCard}>
                            <View style={styles.mapCardHeader}>
                                <View style={styles.mapLiveDot} />
                                <Text style={styles.mapCardTitle}>
                                    Gatwick Airport · Terminal {selectedTerminal}
                                </Text>
                            </View>
                            <LeafletMap
                                key={selectedTerminal}
                                center={TERMINAL_COORDS[selectedTerminal]}
                                zoom={15}
                            />
                            <Text style={styles.mapHint}>
                                Tap a marker to see details · Pinch or scroll to zoom
                            </Text>
                        </View>
                    </View>
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
    mapSection: { paddingHorizontal: 16, marginBottom: 20 },
    mapCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        overflow: 'hidden',
        padding: 12,
    },
    mapCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    mapLiveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#22C55E',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    mapCardTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    mapHint: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
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
