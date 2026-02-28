import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Auth0Provider } from 'react-native-auth0';
import 'react-native-reanimated';
import SolanaProvider from '../src/providers/SolanaProvider';
import AuthScreen from '../src/screens/AuthScreen';
import FlightSetupScreen from '../src/screens/FlightSetupScreen';
import RoleSelectionScreen from '../src/screens/RoleSelectionScreen';
import RunnerDashboardScreen from '../src/screens/RunnerDashboardScreen';
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

  // Gate 1: Not logged in → Auth screen
  if (!isAuthenticated) {
    return (
      <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
        <SolanaProvider>
          <ThemeProvider value={GatwickTheme}>
            <AuthScreen />
            <StatusBar style="light" />
          </ThemeProvider>
        </SolanaProvider>
      </Auth0Provider>
    );
  }

  // Gate 2: Logged in but no role selected → Role selection
  if (role === null) {
    return (
      <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
        <SolanaProvider>
          <ThemeProvider value={GatwickTheme}>
            <RoleSelectionScreen />
            <StatusBar style="light" />
          </ThemeProvider>
        </SolanaProvider>
      </Auth0Provider>
    );
  }

  // Gate 3: Runner → Runner Dashboard (no tabs)
  if (role === 'runner') {
    return (
      <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
        <SolanaProvider>
          <ThemeProvider value={GatwickTheme}>
            <RunnerDashboardScreen />
            <StatusBar style="light" />
          </ThemeProvider>
        </SolanaProvider>
      </Auth0Provider>
    );
  }

  // Gate 4: Passenger without flight → Flight setup
  if (role === 'passenger' && !flightNumber) {
    return (
      <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
        <SolanaProvider>
          <ThemeProvider value={GatwickTheme}>
            <FlightSetupScreen />
            <StatusBar style="light" />
          </ThemeProvider>
        </SolanaProvider>
      </Auth0Provider>
    );
  }

  // Gate 5: Passenger with flight → Main 5-tab app
  return (
    <Auth0Provider domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
      <SolanaProvider>
        <ThemeProvider value={GatwickTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </SolanaProvider>
    </Auth0Provider>
  );
}
