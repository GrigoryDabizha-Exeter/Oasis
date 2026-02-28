import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { chatWithGemini, type FunctionCallResult, type GeminiResponse } from '../../services/geminiService';

// ── Placeholder Cycling Prompts ────────────────────────────────────────
const PROMPTS = [
    'Order a coffee to Gate 45...',
    'How long is security?',
    'Route me to my flight...',
    'Buy me a Nando\'s meal...',
    'Unlock lounge access...',
    'Where is Gate 21?',
];

// ── Component ──────────────────────────────────────────────────────────
export default function HeroSearchConcierge() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [response, setResponse] = useState<GeminiResponse | null>(null);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const modalSlide = useRef(new Animated.Value(300)).current;
    const placeholderOpacity = useRef(new Animated.Value(1)).current;

    // ── Placeholder Cycling ────────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            Animated.timing(placeholderOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setPlaceholderIdx((prev) => (prev + 1) % PROMPTS.length);
                Animated.timing(placeholderOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // ── Pulse Animation (loading) ──────────────────────────────────────
    useEffect(() => {
        if (!isLoading) return;
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.5,
                    duration: 600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, [isLoading]);

    // ── Shimmer for loading bar ────────────────────────────────────────
    useEffect(() => {
        if (!isLoading) return;
        const anim = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: false,
            })
        );
        anim.start();
        return () => { anim.stop(); shimmerAnim.setValue(0); };
    }, [isLoading]);

    // ── Modal Slide In ─────────────────────────────────────────────────
    useEffect(() => {
        if (showModal) {
            Animated.spring(modalSlide, {
                toValue: 0,
                friction: 8,
                tension: 65,
                useNativeDriver: true,
            }).start();
        } else {
            modalSlide.setValue(300);
        }
    }, [showModal]);

    // ── Submit Handler ─────────────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        const trimmed = query.trim();
        if (!trimmed || isLoading) return;

        Keyboard.dismiss();
        setIsLoading(true);
        setShowModal(true);
        setResponse(null);

        try {
            const result = await chatWithGemini(trimmed);
            setResponse(result);
        } catch (err) {
            setResponse({
                text: 'Something went wrong. Please try again.',
                functionCalls: [],
            });
        } finally {
            setIsLoading(false);
        }
    }, [query, isLoading]);

    const handleClose = () => {
        setShowModal(false);
        setResponse(null);
    };

    // ── Shimmer interpolation ──────────────────────────────────────────
    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 400],
    });

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchBarOuter}>
                <View style={styles.searchBarInner}>
                    <Text style={styles.searchIcon}>✦</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSubmit}
                            returnKeyType="send"
                            placeholderTextColor="transparent"
                            selectionColor="#00A0B2"
                        />
                        {/* Custom animated placeholder */}
                        {!query && (
                            <Animated.View style={[styles.placeholderContainer, { opacity: placeholderOpacity }]} pointerEvents="none">
                                <Text style={styles.placeholderText}>
                                    {PROMPTS[placeholderIdx]}
                                </Text>
                            </Animated.View>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[styles.sendBtn, !!query.trim() && styles.sendBtnActive]}
                        disabled={!query.trim() || isLoading}
                    >
                        <Text style={styles.sendBtnText}>{isLoading ? '⏳' : '→'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading shimmer bar */}
                {isLoading && (
                    <View style={styles.shimmerTrack}>
                        <Animated.View
                            style={[
                                styles.shimmerBar,
                                { transform: [{ translateX: shimmerTranslate }] },
                            ]}
                        />
                    </View>
                )}
            </View>

            {/* Response Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="none"
                onRequestClose={handleClose}
            >
                <Pressable style={styles.modalOverlay} onPress={handleClose}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            { transform: [{ translateY: modalSlide }] },
                        ]}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            {/* Modal Handle */}
                            <View style={styles.modalHandle} />

                            {/* Loading State */}
                            {isLoading && (
                                <View style={styles.loadingContainer}>
                                    <Animated.View style={{ opacity: pulseAnim }}>
                                        <Text style={styles.loadingIcon}>✦</Text>
                                    </Animated.View>
                                    <Text style={styles.loadingText}>Oasis is thinking...</Text>
                                    <Text style={styles.loadingSubtext}>Processing your request via Gemini</Text>
                                </View>
                            )}

                            {/* Response Content */}
                            {response && !isLoading && (
                                <ScrollView
                                    style={styles.responseScroll}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {/* Function Call Cards */}
                                    {response.functionCalls.map((fc, idx) => (
                                        <FunctionCallCard key={idx} call={fc} />
                                    ))}

                                    {/* AI Text Response */}
                                    {response.text ? (
                                        <View style={styles.textResponse}>
                                            <View style={styles.textResponseHeader}>
                                                <Text style={styles.aiAvatar}>✦</Text>
                                                <Text style={styles.aiName}>Oasis</Text>
                                            </View>
                                            <Text style={styles.responseText}>{response.text}</Text>
                                        </View>
                                    ) : null}

                                    {/* Close Button */}
                                    <TouchableOpacity style={styles.closeModalBtn} onPress={handleClose}>
                                        <Text style={styles.closeModalText}>Done</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            )}
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
}

