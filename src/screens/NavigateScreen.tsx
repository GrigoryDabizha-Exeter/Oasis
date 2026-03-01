import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LeafletMap from '../components/map/LeafletMap';

const TERMINAL_COORDS: Record<'North' | 'South', [number, number]> = {
    North: [51.1512, -0.1635],
    South: [51.1537, -0.1821],
};

export default function NavigateScreen() {
    const [selectedTerminal, setSelectedTerminal] = useState<'North' | 'South'>('North');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.label}>LIVE TERMINAL MAP</Text>
                    <Text style={styles.title}>Navigate</Text>
                    <Text style={styles.subtitle}>London Gatwick Airport • OpenStreetMap</Text>
                </View>

                {/* Terminal Toggle */}
                <View style={styles.toggleRow}>
                    {(['North', 'South'] as const).map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.terminalBtn, selectedTerminal === t && styles.terminalBtnActive]}
                            onPress={() => setSelectedTerminal(t)}
                        >
                            <Text style={[styles.terminalText, selectedTerminal === t && styles.terminalTextActive]}>
                                Terminal {t}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Live Map */}
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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    scrollContent: { paddingBottom: 100 },
    header: { paddingHorizontal: 16, paddingTop: 24, marginBottom: 20 },
    label: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
    subtitle: { color: '#555555', fontSize: 13, marginTop: 4 },
    toggleRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 4, marginBottom: 12 },
    terminalBtn: {
        flex: 1, paddingVertical: 12, alignItems: 'center',
        backgroundColor: '#111111', borderWidth: 1, borderColor: '#2A2A2A',
    },
    terminalBtnActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
    terminalText: { color: '#666666', fontSize: 13, fontWeight: '700' },
    terminalTextActive: { color: '#000000' },
    mapSection: { paddingHorizontal: 16, marginBottom: 20 },
    mapCard: {
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#2A2A2A',
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
    },
    mapCardTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    mapHint: {
        color: '#444444',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
});
