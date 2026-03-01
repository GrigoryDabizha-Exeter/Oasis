import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'incoming' | 'preparing' | 'dispatched';

interface MockOrder {
    id: string;
    shop: string;
    item: string;
    passenger: string;
    gate: string;
    status: OrderStatus;
    amount: string;
    time: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MOCK_ORDERS: MockOrder[] = [
    { id: 'ORD-882', shop: 'Pret A Manger',    item: '2x Organic Flat White',    passenger: '@CryptoFlyer',   gate: 'Gate 45',  status: 'preparing',  amount: '0.04 SOL', time: '2 mins ago'  },
    { id: 'ORD-883', shop: 'World Duty Free',   item: 'Toblerone Gold (360g)',    passenger: '@AeroNomad',     gate: 'Gate 12',  status: 'incoming',   amount: '0.08 SOL', time: 'Just now'    },
    { id: 'ORD-884', shop: 'The Red Lion',      item: 'Pint of Camden Hells',    passenger: '@GatwickGhost',  gate: 'Pickup',   status: 'dispatched', amount: '0.06 SOL', time: '15 mins ago' },
    { id: 'ORD-885', shop: 'Pret A Manger',    item: 'Jambon Beurre Baguette',  passenger: '@SkyHigh99',     gate: 'Gate 31',  status: 'incoming',   amount: '0.05 SOL', time: '1 min ago'   },
    { id: 'ORD-886', shop: 'The Red Lion',      item: 'Full English Breakfast',  passenger: '@TravelerDan',   gate: 'Table 4',  status: 'preparing',  amount: '0.11 SOL', time: '8 mins ago'  },
    { id: 'ORD-887', shop: 'World Duty Free',   item: 'Tom Ford Oud Wood 50ml',  passenger: '@LuxeNomad',     gate: 'Gate 07',  status: 'dispatched', amount: '0.85 SOL', time: '22 mins ago' },
    { id: 'ORD-888', shop: 'Pret A Manger',    item: 'Chicken Avocado Baguette',passenger: '@MorningRun',    gate: 'Gate 22',  status: 'preparing',  amount: '0.04 SOL', time: '5 mins ago'  },
];

const STATUS_CONFIG: Record<OrderStatus, { color: string; label: string }> = {
    incoming:   { color: '#4ADE80', label: 'INCOMING'   },
    preparing:  { color: '#FACC15', label: 'PREPARING'  },
    dispatched: { color: '#60A5FA', label: 'DISPATCHED' },
};

const incoming   = MOCK_ORDERS.filter((o) => o.status === 'incoming').length;
const preparing  = MOCK_ORDERS.filter((o) => o.status === 'preparing').length;

const KPIS = [
    { label: 'INCOMING',    value: String(incoming),  unit: 'NEW',   color: '#4ADE80' },
    { label: 'PREPARING',   value: String(preparing), unit: 'ACTIVE',color: '#FACC15' },
    { label: 'DISPATCHED',  value: '14',              unit: 'TODAY', color: '#60A5FA' },
    { label: 'SOL EARNED',  value: '4.25',            unit: 'SOL',   color: '#A78BFA' },
];

const REVENUE = [
    { vendor: 'World Duty Free', amount: '£8,340', pct: '67%' },
    { vendor: 'The Red Lion',    amount: '£2,790', pct: '22%' },
    { vendor: 'Pret A Manger',   amount: '£1,320', pct: '11%' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PartnerScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* ── Top bar ── */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backBtnText}>← PASSENGER APP</Text>
                    </TouchableOpacity>
                    <View style={styles.livePill}>
                        <View style={styles.livePillDot} />
                        <Text style={styles.livePillText}>LIVE</Text>
                    </View>
                </View>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <Text style={styles.label}>MERCHANT PORTAL</Text>
                    <Text style={styles.title}>Partner</Text>
                    <Text style={styles.subtitle}>London Gatwick · Terminal Operations</Text>
                </View>

                {/* ── KPI Grid (2×2) ── */}
                <View style={styles.kpiGrid}>
                    {KPIS.map((kpi) => (
                        <View key={kpi.label} style={styles.kpiCard}>
                            <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                            <Text style={[styles.kpiUnit, { color: kpi.color }]}>{kpi.unit}</Text>
                            <Text style={styles.kpiLabel}>{kpi.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />

                {/* ── Active Order Queue ── */}
                <View style={styles.sectionHeader}>
                    <View style={styles.liveDot} />
                    <Text style={styles.sectionTitle}>ACTIVE ORDER QUEUE</Text>
                    <Text style={styles.orderCount}>{MOCK_ORDERS.length} ORDERS</Text>
                </View>

                <View style={styles.orderList}>
                    {MOCK_ORDERS.map((order, idx) => {
                        const cfg = STATUS_CONFIG[order.status];
                        return (
                            <View
                                key={order.id}
                                style={[
                                    styles.orderCard,
                                    idx < MOCK_ORDERS.length - 1 && styles.orderCardBorder,
                                ]}
                            >
                                {/* Left column */}
                                <View style={styles.orderLeft}>
                                    <Text style={styles.orderId}>{order.id}</Text>
                                    <Text style={styles.orderItem}>{order.item}</Text>
                                    <View style={styles.orderMeta}>
                                        <Text style={styles.orderPassenger}>{order.passenger}</Text>
                                        <Text style={styles.orderDot}>·</Text>
                                        <Text style={styles.orderShop}>{order.shop}</Text>
                                    </View>
                                    <Text style={styles.orderTime}>{order.time}</Text>
                                </View>

                                {/* Right column */}
                                <View style={styles.orderRight}>
                                    <Text style={styles.orderGate}>{order.gate}</Text>
                                    <Text style={styles.orderAmount}>{order.amount}</Text>
                                    <View style={[styles.statusBadge, { borderColor: cfg.color }]}>
                                        <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                                        <Text style={[styles.statusText, { color: cfg.color }]}>
                                            {cfg.label}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.divider} />

                {/* ── Revenue Breakdown ── */}
                <Text style={styles.sectionTitle}>REVENUE BREAKDOWN — TODAY</Text>
                <View style={styles.revenueCard}>
                    {REVENUE.map((row, idx) => (
                        <View
                            key={row.vendor}
                            style={[styles.revenueRow, idx < REVENUE.length - 1 && styles.revenueRowBorder]}
                        >
                            <View style={styles.revenueLeft}>
                                <Text style={styles.revenueVendor}>{row.vendor}</Text>
                                <View style={styles.revenueBar}>
                                    <View style={[styles.revenueBarFill, { width: row.pct as any }]} />
                                </View>
                            </View>
                            <View style={styles.revenueRight}>
                                <Text style={styles.revenueAmount}>{row.amount}</Text>
                                <Text style={styles.revenuePct}>{row.pct}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Footer ── */}
                <Text style={styles.footer}>
                    OASIS NETWORK · POWERED BY SOLANA · {new Date().toISOString().slice(0, 10)}
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    scrollContent: { paddingBottom: 100 },

    // Top bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        marginBottom: 4,
    },
    backBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        backgroundColor: '#111111',
    },
    backBtnText: { color: '#666666', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#4ADE80',
        backgroundColor: '#0A1A0A',
    },
    livePillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
    livePillText: { color: '#4ADE80', fontSize: 10, fontWeight: '700', letterSpacing: 2 },

    // Header
    header: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 24 },
    label: { color: '#555555', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
    title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
    subtitle: { color: '#444444', fontSize: 13, marginTop: 4 },

    // KPI 2×2 grid
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 24,
    },
    kpiCard: {
        width: '47.5%',
        backgroundColor: '#0D0D0D',
        borderWidth: 1,
        borderColor: '#2A2A2A',
        padding: 14,
    },
    kpiValue: {
        fontSize: 28,
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
        letterSpacing: -1,
    },
    kpiUnit: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginTop: 2,
    },
    kpiLabel: {
        color: '#333333',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginTop: 10,
        textTransform: 'uppercase',
    },

    divider: { height: 1, backgroundColor: '#1A1A1A', marginHorizontal: 16, marginBottom: 20 },

    // Section header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 0,
        gap: 8,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
    sectionTitle: {
        flex: 1,
        color: '#555555',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        paddingHorizontal: 0,
        marginBottom: 0,
        paddingBottom: 12,
    },
    orderCount: {
        color: '#333333',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        paddingBottom: 12,
    },

    // Order list
    orderList: {
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#1A1A1A',
        backgroundColor: '#0A0A0A',
        marginBottom: 20,
    },
    orderCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 14,
    },
    orderCardBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },

    // Left column
    orderLeft: { flex: 1, paddingRight: 12 },
    orderId: {
        color: '#444444',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 4,
        fontVariant: ['tabular-nums'],
    },
    orderItem: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 5,
        lineHeight: 20,
    },
    orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
    orderPassenger: { color: '#4ADE80', fontSize: 11, fontWeight: '600' },
    orderDot: { color: '#333333', fontSize: 11 },
    orderShop: { color: '#444444', fontSize: 11, fontWeight: '500' },
    orderTime: { color: '#333333', fontSize: 10, fontWeight: '500', letterSpacing: 0.3 },

    // Right column
    orderRight: { alignItems: 'flex-end', gap: 6, paddingTop: 2 },
    orderGate: {
        color: '#888888',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    orderAmount: {
        color: '#A78BFA',
        fontSize: 13,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    statusDot: { width: 5, height: 5, borderRadius: 3 },
    statusText: { fontSize: 8, fontWeight: '700', letterSpacing: 1 },

    // Revenue breakdown
    revenueCard: {
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#1A1A1A',
        backgroundColor: '#0A0A0A',
        marginBottom: 24,
        marginTop: 0,
    },
    revenueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
    },
    revenueRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
    revenueLeft: { flex: 1, paddingRight: 16 },
    revenueVendor: { color: '#888888', fontSize: 13, fontWeight: '600', marginBottom: 6 },
    revenueBar: {
        height: 2,
        backgroundColor: '#1A1A1A',
        width: '100%',
    },
    revenueBarFill: {
        height: 2,
        backgroundColor: '#2A2A2A',
    },
    revenueRight: { alignItems: 'flex-end' },
    revenueAmount: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
    revenuePct: { color: '#444444', fontSize: 11, marginTop: 2 },

    footer: {
        color: '#222222',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.5,
        textAlign: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
});
