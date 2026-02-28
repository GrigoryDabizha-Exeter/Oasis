import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import SolanaProvider from '../src/providers/SolanaProvider';

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
  return (
    <SolanaProvider>
      <ThemeProvider value={GatwickTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </SolanaProvider>
  );
}
