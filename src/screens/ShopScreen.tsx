import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import ShopItemCard from '../components/shop/ShopItemCard';
import PinUnlockModal from '../components/ui/PinUnlockModal';
import RobotTrackerCard from '../components/ui/RobotTrackerCard';
import { useSolana } from '../providers/SolanaProvider';
import { createOrder } from '../services/ordersApi';
import { supabase } from '../services/supabaseClient';
import { MOCK_SHOP_ITEMS, calculateLoyaltyReward } from '../services/shopService';
import { ShopItem } from '../services/types';
import { useAuthStore } from '../stores/useAuthStore';
import { useFlightStore } from '../stores/useFlightStore';
import { useWalletStore } from '../stores/useWalletStore';

const VENDOR_ICONS: Record<string, string> = {
    'Pret A Manger': '☕',
    'World Duty Free': '🛍️',
    'The Red Lion': '🍺',
};

type ListRow =
    | { type: 'vendor-header'; shopName: string }
    | { type: 'item'; item: ShopItem };

// Build flat list: vendor header → items → vendor header → items …
function buildRows(): ListRow[] {
    const vendors = [...new Set(MOCK_SHOP_ITEMS.map((i) => i.shopName))];
    const rows: ListRow[] = [];
    for (const shopName of vendors) {
        rows.push({ type: 'vendor-header', shopName });
        MOCK_SHOP_ITEMS.filter((i) => i.shopName === shopName).forEach((item) =>
            rows.push({ type: 'item', item })
        );
    }
    return rows;
}

const LIST_ROWS = buildRows();

export default function ShopScreen() {
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const { connected, signTransaction } = useSolana();
    const { loyaltyTokens, setLoyaltyTokens } = useWalletStore();
    const user = useAuthStore((s) => s.user);
    const flightNumber = useAuthStore((s) => s.flightNumber);
    const departures = useFlightStore((s) => s.departures);

    const myFlight = departures.find(
        (f) => f.flight.iataNumber.replace(/\s/g, '').toUpperCase() ===
               (flightNumber ?? '').replace(/\s/g, '').toUpperCase()
    );
    const passengerGate = myFlight?.departure.gate ?? 'TBD';

    const handleBuy = async (item: ShopItem) => {
        if (!connected) {
            Alert.alert('Wallet Required', 'Connect your Solana wallet to make purchases.', [{ text: 'OK' }]);
            return;
        }

        try {
            const mockTx = `checkout_${item.id}_${Date.now()}`;
            const sig = await signTransaction(mockTx);

            const reward = calculateLoyaltyReward(item.price);
            setLoyaltyTokens(loyaltyTokens + reward);

            const localOrder = createOrder({
                item: item.name,
                price: item.price,
                shopName: item.shopName,
                gate: passengerGate,
                passengerName: user?.name ?? 'Oasis Guest',
            });

            try {
                const { error: insertError } = await supabase.from('orders').insert([{
                    item: localOrder.item,
                    passenger_name: localOrder.passengerName,
                    status: 'pending',
                    gate: localOrder.gate,
                    shop_name: localOrder.shopName,
                    price: localOrder.price,
                }]);
                if (insertError) {
                    Alert.alert('Cloud Error', insertError.message);
                }
            } catch (cloudErr: unknown) {
                const msg = cloudErr instanceof Error ? cloudErr.message : 'Unknown error';
                Alert.alert('Cloud Error', msg);
            }

            Alert.alert(
                '🎉 Order Placed!',
                `${item.name} ordered from ${item.shopName}!\n\nA droid will deliver to Gate ${passengerGate}.\n\n+${reward} OASIS tokens earned\nTx: ${sig.substring(0, 16)}...`
            );
        } catch {
            Alert.alert('Transaction Failed', 'Please try again.');
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                <Text style={styles.label}>GATWICK MARKETPLACE</Text>
                <Text style={styles.title}>Shop</Text>
                <Text style={styles.subtitle}>Order now · Droid delivers to your gate</Text>
            </View>
            <RobotTrackerCard onPinPress={() => setPinModalVisible(true)} />
        </View>
    );

    const renderRow = ({ item: row }: { item: ListRow }) => {
        if (row.type === 'vendor-header') {
            return (
                <View style={styles.vendorHeader}>
                    <Text style={styles.vendorIcon}>{VENDOR_ICONS[row.shopName] ?? '🏪'}</Text>
                    <View style={styles.vendorHeaderText}>
                        <Text style={styles.vendorName}>{row.shopName}</Text>
                        <View style={styles.vendorLiveDot} />
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.cardWrapper}>
                <ShopItemCard item={row.item} onBuy={() => handleBuy(row.item)} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={LIST_ROWS}
                keyExtractor={(row, idx) =>
                    row.type === 'vendor-header' ? `hdr-${row.shopName}` : `item-${row.item.id}-${idx}`
                }
                renderItem={renderRow}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
            />
            <PinUnlockModal visible={pinModalVisible} onClose={() => setPinModalVisible(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    listContent: { paddingBottom: 100 },
    headerContainer: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
    header: { marginBottom: 20 },
    label: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
    subtitle: { color: '#555555', fontSize: 13, marginTop: 4 },

    // Vendor section header
    vendorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 10,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#1A1A1A',
    },
    vendorIcon: { fontSize: 22 },
    vendorHeaderText: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    vendorName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    vendorLiveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22C55E',
    },

    cardWrapper: { paddingHorizontal: 16, marginBottom: 8 },
});
