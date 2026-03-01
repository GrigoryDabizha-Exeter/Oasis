import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    type ChatMessage,
    chatWithGemini,
    type FunctionCallResult,
    type GeminiResponse,
} from '../../services/geminiService';

// ── Placeholder Cycling Prompts ────────────────────────────────────────
const PROMPTS = [
    'Order a coffee to Gate 45...',
    'How long is security?',
    'Route me to my flight...',
    'Buy me a Nando\'s meal...',
    'Unlock lounge access...',
    'Where is Gate 21?',
];

// ── Message type shown in the UI ───────────────────────────────────────
interface UIMessage {
    role: 'user' | 'assistant';
    content: string;
    functionCalls?: FunctionCallResult[];
}

// ── Component ──────────────────────────────────────────────────────────
export default function HeroSearchConcierge() {
    const [query, setQuery] = useState('');
    const [followUp, setFollowUp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);

    const scrollRef = useRef<ScrollView>(null);

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

    // ── Auto-scroll to bottom when messages update ─────────────────────
    useEffect(() => {
        if (showModal && messages.length > 0) {
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages, showModal]);

    // ── Core send logic (shared by initial + follow-up) ────────────────
    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        Keyboard.dismiss();

        // Build history from all current messages (for Gemini multi-turn context)
        const history: ChatMessage[] = messages.map((m) => ({
            role: m.role,
            content: m.content,
        }));

        // Append user message immediately
        const userMsg: UIMessage = { role: 'user', content: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const result: GeminiResponse = await chatWithGemini(trimmed, history);
            const assistantMsg: UIMessage = {
                role: 'assistant',
                content: result.text,
                functionCalls: result.functionCalls,
            };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Something went wrong. Please try again.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, isLoading]);

    // ── Initial Submit (from search bar) ──────────────────────────────
    const handleSubmit = useCallback(async () => {
        const trimmed = query.trim();
        if (!trimmed || isLoading) return;
        setQuery('');
        setShowModal(true);
        await sendMessage(trimmed);
    }, [query, isLoading, sendMessage]);

    // ── Follow-up Submit (from in-modal input) ─────────────────────────
    const handleFollowUp = useCallback(async () => {
        const trimmed = followUp.trim();
        if (!trimmed || isLoading) return;
        setFollowUp('');
        await sendMessage(trimmed);
    }, [followUp, isLoading, sendMessage]);

    const handleClose = () => {
        setShowModal(false);
        setMessages([]);
        setFollowUp('');
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
                            selectionColor="#FFFFFF"
                        />
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
                        <Text style={[styles.sendBtnText, !!query.trim() && styles.sendBtnTextActive]}>
                            {isLoading ? '⏳' : '→'}
                        </Text>
                    </TouchableOpacity>
                </View>

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

            {/* Chat Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="none"
                onRequestClose={handleClose}
            >
                <Pressable style={styles.modalOverlay} onPress={handleClose}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalKAV}
                    >
                        <Animated.View
                            style={[
                                styles.modalContent,
                                { transform: [{ translateY: modalSlide }] },
                            ]}
                        >
                            <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
                                {/* Handle + header */}
                                <View style={styles.modalHandle} />
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>✦ OASIS</Text>
                                    <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                                        <Text style={styles.closeBtnText}>Done</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Message History */}
                                <ScrollView
                                    ref={scrollRef}
                                    style={styles.messageList}
                                    contentContainerStyle={styles.messageListContent}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {messages.map((msg, idx) => (
                                        <View key={idx}>
                                            {msg.role === 'user' ? (
                                                <View style={styles.userBubbleRow}>
                                                    <View style={styles.userBubble}>
                                                        <Text style={styles.userBubbleText}>{msg.content}</Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View style={styles.assistantBlock}>
                                                    {/* Function call cards */}
                                                    {(msg.functionCalls ?? []).map((fc, fcIdx) => (
                                                        <FunctionCallCard key={fcIdx} call={fc} />
                                                    ))}
                                                    {/* Text response */}
                                                    {msg.content ? (
                                                        <View style={styles.assistantBubble}>
                                                            <Text style={styles.assistantLabel}>✦ Oasis</Text>
                                                            <Text style={styles.assistantText}>{msg.content}</Text>
                                                        </View>
                                                    ) : null}
                                                </View>
                                            )}
                                        </View>
                                    ))}

                                    {/* Typing indicator */}
                                    {isLoading && (
                                        <View style={styles.assistantBlock}>
                                            <View style={styles.assistantBubble}>
                                                <Animated.Text style={[styles.assistantLabel, { opacity: pulseAnim }]}>
                                                    ✦ Oasis is thinking...
                                                </Animated.Text>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>

                                {/* Follow-up Input */}
                                <View style={styles.followUpBar}>
                                    <TextInput
                                        style={styles.followUpInput}
                                        value={followUp}
                                        onChangeText={setFollowUp}
                                        onSubmitEditing={handleFollowUp}
                                        returnKeyType="send"
                                        placeholder="Ask a follow-up..."
                                        placeholderTextColor="#444444"
                                        selectionColor="#FFFFFF"
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        onPress={handleFollowUp}
                                        style={[styles.followUpSend, !!followUp.trim() && !isLoading && styles.followUpSendActive]}
                                        disabled={!followUp.trim() || isLoading}
                                    >
                                        <Text style={[styles.followUpSendText, !!followUp.trim() && !isLoading && styles.followUpSendTextActive]}>→</Text>
                                    </TouchableOpacity>
                                </View>
                            </Pressable>
                        </Animated.View>
                    </KeyboardAvoidingView>
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

            {call.result.data && (
                <View style={styles.dataPills}>
                    {Object.entries(call.result.data)
                        .filter(([, v]) => typeof v === 'string' || typeof v === 'number')
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
        overflow: 'hidden',
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#2A2A2A',
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
        color: '#FFFFFF',
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
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#444444',
        fontSize: 15,
        fontWeight: '500',
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    sendBtnText: {
        color: '#444444',
        fontSize: 18,
        fontWeight: '700',
    },
    sendBtnTextActive: {
        color: '#000000',
    },

    // Shimmer
    shimmerTrack: {
        height: 2,
        backgroundColor: '#1A1A1A',
        overflow: 'hidden',
    },
    shimmerBar: {
        width: 200,
        height: 2,
        backgroundColor: '#FFFFFF',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalKAV: {
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111111',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#2A2A2A',
        paddingBottom: Platform.OS === 'ios' ? 0 : 0,
        maxHeight: '80%',
        minHeight: 300,
    },
    modalHandle: {
        width: 36,
        height: 3,
        backgroundColor: '#333333',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
    },
    closeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    closeBtnText: {
        color: '#888888',
        fontSize: 12,
        fontWeight: '600',
    },

    // Message List
    messageList: {
        flex: 1,
    },
    messageListContent: {
        padding: 16,
        gap: 12,
        flexGrow: 1,
    },

    // User bubble
    userBubbleRow: {
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    userBubble: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: '80%',
    },
    userBubbleText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },

    // Assistant block
    assistantBlock: {
        marginBottom: 4,
    },
    assistantBubble: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#2A2A2A',
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: '90%',
    },
    assistantLabel: {
        color: '#666666',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    assistantText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '400',
    },

    // Function Call Card
    fcCard: {
        borderWidth: 1,
        padding: 12,
        marginBottom: 8,
    },
    fcCardSuccess: {
        backgroundColor: '#0D1A1A',
        borderColor: '#1A3A3A',
    },
    fcCardError: {
        backgroundColor: '#1A0D0D',
        borderColor: '#3A1A1A',
    },
    fcHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    fcIcon: { fontSize: 20 },
    fcHeaderText: { flex: 1 },
    fcLabel: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    fcStatus: {
        color: '#666666',
        fontSize: 10,
        fontWeight: '500',
        marginTop: 1,
    },
    fcMessage: {
        color: '#AAAAAA',
        fontSize: 12,
        lineHeight: 18,
    },
    dataPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 10,
    },
    dataPill: {
        backgroundColor: '#2A2A2A',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    dataPillKey: {
        color: '#666666',
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    dataPillValue: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 1,
    },

    // Follow-up input
    followUpBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#2A2A2A',
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        gap: 10,
        backgroundColor: '#111111',
    },
    followUpInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '400',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#2A2A2A',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
    },
    followUpSend: {
        width: 36,
        height: 36,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    followUpSendActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    followUpSendText: {
        color: '#444444',
        fontSize: 18,
        fontWeight: '700',
    },
    followUpSendTextActive: {
        color: '#000000',
    },
});
