import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useAuthStore } from '../stores/useAuthStore';
import { useFlightStore } from '../stores/useFlightStore';
import { useWalletStore } from '../stores/useWalletStore';
import { spacing } from '../theme/tokens';

// ─── Trivia Data ──────────────────────────────────────────────────────────────
const TRIVIA_QUESTIONS = [
    {
        q: 'What is the three-letter IATA code for London Gatwick?',
        options: ['LHR', 'LGW', 'GTW', 'LTN'],
        answer: 'LGW',
    },
    {
        q: "Which commercial aircraft is famously known as the 'Jumbo Jet'?",
        options: ['Airbus A380', 'Boeing 737', 'Boeing 747', 'Concorde'],
        answer: 'Boeing 747',
    },
    {
        q: 'What is the cruising altitude of a typical commercial flight?',
        options: ['10,000 ft', '20,000 ft', '35,000 ft', '50,000 ft'],
        answer: '35,000 ft',
    },
];

type GameState = 'idle' | 'playing' | 'finished';

// ─── Helper ───────────────────────────────────────────────────────────────────
function timeToBoarding(scheduledTime: string): string {
    const now = new Date();
    const [h, m] = scheduledTime.split(':').map(Number);
    const dep = new Date();
    dep.setHours(h, m, 0, 0);
    if (dep < now) dep.setDate(dep.getDate() + 1);
    const mins = Math.round((dep.getTime() - now.getTime()) / 60000);
    if (mins <= 0) return 'Boarding now';
    if (mins < 60) return `${mins} mins to boarding`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m to boarding`;
}

// ─── Static leaderboard entries ───────────────────────────────────────────────
const STATIC_BOARD = [
    { rank: 1, medal: '1', handle: '@CryptoFlyer',  pts: 4200, oasis: 500  },
    { rank: 2, medal: '2', handle: '@GatwickGhost', pts: 3850, oasis: 250  },
    { rank: 4, medal: '4', handle: '@AeroNomad',    pts: 2900, oasis: null },
];

// ─── LeaderRow ────────────────────────────────────────────────────────────────
interface LeaderRowProps {
    medal: string;
    handle: string;
    pts: number;
    oasis: number | null;
    isUser?: boolean;
}

function LeaderRow({ medal, handle, pts, oasis, isUser = false }: LeaderRowProps) {
    return (
        <View style={[styles.leaderRow, isUser && styles.leaderRowUser]}>
            {isUser && <View style={styles.leaderUserAccent} />}
            <Text style={styles.leaderMedal}>{medal}</Text>
            <View style={styles.leaderInfo}>
                <Text style={[styles.leaderHandle, isUser && styles.leaderHandleUser]}>
                    {handle}{isUser ? '  (You)' : ''}
                </Text>
                <Text style={styles.leaderPts}>{pts.toLocaleString()} pts</Text>
            </View>
            <View style={styles.leaderReward}>
                {oasis !== null ? (
                    <Text style={styles.leaderRewardAmt}>+{oasis} OASIS</Text>
                ) : (
                    <Text style={styles.leaderRewardDash}>—</Text>
                )}
            </View>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function FlightLoungeScreen() {
    const user         = useAuthStore((s) => s.user);
    const flightNumber = useAuthStore((s) => s.flightNumber);
    const departures   = useFlightStore((s) => s.departures);
    const { loyaltyTokens, setLoyaltyTokens } = useWalletStore();

    const [localTokens, setLocalTokens] = useState(loyaltyTokens);
    const [gameState, setGameState]         = useState<GameState>('idle');
    const [currentQ, setCurrentQ]           = useState(0);
    const [score, setScore]                 = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [userBalance, setUserBalance]     = useState(1500);

    useEffect(() => { setLocalTokens(loyaltyTokens); }, [loyaltyTokens]);

    const myFlight = departures.find(
        (f) => f.flight.iataNumber.replace(/\s/g, '').toUpperCase() ===
               (flightNumber ?? '').replace(/\s/g, '').toUpperCase()
    );
    const gate          = myFlight?.departure.gate ?? '40';
    const terminal      = myFlight?.departure.terminal ?? 'S';
    const boardingTxt   = myFlight ? timeToBoarding(myFlight.departure.scheduledTime) : '45 mins to boarding';
    const displayFlight = flightNumber ?? 'U28499';
    const userName      = user?.name ?? 'Oasis Guest';

    // Balance pulse
    const tokenScale = useSharedValue(1);
    useEffect(() => {
        tokenScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1400 }),
                withTiming(1,    { duration: 1400 })
            ),
            -1,
            false
        );
    }, []);
    const tokenPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: tokenScale.value }],
    }));

    // ── Game handlers ─────────────────────────────────────────────────────────
    const handleStartGame = () => {
        setUserBalance((b) => b - 10);
        setCurrentQ(0);
        setScore(0);
        setSelectedAnswer(null);
        setGameState('playing');
    };

    const handleAnswer = (option: string) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(option);
        const correct = option === TRIVIA_QUESTIONS[currentQ].answer;
        if (correct) setScore((s) => s + 1);
        setTimeout(() => {
            const nextQ = currentQ + 1;
            if (nextQ >= TRIVIA_QUESTIONS.length) {
                setGameState('finished');
            } else {
                setCurrentQ(nextQ);
                setSelectedAnswer(null);
            }
        }, 1000);
    };

    const handleClaim = () => {
        const winnings = score * 50;
        setUserBalance((b) => b + winnings);
        const newTokens = loyaltyTokens + winnings;
        setLoyaltyTokens(newTokens);
        setLocalTokens(newTokens);
        setGameState('idle');
        setCurrentQ(0);
        setScore(0);
        setSelectedAnswer(null);
    };

    // ── Option styling helpers ────────────────────────────────────────────────
    const getOptionStyle = (option: string) => {
        if (selectedAnswer === null) return styles.optionBtn;
        if (option === TRIVIA_QUESTIONS[currentQ].answer) return [styles.optionBtn, styles.optionCorrect];
        if (option === selectedAnswer) return [styles.optionBtn, styles.optionWrong];
        return [styles.optionBtn, styles.optionDimmed];
    };

    const getOptionTextColor = (option: string): string => {
        if (selectedAnswer === null) return '#FFFFFF';
        if (option === TRIVIA_QUESTIONS[currentQ].answer) return '#22C55E';
        if (option === selectedAnswer) return '#EF4444';
        return '#333333';
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ══ HERO ════════════════════════════════════════════════════ */}
                <Animated.View entering={FadeInDown.duration(350)} style={styles.heroCard}>
                    <View style={styles.heroTop}>
                        <View style={styles.heroLeft}>
                            <Text style={styles.heroLabel}>GATE {gate} · TERMINAL {terminal}</Text>
                            <Text style={styles.heroTitle}>Flight Lobby</Text>
                            <Text style={styles.heroSubtitle}>
                                {displayFlight} · {boardingTxt}
                            </Text>
                        </View>

                        <Animated.View style={[styles.tokenBadge, tokenPulseStyle]}>
                            <Text style={styles.tokenAmt}>{userBalance.toLocaleString()}</Text>
                            <Text style={styles.tokenLbl}>OASIS</Text>
                        </Animated.View>
                    </View>

                    <View style={styles.pillRow}>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>✈ {displayFlight}</Text>
                        </View>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>TERMINAL {terminal}</Text>
                        </View>
                        <View style={[styles.pill, styles.pillActive]}>
                            <Text style={[styles.pillText, styles.pillActiveText]}>GATE {gate}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ══ TRIVIA GAME CARD ═════════════════════════════════════════ */}
                <Animated.View entering={FadeInDown.duration(350).delay(80)}>
                    <View style={styles.triviaCard}>

                        {/* Top badges row */}
                        <View style={styles.triviaTopRow}>
                            <View style={styles.liveGameBadge}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveGameText}>LIVE GAME</Text>
                            </View>
                            {gameState === 'idle' && (
                                <Text style={styles.stakeBadgeText}>STAKE 10 OASIS</Text>
                            )}
                            {gameState === 'playing' && (
                                <Text style={styles.progressText}>
                                    Q {currentQ + 1} / {TRIVIA_QUESTIONS.length}
                                </Text>
                            )}
                            {gameState === 'finished' && (
                                <Text style={styles.completedText}>COMPLETE</Text>
                            )}
                        </View>

                        {/* ── IDLE ────────────────────────────────────── */}
                        {gameState === 'idle' && (
                            <>
                                <Text style={styles.triviaTitle}>Terminal Trivia</Text>
                                <Text style={styles.triviaEdition}>AVIATION EDITION</Text>
                                <Text style={styles.triviaDesc}>
                                    Answer fast. Beat your flight. Earn tokens.
                                </Text>

                                <View style={styles.triviaStatsRow}>
                                    {[
                                        { label: 'PLAYERS',    value: '47'   },
                                        { label: 'PRIZE POOL', value: '2.4K' },
                                        { label: 'ROUND',      value: '3/5'  },
                                    ].map((s) => (
                                        <View key={s.label} style={styles.triviaStat}>
                                            <Text style={styles.triviaStatVal}>{s.value}</Text>
                                            <Text style={styles.triviaStatLbl}>{s.label}</Text>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.playBtn} onPress={handleStartGame} activeOpacity={0.75}>
                                    <Text style={styles.playBtnText}>▶  PLAY & STAKE 10 OASIS</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* ── PLAYING ─────────────────────────────────── */}
                        {gameState === 'playing' && (
                            <>
                                <View style={styles.qProgressBar}>
                                    <View
                                        style={[
                                            styles.qProgressFill,
                                            { width: `${(currentQ / TRIVIA_QUESTIONS.length) * 100}%` },
                                        ]}
                                    />
                                </View>

                                <Text style={styles.questionText}>
                                    {TRIVIA_QUESTIONS[currentQ].q}
                                </Text>

                                <View style={styles.optionsGrid}>
                                    {TRIVIA_QUESTIONS[currentQ].options.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={getOptionStyle(option)}
                                            onPress={() => handleAnswer(option)}
                                            disabled={selectedAnswer !== null}
                                            activeOpacity={0.75}
                                        >
                                            <Text style={[
                                                styles.optionBtnText,
                                                { color: getOptionTextColor(option) },
                                            ]}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        {/* ── FINISHED ────────────────────────────────── */}
                        {gameState === 'finished' && (
                            <>
                                <Text style={styles.finishedTitle}>TRIVIA COMPLETE</Text>
                                <Text style={styles.finishedScore}>
                                    {score}/{TRIVIA_QUESTIONS.length} CORRECT
                                </Text>

                                <View style={styles.winningsBox}>
                                    <Text style={styles.winningsLabel}>YOUR REWARD</Text>
                                    <Text style={styles.winningsAmt}>+{score * 50}</Text>
                                    <Text style={styles.winningsUnit}>OASIS TOKENS</Text>
                                </View>

                                <TouchableOpacity style={styles.claimBtn} onPress={handleClaim} activeOpacity={0.75}>
                                    <Text style={styles.claimBtnText}>CLAIM {score * 50} OASIS</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </Animated.View>

                {/* ══ LEADERBOARD ══════════════════════════════════════════════ */}
                <Animated.View entering={FadeInDown.duration(350).delay(160)}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>FLIGHT LEADERBOARD</Text>
                        <View style={styles.livePill}>
                            <View style={[styles.liveDot, { backgroundColor: '#EF4444' }]} />
                            <Text style={styles.livePillText}>LIVE</Text>
                        </View>
                    </View>

                    {STATIC_BOARD.slice(0, 2).map((e) => (
                        <LeaderRow key={e.handle} {...e} />
                    ))}

                    <LeaderRow
                        medal="3"
                        handle={userName}
                        pts={localTokens > 500 ? localTokens : 3100}
                        oasis={null}
                        isUser
                    />

                    <LeaderRow {...STATIC_BOARD[2]} />
                </Animated.View>

                {/* ══ SPEND REWARDS ════════════════════════════════════════════ */}
                <Animated.View entering={FadeInDown.duration(350).delay(240)} style={styles.footerSection}>
                    <TouchableOpacity
                        style={styles.spendBtn}
                        onPress={() => router.navigate('/(tabs)/shop')}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.spendBtnText}>SPEND REWARDS IN SHOP</Text>
                    </TouchableOpacity>
                    <Text style={styles.spendHint}>
                        Redeem OASIS tokens for duty-free, food & lounge upgrades
                    </Text>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ── Aviation Brutalism ─────────────────────────────────────────────
const CARD   = '#111111';
const BORDER = '#2A2A2A';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    scroll:    { padding: spacing.md, paddingBottom: 100 },

    // ── Hero ──────────────────────────────────────────────────────────────────
    heroCard: {
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 0,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    heroLeft: { flex: 1, paddingRight: spacing.sm },
    heroLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#888888',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    heroTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
        lineHeight: 38,
        marginBottom: 6,
    },
    heroSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666666',
    },

    // Token badge — solid, no glow
    tokenBadge: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 0,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: 'center',
    },
    tokenAmt: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
    tokenLbl: { fontSize: 9,  fontWeight: '700', color: '#888888', letterSpacing: 2, marginTop: 2 },

    // Pills
    pillRow: { flexDirection: 'row', gap: 6 },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 0,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: BORDER,
    },
    pillActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    pillText: { fontSize: 10, fontWeight: '700', color: '#888888', letterSpacing: 0.5 },
    pillActiveText: { color: '#000000' },

    // ── Trivia Card ───────────────────────────────────────────────────────────
    triviaCard: {
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 0,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    triviaTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    liveGameBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    liveGameText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1.5 },
    stakeBadgeText: { fontSize: 10, fontWeight: '700', color: '#888888', letterSpacing: 1 },
    progressText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
    completedText: { fontSize: 11, fontWeight: '700', color: '#22C55E', letterSpacing: 1 },

    // Idle state
    triviaTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    triviaEdition: {
        fontSize: 11,
        fontWeight: '700',
        color: '#888888',
        letterSpacing: 2,
        marginBottom: 12,
    },
    triviaDesc: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    triviaStatsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    triviaStat: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 0,
        paddingVertical: 10,
        alignItems: 'center',
    },
    triviaStatVal: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
    triviaStatLbl: { fontSize: 9, fontWeight: '700', color: '#666666', letterSpacing: 1, marginTop: 2 },

    // Play button — solid white, black text
    playBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        paddingVertical: 16,
        alignItems: 'center',
    },
    playBtnText: { fontSize: 13, fontWeight: '800', color: '#000000', letterSpacing: 1.5 },

    // Playing state
    qProgressBar: {
        height: 2,
        backgroundColor: '#2A2A2A',
        borderRadius: 0,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    qProgressFill: {
        height: 2,
        backgroundColor: '#FFFFFF',
    },
    questionText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 26,
        marginBottom: spacing.md,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionBtn: {
        width: '47.5%',
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 0,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60,
    },
    optionCorrect: {
        backgroundColor: 'rgba(34,197,94,0.1)',
        borderColor: '#22C55E',
    },
    optionWrong: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderColor: '#EF4444',
    },
    optionDimmed: {
        backgroundColor: '#0A0A0A',
        borderColor: '#1A1A1A',
    },
    optionBtnText: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 18,
    },

    // Finished state
    finishedTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: 4,
    },
    finishedScore: {
        fontSize: 13,
        fontWeight: '700',
        color: '#888888',
        letterSpacing: 1.5,
        marginBottom: spacing.md,
    },
    winningsBox: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderRadius: 0,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    winningsLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#666666',
        letterSpacing: 2,
        marginBottom: 8,
    },
    winningsAmt: {
        fontSize: 56,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -2,
    },
    winningsUnit: {
        fontSize: 11,
        fontWeight: '700',
        color: '#888888',
        letterSpacing: 2,
        marginTop: 4,
    },
    claimBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        paddingVertical: 16,
        alignItems: 'center',
    },
    claimBtnText: { fontSize: 13, fontWeight: '800', color: '#000000', letterSpacing: 1.5 },

    // ── Leaderboard ───────────────────────────────────────────────────────────
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        marginTop: spacing.xs,
    },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    livePillText: { fontSize: 10, fontWeight: '700', color: '#EF4444', letterSpacing: 1 },
    leaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 0,
        paddingHorizontal: spacing.md,
        paddingVertical: 14,
        marginBottom: 2,
        gap: 12,
        overflow: 'hidden',
    },
    leaderRowUser: {
        backgroundColor: '#1A1A1A',
        borderColor: '#FFFFFF',
    },
    leaderUserAccent: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 3,
        backgroundColor: '#FFFFFF',
    },
    leaderMedal: { fontSize: 16, fontWeight: '800', color: '#666666', width: 20 },
    leaderInfo:  { flex: 1 },
    leaderHandle:     { fontSize: 13, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
    leaderHandleUser: { color: '#FFFFFF' },
    leaderPts:   { fontSize: 11, fontWeight: '500', color: '#555555' },
    leaderReward:    { alignItems: 'flex-end' },
    leaderRewardAmt: { fontSize: 12, fontWeight: '700', color: '#22C55E' },
    leaderRewardDash:{ fontSize: 16, color: '#333333' },

    // ── Footer ────────────────────────────────────────────────────────────────
    footerSection: { marginTop: spacing.md, marginBottom: spacing.xl },
    spendBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    spendBtnText: { fontSize: 13, fontWeight: '800', color: '#000000', letterSpacing: 1.5 },
    spendHint:    { fontSize: 12, color: '#555555', textAlign: 'center' },
});
