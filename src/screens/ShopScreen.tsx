import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ShopItemCard from '../components/shop/ShopItemCard';
import GlassCard from '../components/ui/GlassCard';
import { useSolana } from '../providers/SolanaProvider';
import { MOCK_SHOP_ITEMS, calculateLoyaltyReward } from '../services/shopService';
import { ShopItem } from '../services/types';
import { useWalletStore } from '../stores/useWalletStore';

type Category = 'all' | 'duty-free' | 'food' | 'lounge' | 'service';

export default function ShopScreen() {
    const [category, setCategory] = useState<Category>('all');
    const { connected, signTransaction } = useSolana();
    const { balance, setBalance, loyaltyTokens, setLoyaltyTokens } = useWalletStore();

    const categories: { key: Category; label: string; icon: string }[] = [
        { key: 'all', label: 'All', icon: '🏪' },
        { key: 'duty-free', label: 'Duty Free', icon: '🛍️' },
        { key: 'food', label: 'Food', icon: '🍽️' },
        { key: 'lounge', label: 'Lounges', icon: '✨' },
        { key: 'service', label: 'Services', icon: '⚡' },
    ];

    const filteredItems = category === 'all'
        ? MOCK_SHOP_ITEMS
        : MOCK_SHOP_ITEMS.filter((item) => item.category === category);

    const handleBuy = async (item: ShopItem) => {
        if (!connected) {
            Alert.alert('Wallet Required', 'Connect your Solana wallet to make purchases.', [
                { text: 'OK' },
            ]);
            return;
        }
        if (balance < item.price) {
            Alert.alert('Insufficient Balance', `You need ${item.price} SOL for this purchase.`);
            return;
        }

        try {
            // Simulate Blink transaction flow
            // 1. GET metadata (already have it from item)
            // 2. POST to get signable transaction
            const mockTx = `checkout_${item.id}_${Date.now()}`;
            const sig = await signTransaction(mockTx);

            // Update balances
            setBalance(balance - item.price);
            const reward = calculateLoyaltyReward(item.price);
            setLoyaltyTokens(loyaltyTokens + reward);

            Alert.alert(
                '🎉 Purchase Complete!',
                `${item.name}\n\n-${item.price} SOL\n+${reward} OASIS loyalty tokens\n\nTx: ${sig.substring(0, 16)}...`
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
                <Text style={styles.subtitle}>Pay with SOL • Earn OASIS rewards</Text>
            </View>

            {/* Tip Porter Banner */}
            <GlassCard elevated highlight style={styles.tipBanner}>
                <View style={styles.tipRow}>
                    <View style={styles.tipInfo}>
                        <Text style={styles.tipTitle}>💰 Tip Your Porter</Text>
                        <Text style={styles.tipSub}>Scan a porter's QR code for instant SOL tipping</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.scanBtn}
                        onPress={() => Alert.alert('QR Scanner', 'Camera would open to scan porter QR code')}
                    >
                        <Text style={styles.scanBtnText}>📷 Scan</Text>
                    </TouchableOpacity>
                </View>
            </GlassCard>

            {/* Category Filter */}
            <View style={styles.categoryRow}>
                {categories.map(({ key, label, icon }) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.categoryBtn, category === key && styles.categoryBtnActive]}
                        onPress={() => setCategory(key)}
                    >
                        <Text style={styles.categoryIcon}>{icon}</Text>
                        <Text style={[styles.categoryLabel, category === key && styles.categoryLabelActive]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <ShopItemCard item={item} onBuy={() => handleBuy(item)} />
                    </View>
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111111' },
    listContent: { paddingBottom: 100 },
    headerContainer: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
    header: { marginBottom: 20 },
    label: { color: '#00A0B2', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
    subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
    tipBanner: { marginBottom: 16 },
    tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    tipInfo: { flex: 1 },
    tipTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
    tipSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    scanBtn: {
        backgroundColor: 'rgba(0, 160, 178, 0.15)',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0, 160, 178, 0.3)',
    },
    scanBtnText: { color: '#00A0B2', fontSize: 13, fontWeight: '600' },
    categoryRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
    categoryBtn: {
        flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    categoryBtnActive: { backgroundColor: 'rgba(0, 160, 178, 0.12)', borderColor: 'rgba(0, 160, 178, 0.3)' },
    categoryIcon: { fontSize: 16, marginBottom: 2 },
    categoryLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' },
    categoryLabelActive: { color: '#00A0B2' },
    cardWrapper: { paddingHorizontal: 16, marginBottom: 12 },
});
