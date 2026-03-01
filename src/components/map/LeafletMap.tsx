/**
 * LeafletMap.tsx — native fallback (iOS / Android).
 * Metro automatically picks LeafletMap.web.tsx on web builds,
 * and this file on native builds where DOM APIs don't exist.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface LeafletMapProps {
    center?: [number, number];
    zoom?: number;
}

export default function LeafletMap(_props: LeafletMapProps) {
    return (
        <View style={styles.placeholder}>
            <Text style={styles.icon}>🗺️</Text>
            <Text style={styles.text}>Interactive map on web</Text>
            <Text style={styles.sub}>Open in a browser to explore the live Gatwick map</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
    },
    icon: { fontSize: 48, marginBottom: 12 },
    text: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 6 },
    sub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', paddingHorizontal: 24 },
});
