import { LinearGradient } from 'expo-linear-gradient';
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
import { borderRadius, colors, spacing } from '../theme/tokens';

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

// ─── Static leaderboard entries (positions 1, 2, 4) ──────────────────────────
const STATIC_BOARD = [
    { rank: 1, medal: '🥇', handle: '@CryptoFlyer',  pts: 4200, oasis: 500,  color: '#F59E0B' },
    { rank: 2, medal: '🥈', handle: '@GatwickGhost', pts: 3850, oasis: 250,  color: 'rgba(200,200,200,0.8)' },
    { rank: 4, medal: '4',  handle: '@AeroNomad',    pts: 2900, oasis: null, color: '#EF4444' },
];

// ─── LeaderRow ────────────────────────────────────────────────────────────────
interface LeaderRowProps {
    medal: string;
    handle: string;
    pts: number;
    oasis: number | null;
    color: string;
    isUser?: boolean;
}

function LeaderRow({ medal, handle, pts, oasis, color, isUser = false }: LeaderRowProps) {
    const letter = handle.startsWith('@') ? handle.charAt(1).toUpperCase() : handle.charAt(0).toUpperCase();
    return (
        <View style={[styles.leaderRow, isUser && styles.leaderRowUser]}>
            {isUser && <View style={styles.leaderUserAccent} />}
            <Text style={styles.leaderMedal}>{medal}</Text>
            <View style={[styles.leaderAvatar, { backgroundColor: `${color}20`, borderColor: `${color}50` }]}>
                <Text style={[styles.leaderAvatarText, { color }]}>{letter}</Text>
            </View>
            <View style={styles.leaderInfo}>
                <Text style={[styles.leaderHandle, isUser && styles.leaderHandleUser]}>
                    {handle}{isUser ? '  (You)' : ''}
                </Text>
                <Text style={styles.leaderPts}>{pts.toLocaleString()} pts</Text>
            </View>
            <View style={styles.leaderReward}>
                {oasis !== null ? (
                    <>
                        <Text style={styles.leaderRewardAmt}>+{oasis}</Text>
                        <Text style={styles.leaderRewardLbl}>OASIS</Text>
                    </>
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

    // Game state
    const [gameState, setGameState]         = useState<GameState>('idle');
    const [currentQ, setCurrentQ]           = useState(0);
    const [score, setScore]                 = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [userBalance, setUserBalance]     = useState(1500);

    // Stay in sync if the wallet changes from another screen
    useEffect(() => { setLocalTokens(loyaltyTokens); }, [loyaltyTokens]);

    // Resolve flight data
    const myFlight = departures.find(
        (f) => f.flight.iataNumber.replace(/\s/g, '').toUpperCase() ===
               (flightNumber ?? '').replace(/\s/g, '').toUpperCase()
    );
    const gate          = myFlight?.departure.gate ?? '40';
    const terminal      = myFlight?.departure.terminal ?? 'S';
    const boardingTxt   = myFlight ? timeToBoarding(myFlight.departure.scheduledTime) : '45 mins to boarding';
    const displayFlight = flightNumber ?? 'U28499';
    const userName      = user?.name ?? 'Oasis Guest';

    // Token balance gentle pulse
    const tokenScale = useSharedValue(1);
    useEffect(() => {
        tokenScale.value = withRepeat(
            withSequence(
                withTiming(1.07, { duration: 1400 }),
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
        if (selectedAnswer !== null) return; // block double-tap
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

    // ── Option button style helpers ───────────────────────────────────────────
    const getOptionStyle = (option: string) => {
        if (selectedAnswer === null) return styles.optionBtn;
        if (option === TRIVIA_QUESTIONS[currentQ].answer) return [styles.optionBtn, styles.optionCorrect];
        if (option === selectedAnswer) return [styles.optionBtn, styles.optionWrong];
        return [styles.optionBtn, styles.optionDimmed];
    };

    const getOptionTextColor = (option: string): string => {
        if (selectedAnswer === null) return 'rgba(255,255,255,0.85)';
        if (option === TRIVIA_QUESTIONS[currentQ].answer) return '#22C55E';
        if (option === selectedAnswer) return '#EF4444';
        return 'rgba(255,255,255,0.25)';
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ══ HERO ════════════════════════════════════════════════════ */}
                <Animated.View entering={FadeInDown.duration(450)} style={styles.heroCard}>
                    {/* Decorative top glow */}
                    <LinearGradient
                        colors={['rgba(0,160,178,0.18)', 'transparent']}
                        style={styles.heroGlow}
                        pointerEvents="none"
                    />

                    <View style={styles.heroTop}>
                        <View style={styles.heroLeft}>
                            <Text style={styles.heroLabel}>GATE {gate} · EXCLUSIVE LOUNGE</Text>
                            <Text style={styles.heroTitle}>Flight Lobby</Text>
                            <Text style={styles.heroSubtitle}>
                                {displayFlight} · {boardingTxt}
                            </Text>
                        </View>

                        {/* Pulsing token badge — shows live userBalance */}
                        <Animated.View style={[styles.tokenBadge, tokenPulseStyle]}>
                            <Text style={styles.tokenGem}>💎</Text>
                            <Text style={styles.tokenAmt}>{userBalance.toLocaleString()}</Text>
                            <Text style={styles.tokenLbl}>OASIS</Text>
                        </Animated.View>
                    </View>

                    {/* Flight meta pills */}
                    <View style={styles.pillRow}>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>✈ {displayFlight}</Text>
                        </View>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>🏛 Terminal {terminal}</Text>
                        </View>
                        <View style={[styles.pill, styles.pillCyan]}>
                            <Text style={[styles.pillText, { color: '#4DD0E1' }]}>Gate {gate}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ══ TRIVIA GAME CARD (neon gradient border) ═════════════════ */}
                <Animated.View entering={FadeInDown.duration(450).delay(130)}>
                    <LinearGradient
                        colors={['#00A0B2', '#9945FF', '#00A0B2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.triviaGradientBorder}
                    >
                        <View style={styles.triviaCard}>

                            {/* Top badges row */}
                            <View style={styles.triviaTopRow}>
                                <View style={styles.liveGameBadge}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveGameText}>LIVE GAME</Text>
                                </View>
                                {gameState === 'idle' && (
                                    <View style={styles.stakeBadge}>
                                        <Text style={styles.stakeBadgeText}>Stake 10 OASIS</Text>
                                    </View>
                                )}
                                {gameState === 'playing' && (
                                    <View style={styles.progressBadge}>
                                        <Text style={styles.progressBadgeText}>
                                            Q {currentQ + 1} / {TRIVIA_QUESTIONS.length}
                                        </Text>
                                    </View>
                                )}
                                {gameState === 'finished' && (
                                    <View style={styles.finishedBadge}>
                                        <Text style={styles.finishedBadgeText}>COMPLETE ✓</Text>
                                    </View>
                                )}
                            </View>

                            {/* ── IDLE ────────────────────────────────────── */}
                            {gameState === 'idle' && (
                                <>
                                    <Text style={styles.triviaTitle}>Terminal Trivia</Text>
                                    <Text style={styles.triviaEdition}>Aviation Edition</Text>
                                    <Text style={styles.triviaDesc}>
                                        Answer fast. Beat your flight. Earn crypto.
                                    </Text>

                                    <View style={styles.triviaStatsRow}>
                                        {[
                                            { label: 'Players',    value: '47'  },
                                            { label: 'Prize Pool', value: '2.4K' },
                                            { label: 'Round',      value: '3/5'  },
                                        ].map((s) => (
                                            <View key={s.label} style={styles.triviaStat}>
                                                <Text style={styles.triviaStatVal}>{s.value}</Text>
                                                <Text style={styles.triviaStatLbl}>{s.label}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <TouchableOpacity onPress={handleStartGame} activeOpacity={0.85}>
                                        <LinearGradient
                                            colors={['#00A0B2', '#9945FF']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.playBtn}
                                        >
                                            <Text style={styles.playBtnText}>🎮  Play & Stake 10 OASIS</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            )}

                            {/* ── PLAYING ─────────────────────────────────── */}
                            {gameState === 'playing' && (
                                <>
                                    {/* Progress bar */}
                                    <View style={styles.qProgressBar}>
                                        <View
                                            style={[
                                                styles.qProgressFill,
                                                { width: `${((currentQ) / TRIVIA_QUESTIONS.length) * 100}%` },
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
                                    <Text style={styles.finishedEmoji}>
                                        {score === TRIVIA_QUESTIONS.length ? '🏆' : score > 0 ? '🎯' : '😅'}
                                    </Text>
                                    <Text style={styles.finishedTitle}>Trivia Complete!</Text>
                                    <Text style={styles.finishedScore}>
                                        You got {score}/{TRIVIA_QUESTIONS.length} correct
                                    </Text>

                                    <LinearGradient
                                        colors={['rgba(0,160,178,0.18)', 'rgba(153,69,255,0.18)']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.winningsBox}
                                    >
                                        <Text style={styles.winningsLabel}>YOUR REWARD</Text>
                                        <Text style={styles.winningsAmt}>+{score * 50} OASIS</Text>
                                        <Text style={styles.winningsNote}>
                                            New balance: {(userBalance + score * 50).toLocaleString()}
                                        </Text>
                                    </LinearGradient>

                                    <TouchableOpacity
                                        style={styles.claimBtn}
                                        onPress={handleClaim}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.claimBtnText}>
                                            Claim {score * 50} OASIS  →
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}

                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* ══ LEADERBOARD ══════════════════════════════════════════════ */}
                <Animated.View entering={FadeInDown.duration(450).delay(260)}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Live Flight Leaderboard</Text>
                        <View style={styles.livePill}>
                            <View style={[styles.liveDot, { backgroundColor: '#EF4444' }]} />
                            <Text style={styles.livePillText}>LIVE</Text>
                        </View>
                    </View>

                    {STATIC_BOARD.slice(0, 2).map((e) => (
                        <LeaderRow key={e.handle} {...e} />
                    ))}

                    {/* Rank 3 — user row, always highlighted */}
                    <LeaderRow
                        medal="🥉"
                        handle={userName}
                        pts={localTokens > 500 ? localTokens : 3100}
                        oasis={null}
                        color={colors.bondi.DEFAULT}
                        isUser
                    />

                    <LeaderRow {...STATIC_BOARD[2]} />
                </Animated.View>

                {/* ══ SPEND REWARDS ════════════════════════════════════════════ */}
                <Animated.View entering={FadeInDown.duration(450).delay(390)} style={styles.footerSection}>
                    <TouchableOpacity
                        style={styles.spendBtn}
                        onPress={() => router.navigate('/(tabs)/shop')}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.spendBtnText}>🛍️  Spend Rewards in Shop</Text>
                    </TouchableOpacity>
                    <Text style={styles.spendHint}>
                        Redeem OASIS tokens for duty-free, food & lounge upgrades
                    </Text>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const GLASS_BG     = 'rgba(255, 255, 255, 0.06)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.10)';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111111' },
    scroll:    { padding: spacing.md, paddingBottom: 100 },

    // ── Hero ──────────────────────────────────────────────────────────────────
    heroCard: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(0,160,178,0.22)',
        borderRadius: 24,
        padding: spacing.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 24,
        elevation: 8,
    },
    heroGlow: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 80,
        borderRadius: 24,
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
        color: colors.bondi.DEFAULT,
        letterSpacing: 1.5,
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
        color: 'rgba(255,255,255,0.5)',
    },
    tokenBadge: {
        backgroundColor: 'rgba(0,160,178,0.12)',
        borderWidth: 1.5,
        borderColor: 'rgba(77,208,225,0.35)',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: 'center',
        shadowColor: '#4DD0E1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    tokenGem: { fontSize: 20, marginBottom: 4 },
    tokenAmt: { fontSize: 22, fontWeight: '800', color: '#4DD0E1', letterSpacing: -0.5 },
    tokenLbl: { fontSize: 9, fontWeight: '700', color: colors.bondi.DEFAULT, letterSpacing: 1.5, marginTop: 2 },
    pillRow: { flexDirection: 'row', gap: 6 },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        backgroundColor: GLASS_BG,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
    },
    pillCyan: {
        backgroundColor: 'rgba(77,208,225,0.08)',
        borderColor: 'rgba(77,208,225,0.25)',
    },
    pillText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },

    // ── Trivia Card ───────────────────────────────────────────────────────────
    triviaGradientBorder: {
        borderRadius: 24,
        padding: 1.5,
        marginBottom: spacing.md,
    },
    triviaCard: {
        backgroundColor: '#141414',
        borderRadius: 22.5,
        padding: spacing.lg,
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
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(153,69,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(153,69,255,0.3)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#9945FF',
    },
    liveGameText: { fontSize: 10, fontWeight: '700', color: '#9945FF', letterSpacing: 1 },
    stakeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(0,160,178,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0,160,178,0.25)',
    },
    stakeBadgeText: { fontSize: 11, fontWeight: '600', color: colors.bondi.DEFAULT },
    progressBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(153,69,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(153,69,255,0.25)',
    },
    progressBadgeText: { fontSize: 11, fontWeight: '700', color: '#9945FF', letterSpacing: 0.5 },
    finishedBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(34,197,94,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34,197,94,0.25)',
    },
    finishedBadgeText: { fontSize: 11, fontWeight: '700', color: '#22C55E', letterSpacing: 0.5 },

    // Idle state
    triviaTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.8,
        marginBottom: 2,
    },
    triviaEdition: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.bondi.DEFAULT,
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    triviaDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
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
        backgroundColor: GLASS_BG,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    triviaStatVal: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
    triviaStatLbl: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5, marginTop: 2 },
    playBtn: {
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#00A0B2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    playBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },

    // Playing state
    qProgressBar: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 2,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    qProgressFill: {
        height: 3,
        backgroundColor: '#9945FF',
        borderRadius: 2,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 26,
        marginBottom: spacing.md,
        letterSpacing: -0.2,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionBtn: {
        width: '47.5%',
        backgroundColor: GLASS_BG,
        borderWidth: 1.5,
        borderColor: 'rgba(153,69,255,0.25)',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60,
    },
    optionCorrect: {
        backgroundColor: 'rgba(34,197,94,0.12)',
        borderColor: 'rgba(34,197,94,0.5)',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    optionWrong: {
        backgroundColor: 'rgba(239,68,68,0.12)',
        borderColor: 'rgba(239,68,68,0.5)',
    },
    optionDimmed: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.06)',
    },
    optionBtnText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 18,
    },

    // Finished state
    finishedEmoji: { fontSize: 52, textAlign: 'center', marginBottom: 8 },
    finishedTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    finishedScore: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    winningsBox: {
        width: '100%',
        borderRadius: 18,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(0,160,178,0.2)',
    },
    winningsLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 2,
        marginBottom: 8,
    },
    winningsAmt: {
        fontSize: 48,
        fontWeight: '800',
        color: '#4DD0E1',
        letterSpacing: -1,
    },
    winningsNote: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 6,
    },
    claimBtn: {
        width: '100%',
        backgroundColor: colors.bondi.DEFAULT,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: colors.bondi.DEFAULT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    claimBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

    // ── Leaderboard ───────────────────────────────────────────────────────────
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        marginTop: spacing.xs,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(239,68,68,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.28)',
    },
    livePillText: { fontSize: 9, fontWeight: '700', color: '#EF4444', letterSpacing: 1 },
    leaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: GLASS_BG,
        borderWidth: 1,
        borderColor: GLASS_BORDER,
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        marginBottom: 8,
        gap: 12,
        overflow: 'hidden',
    },
    leaderRowUser: {
        backgroundColor: 'rgba(0,160,178,0.07)',
        borderColor: 'rgba(0,160,178,0.28)',
        shadowColor: '#00A0B2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    leaderUserAccent: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 3,
        backgroundColor: colors.bondi.DEFAULT,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    leaderMedal: { fontSize: 18, width: 24, textAlign: 'center' },
    leaderAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leaderAvatarText: { fontSize: 14, fontWeight: '800' },
    leaderInfo:  { flex: 1 },
    leaderHandle:     { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
    leaderHandleUser: { color: colors.bondi.DEFAULT },
    leaderPts:   { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.4)' },
    leaderReward:    { alignItems: 'flex-end' },
    leaderRewardAmt: { fontSize: 14, fontWeight: '700', color: '#22C55E' },
    leaderRewardLbl: { fontSize: 10, fontWeight: '600', color: 'rgba(34,197,94,0.7)', letterSpacing: 0.5 },
    leaderRewardDash:{ fontSize: 18, color: 'rgba(255,255,255,0.2)' },

    // ── Footer ────────────────────────────────────────────────────────────────
    footerSection: { marginTop: spacing.md, marginBottom: spacing.xl },
    spendBtn: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    spendBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    spendHint:    { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' },
});
