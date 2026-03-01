import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useOrderStore } from '../../src/stores/useOrderStore';

export default function TabLayout() {
  const hasPendingOrder = useOrderStore((s) => s.activeOrder?.status === 'preparing');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(17, 17, 17, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.06)',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(40px)',
          } : {}),
        },
        tabBarActiveTintColor: '#00A0B2',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.35)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Flights',
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="navigate"
        options={{
          title: 'Navigate',
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => (
            <ShopTabIcon focused={focused} hasPendingOrder={!!hasPendingOrder} />
          ),
        }}
      />
      <Tabs.Screen
        name="lounge"
        options={{
          title: 'Lounge',
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
        }}
      />
    </Tabs>
  );
}

// ── Standard dot indicator ────────────────────────────────────────────────────
function TabDot({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.dot, focused ? styles.dotActive : styles.dotInactive]} />
  );
}

// ── Shop icon — dot + pulsing red alert badge when order is pending ────────────
function ShopTabIcon({ focused, hasPendingOrder }: { focused: boolean; hasPendingOrder: boolean }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (hasPendingOrder) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 500 }),
          withTiming(1,   { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = 1;
    }
  }, [hasPendingOrder]);

  const badgeStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.shopIconWrapper}>
      <View style={[styles.dot, focused ? styles.dotActive : styles.dotInactive]} />
      {hasPendingOrder && (
        <Animated.View style={[styles.orderBadge, badgeStyle]} />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  dotActive: {
    backgroundColor: '#00A0B2',
    shadowColor: '#00A0B2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shopIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
