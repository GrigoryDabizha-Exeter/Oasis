// Gatwick Oasis Design Tokens
export const colors = {
    bondi: {
        DEFAULT: '#00A0B2',
        50: '#E0F7FA',
        100: '#B2EBF2',
        200: '#80DEEA',
        300: '#4DD0E1',
        400: '#26C6DA',
        500: '#00A0B2',
        600: '#00838F',
        700: '#006064',
        800: '#004D54',
        900: '#003A3F',
    },
    cod: {
        DEFAULT: '#111111',
        400: '#1A1A1A',
        200: '#2A2A2A',
        100: '#333333',
    },
    status: {
        onTime: '#22C55E',
        delayed: '#EF4444',
        boarding: '#F59E0B',
        landed: '#3B82F6',
        cancelled: '#EF4444',
    },
    glass: {
        border: 'rgba(255, 255, 255, 0.1)',
        surface: 'rgba(255, 255, 255, 0.05)',
        highlight: 'rgba(0, 160, 178, 0.15)',
    },
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.6)',
        tertiary: 'rgba(255, 255, 255, 0.4)',
        accent: '#00A0B2',
    },
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const borderRadius = {
    sm: 12,
    md: 20,
    lg: 28,
    full: 9999,
} as const;

export const typography = {
    h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
    h3: { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.2 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
    caption: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
    label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
} as const;
