// Shared Liquid Glass Style Presets
import { Platform, StyleSheet } from 'react-native';

export const glassStyles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        overflow: 'hidden',
        ...(Platform.OS === 'web'
            ? {
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
            }
            : {}),
    },
    cardElevated: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
        elevation: 8,
    },
    surface: {
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
    },
    buttonPrimary: {
        backgroundColor: '#00A0B2',
        borderRadius: 16,
        shadowColor: '#00A0B2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    glow: {
        shadowColor: '#00A0B2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 6,
    },
    innerHighlight: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.12)',
    },
});
