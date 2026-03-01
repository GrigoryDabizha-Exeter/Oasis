import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import GlassButton from '../components/ui/GlassButton';
import GlassCard from '../components/ui/GlassCard';
import { useSolana } from '../providers/SolanaProvider';
import { getLoyaltyBurnOptions } from '../services/shopService';
import { useWalletStore } from '../stores/useWalletStore';

export default function WalletScreen() {
    const { connect, disconnect, connected, publicKey, signTransaction } = useSolana();
    const { balance, loyaltyTokens, setLoyaltyTokens, setBalance } = useWalletStore();
    const [connecting, setConnecting] = useState(false);
    const [burning, setBurning] = useState<string | null>(null);

    const burnOptions = getLoyaltyBurnOptions();

    const handleConnect = async () => {
        setConnecting(true);
        await connect();
        setConnecting(false);
    };

    const handleBurn = async (optionId: string, tokensRequired: number, name: string) => {
        if (loyaltyTokens < tokensRequired) {
            Alert.alert('Insufficient Tokens', `You need ${tokensRequired} OASIS tokens for ${name}.`);
            return;
        }
        setBurning(optionId);
        try {
            // Simulate token burn transaction
            const mockTx = `burn_${Date.now()}`;
            const sig = await signTransaction(mockTx);
            setLoyaltyTokens(loyaltyTokens - tokensRequired);
            Alert.alert('🎉 Success!', `${name} unlocked!\n\nTx: ${sig.substring(0, 20)}...`);
        } catch {
            Alert.alert('Error', 'Transaction failed. Please try again.');
        }
        setBurning(null);
    };

    const truncatedKey = publicKey
        ? `${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)}`
        : null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.label}>SOLANA WALLET</Text>
                    <Text style={styles.title}>Wallet</Text>
                    <Text style={styles.subtitle}>Devnet • Frictionless payments</Text>
                </View>

                {/* Connection Card */}
                {!connected ? (
                    <GlassCard elevated style={styles.connectCard}>
                        <Text style={styles.connectIcon}>◎</Text>
                        <Text style={styles.connectTitle}>Connect Your Wallet</Text>
                        <Text style={styles.connectSub}>
                            Link Phantom or Backpack to enable one-tap payments, loyalty rewards, and gig tipping.
                        </Text>
                        <GlassButton
                            title="Connect Wallet"
                            icon="🔗"
                            onPress={handleConnect}
                            loading={connecting}
                            style={styles.connectBtn}
                        />
                    </GlassCard>
                ) : (
                    <>
                        {/* Balance Card */}
                        <GlassCard elevated highlight style={styles.balanceCard}>
                            <View style={styles.balanceHeader}>
                                <Text style={styles.balanceLabel}>WALLET</Text>
                                <GlassButton
                                    title="Disconnect"
                                    variant="ghost"
                                    size="sm"
                                    onPress={disconnect}
                                />
                            </View>
                            <Text style={styles.address}>{truncatedKey}</Text>

                            <View style={styles.balancesRow}>
                                <View style={styles.balanceItem}>
                                    <Text style={styles.balanceSymbol}>◎</Text>
                                    <Text style={styles.balanceValue}>{balance.toFixed(2)}</Text>
                                    <Text style={styles.balanceCurrency}>SOL</Text>
                                </View>
                                <View style={styles.balanceDivider} />
                                <View style={styles.balanceItem}>
                                    <Text style={styles.balanceSymbol}>💎</Text>
                                    <Text style={styles.balanceValue}>{loyaltyTokens.toLocaleString()}</Text>
                                    <Text style={styles.balanceCurrency}>OASIS</Text>
                                </View>
                            </View>

                            <View style={styles.networkBadge}>
                                <View style={styles.networkDot} />
                                <Text style={styles.networkText}>Solana Devnet</Text>
                            </View>
                        </GlassCard>

                        {/* Loyalty Burn Options */}
                        <Text style={styles.sectionTitle}>Burn OASIS Tokens</Text>
                        <Text style={styles.sectionSub}>Redeem loyalty tokens for premium airport services</Text>

                        {burnOptions.map((opt) => (
                            <View key={opt.id} style={styles.burnWrapper}>
                                <GlassCard>
                                    <View style={styles.burnRow}>
                                        <Text style={styles.burnIcon}>{opt.icon}</Text>
                                        <View style={styles.burnInfo}>
                                            <Text style={styles.burnName}>{opt.name}</Text>
                                            <Text style={styles.burnCost}>{opt.tokensRequired} OASIS tokens</Text>
                                        </View>
                                        <GlassButton
                                            title="Burn"
                                            icon="🔥"
                                            size="sm"
                                            variant={loyaltyTokens >= opt.tokensRequired ? 'primary' : 'secondary'}
                                            disabled={loyaltyTokens < opt.tokensRequired}
                                            loading={burning === opt.id}
                                            onPress={() => handleBurn(opt.id, opt.tokensRequired, opt.name)}
                                        />
                                    </View>
                                </GlassCard>
                            </View>
                        ))}

                        {/* Tx History */}
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <GlassCard style={styles.historyCard}>
                            <View style={styles.txRow}>
                                <Text style={styles.txIcon}>🛍️</Text>
                                <View style={styles.txInfo}>
                                    <Text style={styles.txDesc}>Duty Free Purchase</Text>
                                    <Text style={styles.txTime}>2 min ago</Text>
                                </View>
                                <Text style={styles.txAmount}>-0.08 SOL</Text>
                            </View>
                            <View style={styles.txDivider} />
                            <View style={styles.txRow}>
                                <Text style={styles.txIcon}>💎</Text>
                                <View style={styles.txInfo}>
                                    <Text style={styles.txDesc}>Loyalty Reward</Text>
                                    <Text style={styles.txTime}>2 min ago</Text>
                                </View>
                                <Text style={[styles.txAmount, { color: '#4ADE80' }]}>+80 OASIS</Text>
                            </View>
                            <View style={styles.txDivider} />
                            <View style={styles.txRow}>
                                <Text style={styles.txIcon}>✈️</Text>
                                <View style={styles.txInfo}>
                                    <Text style={styles.txDesc}>Fast Track Security</Text>
                                    <Text style={styles.txTime}>1 hour ago</Text>
                                </View>
                                <Text style={[styles.txAmount, { color: '#F87171' }]}>-500 OASIS</Text>
                            </View>
                        </GlassCard>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    scrollContent: { paddingBottom: 100 },
    header: { paddingHorizontal: 16, paddingTop: 24, marginBottom: 20 },
    label: { color: '#888888', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
    subtitle: { color: '#555555', fontSize: 13, marginTop: 4 },
    connectCard: { marginHorizontal: 16, alignItems: 'center', paddingVertical: 40 },
    connectIcon: { fontSize: 48, color: '#FFFFFF', marginBottom: 16 },
    connectTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 8 },
    connectSub: { color: '#666666', fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16, marginBottom: 24 },
    connectBtn: { width: '100%' },
    balanceCard: { marginHorizontal: 16, marginBottom: 24 },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    balanceLabel: { color: '#666666', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
    address: { color: '#666666', fontSize: 13, fontFamily: 'monospace', marginBottom: 20 },
    balancesRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 16 },
    balanceItem: { alignItems: 'center' },
    balanceSymbol: { fontSize: 24, marginBottom: 4 },
    balanceValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    balanceCurrency: { color: '#666666', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginTop: 4 },
    balanceDivider: { width: 1, height: 48, backgroundColor: '#2A2A2A' },
    networkBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 0, backgroundColor: '#1A1A1A',
        borderWidth: 1, borderColor: '#2A2A2A',
    },
    networkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
    networkText: { color: '#22C55E', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    sectionTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 2, paddingHorizontal: 16, marginBottom: 4 },
    sectionSub: { color: '#555555', fontSize: 13, paddingHorizontal: 16, marginBottom: 16 },
    burnWrapper: { paddingHorizontal: 16, marginBottom: 8 },
    burnRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    burnIcon: { fontSize: 28 },
    burnInfo: { flex: 1 },
    burnName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    burnCost: { color: '#666666', fontSize: 12, marginTop: 2 },
    historyCard: { marginHorizontal: 16 },
    txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    txIcon: { fontSize: 24 },
    txInfo: { flex: 1 },
    txDesc: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
    txTime: { color: '#555555', fontSize: 11, marginTop: 2 },
    txAmount: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    txDivider: { height: 1, backgroundColor: '#2A2A2A' },
});
