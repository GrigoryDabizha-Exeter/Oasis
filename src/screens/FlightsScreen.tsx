import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FlightCard from '../components/flights/FlightCard';
import QueueCard from '../components/queues/QueueCard';
import GlassCard from '../components/ui/GlassCard';
import HeroFlightCard from '../components/ui/HeroFlightCard';
import HeroSearchConcierge from '../components/ui/HeroSearchConcierge';
import PinUnlockModal from '../components/ui/PinUnlockModal';
import RobotTrackerCard from '../components/ui/RobotTrackerCard';
import { generateMockQueues } from '../services/queueApi';
import { useFlightStore } from '../stores/useFlightStore';
import { useQueueStore } from '../stores/useQueueStore';

export default function FlightsScreen() {
    const { departures, arrivals, flightType, isLoading, dataSource, error, loadLiveFlights, setFlightType } = useFlightStore();
    const { queues, setQueues } = useQueueStore();
    const [refreshing, setRefreshing] = useState(false);
    const [showQueues, setShowQueues] = useState(false);
    const [pinModalVisible, setPinModalVisible] = useState(false);

    // Load live flights on mount; auto-refresh every 60 s
    useEffect(() => {
        loadLiveFlights();
        setQueues(generateMockQueues());
        const interval = setInterval(() => {
            loadLiveFlights();
            setQueues(generateMockQueues());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadLiveFlights();
        setQueues(generateMockQueues());
        setRefreshing(false);
    }, [loadLiveFlights]);

    const flights = flightType === 'departure' ? departures : arrivals;

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Hero Flight Card (user's flight) */}
            <HeroFlightCard />

            {/* Hero */}
            <View style={styles.hero}>
                <Text style={styles.heroLabel}>LONDON GATWICK</Text>
                <Text style={styles.heroTitle}>Oasis</Text>
                <Text style={styles.heroSubtitle}>Your journey starts here</Text>
            </View>

            {/* Droid Delivery Tracker */}
            <RobotTrackerCard onPinPress={() => setPinModalVisible(true)} />

            {/* AI Concierge Search */}
            <HeroSearchConcierge />

            {/* Data source status row */}
            <View style={styles.statusRow}>
                {isLoading ? (
                    <Text style={styles.syncText}>⟳  SYNCING GATWICK RADAR...</Text>
                ) : dataSource === 'live' ? (
                    <Text style={styles.sourceTagLive}>● LIVE TELEMETRY</Text>
                ) : dataSource === 'error' ? (
                    <Text style={styles.sourceTagMock}>
                        ○ OFFLINE{error ? `  ·  ${error.slice(0, 60)}` : ''}
                    </Text>
                ) : null}

                {/* Force Refresh button — always visible so the user can re-trigger */}
                <TouchableOpacity
                    style={[styles.refreshBtn, isLoading && styles.refreshBtnDisabled]}
                    onPress={onRefresh}
                    disabled={isLoading}
                >
                    <Text style={styles.refreshBtnText}>↻ REFRESH</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <GlassCard elevated>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {isLoading ? '—' : departures.length}
                        </Text>
                        <Text style={styles.statLabel}>Departures</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {isLoading ? '—' : arrivals.length}
                        </Text>
                        <Text style={styles.statLabel}>Arrivals</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: '#4ADE80' }]}>
                            {queues.length > 0 ? `${Math.min(...queues.map(q => q.waitTimeMinutes))}m` : '—'}
                        </Text>
                        <Text style={styles.statLabel}>Min Queue</Text>
                    </View>
                </View>
            </GlassCard>

            {/* Toggle: Flights / Security */}
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.toggleBtn, !showQueues && styles.toggleBtnActive]}
                    onPress={() => setShowQueues(false)}
                >
                    <Text style={[styles.toggleText, !showQueues && styles.toggleTextActive]}>✈️ Flights</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, showQueues && styles.toggleBtnActive]}
                    onPress={() => setShowQueues(true)}
                >
                    <Text style={[styles.toggleText, showQueues && styles.toggleTextActive]}>🔒 Security</Text>
                </TouchableOpacity>
            </View>

            {/* Departure / Arrival sub-toggle */}
            {!showQueues && (
                <View style={styles.typeRow}>
                    <TouchableOpacity
                        onPress={() => setFlightType('departure')}
                        style={[styles.typeBtn, flightType === 'departure' && styles.typeBtnActive]}
                    >
                        <Text style={[styles.typeText, flightType === 'departure' && styles.typeTextActive]}>
                            Departures
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFlightType('arrival')}
                        style={[styles.typeBtn, flightType === 'arrival' && styles.typeBtnActive]}
                    >
                        <Text style={[styles.typeText, flightType === 'arrival' && styles.typeTextActive]}>
                            Arrivals
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    if (showQueues) {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={queues}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.cardWrapper}>
                            <QueueCard queue={item} />
                        </View>
                    )}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={flights}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <FlightCard flight={item} type={flightType} />
                    </View>
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
                initialNumToRender={8}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>No flights loaded</Text>
                            <Text style={styles.emptySubtitle}>Pull down to refresh or tap ↻ REFRESH above</Text>
                        </View>
                    ) : null
                }
            />
            <PinUnlockModal visible={pinModalVisible} onClose={() => setPinModalVisible(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    listContent: {
        paddingBottom: 100,
    },
    cardWrapper: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    hero: {
        marginBottom: 20,
        paddingTop: 8,
    },
    heroLabel: {
        color: '#666666',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 4,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -1,
    },
    heroSubtitle: {
        color: '#444444',
        fontSize: 15,
        marginTop: 4,
    },

    // Status row (source tag + refresh button side-by-side)
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        marginTop: 4,
        minHeight: 28,
    },
    syncText: {
        color: '#888888',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        flex: 1,
    },
    sourceTagLive: {
        color: '#4ADE80',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        flex: 1,
    },
    sourceTagMock: {
        color: '#555555',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        flex: 1,
    },
    refreshBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        backgroundColor: '#111111',
    },
    refreshBtnDisabled: {
        opacity: 0.35,
    },
    refreshBtnText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    // Stats card
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        color: '#555555',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#2A2A2A',
    },

    // Flights / Security toggle
    toggleRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 8,
        marginBottom: 12,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    toggleBtnActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    toggleText: {
        color: '#555555',
        fontSize: 14,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#000000',
    },

    // Departure / Arrival sub-toggle
    typeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    typeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    typeBtnActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#FFFFFF',
    },
    typeText: {
        color: '#444444',
        fontSize: 14,
        fontWeight: '600',
    },
    typeTextActive: {
        color: '#FFFFFF',
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        color: '#444444',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#333333',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
});
