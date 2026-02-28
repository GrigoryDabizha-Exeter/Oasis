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
import { generateMockArrivals, generateMockDepartures } from '../services/flightApi';
import { generateMockQueues } from '../services/queueApi';
import { useFlightStore } from '../stores/useFlightStore';
import { useQueueStore } from '../stores/useQueueStore';

export default function FlightsScreen() {
    const { departures, arrivals, flightType, setDepartures, setArrivals, setFlightType } = useFlightStore();
    const { queues, setQueues } = useQueueStore();
    const [refreshing, setRefreshing] = useState(false);
    const [showQueues, setShowQueues] = useState(false);
    const [pinModalVisible, setPinModalVisible] = useState(false);

    const loadData = useCallback(() => {
        setDepartures(generateMockDepartures(20));
        setArrivals(generateMockArrivals(15));
        setQueues(generateMockQueues());
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        loadData();
        setTimeout(() => setRefreshing(false), 500);
    }, [loadData]);

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

            {/* Quick Stats */}
            <GlassCard elevated>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{departures.length}</Text>
                        <Text style={styles.statLabel}>Departures</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{arrivals.length}</Text>
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

            {/* Toggle: Flights / Queues */}
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

            {/* Flight type toggle */}
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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A0B2" />}
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A0B2" />}
                initialNumToRender={8}
            />
            <PinUnlockModal visible={pinModalVisible} onClose={() => setPinModalVisible(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111111',
    },
    listContent: {
        paddingBottom: 100,
    },
    cardWrapper: {
        paddingHorizontal: 16,
        marginBottom: 12,
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
        color: '#00A0B2',
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
        color: 'rgba(255,255,255,0.4)',
        fontSize: 15,
        marginTop: 4,
    },
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
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    toggleRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 8,
        marginBottom: 12,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    toggleBtnActive: {
        backgroundColor: 'rgba(0, 160, 178, 0.12)',
        borderColor: 'rgba(0, 160, 178, 0.3)',
    },
    toggleText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#00A0B2',
    },
    typeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    typeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    typeBtnActive: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    typeText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 14,
        fontWeight: '600',
    },
    typeTextActive: {
        color: '#FFFFFF',
    },
});
