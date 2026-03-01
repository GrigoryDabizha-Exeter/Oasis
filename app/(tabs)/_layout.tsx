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
          backgroundColor: '#000000',
          borderTopWidth: 1,
          borderTopColor: '#2A2A2A',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#555555',
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
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    backgroundColor: '#444444',
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
  },
});
