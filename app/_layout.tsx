import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Auth0Provider } from 'react-native-auth0';
import 'react-native-reanimated';
import SolanaProvider from '../src/providers/SolanaProvider';
import AuthScreen from '../src/screens/AuthScreen';
import FlightSetupScreen from '../src/screens/FlightSetupScreen';
import RoleSelectionScreen from '../src/screens/RoleSelectionScreen';
import ShopSelectionScreen from '../src/screens/ShopSelectionScreen';
import VendorDashboardScreen from '../src/screens/VendorDashboardScreen';
import { useAuthStore } from '../src/stores/useAuthStore';

const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_AUTH0_DOMAIN!;
const AUTH0_CLIENT_ID = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID!;

// Custom Gatwick dark theme
const GatwickTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#00A0B2',
    background: '#111111',
    card: '#111111',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.06)',
    notification: '#00A0B2',
  },
};

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const flightNumber = useAuthStore((s) => s.flightNumber);
  const shopName = useAuthStore((s) => s.shopName);

  // Wait for Zustand persist hydration (safe for SSR where persist is undefined)
  const [hydrated, setHydrated] = useState(() => {
    try {
      return useAuthStore.persist?.hasHydrated?.() ?? true;
    } catch {
      return true;
    }
  });
  useEffect(() => {
    if (!hydrated) {
      const timeout = setTimeout(() => setHydrated(true), 100);
      const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
        setHydrated(true);
      });
      return () => {
        clearTimeout(timeout);
        unsub?.();
      };
    }
  }, [hydrated]);

  // Helper to wrap screens in providers
  const wrap = (screen: React.ReactNode) => (
    <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
      <SolanaProvider>
        <ThemeProvider value={GatwickTheme}>
          {screen}
          <StatusBar style="light" />
        </ThemeProvider>
      </SolanaProvider>
    </Auth0Provider>
  );

  // Show loading while hydrating persisted state
  if (!hydrated) {
    return wrap(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111111' }}>
        <ActivityIndicator size="large" color="#00A0B2" />
      </View>
    );
  }

  // Gate 1: Not logged in → Auth screen
  if (!isAuthenticated) return wrap(<AuthScreen />);

  // Gate 2: Logged in but no role → Role selection
  if (role === null) return wrap(<RoleSelectionScreen />);

  // Gate 3: Runner/Shop Partner without shop selected → Shop selection
  if (role === 'runner' && !shopName) return wrap(<ShopSelectionScreen />);

  // Gate 4: Runner/Shop Partner with shop → Vendor Dashboard
  if (role === 'runner') return wrap(<VendorDashboardScreen />);

  // Gate 5: Passenger without flight → Flight setup
  if (role === 'passenger' && !flightNumber) return wrap(<FlightSetupScreen />);

  // Gate 6: Passenger with flight → Main 5-tab app
  return wrap(
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