// ── Function Call Card Sub-Component ───────────────────────────────────
function FunctionCallCard({ call }: { call: FunctionCallResult }) {
    const getIcon = () => {
        switch (call.functionName) {
            case 'find_and_route_to_gate': return '🧭';
            case 'order_gate_delivery': return '🛒';
            case 'analyze_terminal_congestion': return '📊';
            case 'burn_loyalty_for_perk': return '🔥';
            default: return '⚙️';
        }
    };

    const getLabel = () => {
        switch (call.functionName) {
            case 'find_and_route_to_gate': return 'Gate Navigation';
            case 'order_gate_delivery': return 'Gate Delivery';
            case 'analyze_terminal_congestion': return 'Queue Analysis';
            case 'burn_loyalty_for_perk': return 'Loyalty Redemption';
            default: return 'Action';
        }
    };

    return (
        <View style={[styles.fcCard, call.result.success ? styles.fcCardSuccess : styles.fcCardError]}>
            <View style={styles.fcHeader}>
                <Text style={styles.fcIcon}>{getIcon()}</Text>
                <View style={styles.fcHeaderText}>
                    <Text style={styles.fcLabel}>{getLabel()}</Text>
                    <Text style={styles.fcStatus}>
                        {call.result.success ? '✓ Executed' : '✕ Failed'}
                    </Text>
                </View>
            </View>
            <Text style={styles.fcMessage}>{call.result.message}</Text>

            {/* Data pills */}
            {call.result.data && (
                <View style={styles.dataPills}>
                    {Object.entries(call.result.data)
                        .filter(([k, v]) => typeof v === 'string' || typeof v === 'number')
                        .slice(0, 4)
                        .map(([key, value]) => (
                            <View key={key} style={styles.dataPill}>
                                <Text style={styles.dataPillKey}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                                <Text style={styles.dataPillValue}>{String(value)}</Text>
                            </View>
                        ))}
                </View>
            )}
        </View>
    );
}

// ── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },

    // Search Bar
    searchBarOuter: {
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(0, 160, 178, 0.2)',
    },
    searchBarInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        gap: 10,
    },
    searchIcon: {
        fontSize: 18,
        color: '#00A0B2',
    },
    inputWrapper: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
    },
    input: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
        padding: 0,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
    },
    placeholderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    placeholderText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 15,
        fontWeight: '500',
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnActive: {
        backgroundColor: '#00A0B2',
    },
    sendBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },

    // Shimmer
    shimmerTrack: {
        height: 2,
        backgroundColor: 'rgba(0, 160, 178, 0.1)',
        overflow: 'hidden',
    },
    shimmerBar: {
        width: 200,
        height: 2,
        backgroundColor: '#00A0B2',
        borderRadius: 1,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'rgba(22, 22, 26, 0.98)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 12,
        maxHeight: '75%',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(0, 160, 178, 0.15)',
    },
    modalHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignSelf: 'center',
        marginBottom: 20,
    },

    // Loading
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingIcon: {
        fontSize: 36,
        color: '#00A0B2',
        marginBottom: 12,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingSubtext: {
        color: 'rgba(255, 255, 255, 0.35)',
        fontSize: 12,
        marginTop: 4,
    },

    // Response
    responseScroll: {
        maxHeight: 500,
    },
    textResponse: {
        marginTop: 4,
        marginBottom: 16,
    },
    textResponseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    aiAvatar: {
        fontSize: 16,
        color: '#00A0B2',
    },
    aiName: {
        color: '#00A0B2',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    responseText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400',
    },

    // Function Call Card
    fcCard: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    fcCardSuccess: {
        backgroundColor: 'rgba(0, 160, 178, 0.08)',
        borderColor: 'rgba(0, 160, 178, 0.2)',
    },
    fcCardError: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    fcHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    fcIcon: {
        fontSize: 22,
    },
    fcHeaderText: {
        flex: 1,
    },
    fcLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    fcStatus: {
        color: 'rgba(255, 255, 255, 0.45)',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    fcMessage: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 13,
        lineHeight: 19,
    },
    dataPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 12,
    },
    dataPill: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    dataPillKey: {
        color: 'rgba(255, 255, 255, 0.35)',
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    dataPillValue: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 1,
    },

    // Close
    closeModalBtn: {
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    closeModalText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '600',
    },
});
