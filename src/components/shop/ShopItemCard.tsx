import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShopItem } from '../../services/types';
import GlassButton from '../ui/GlassButton';
import GlassCard from '../ui/GlassCard';

interface ShopItemCardProps {
    item: ShopItem;
    onBuy?: () => void;
}

export default function ShopItemCard({ item, onBuy }: ShopItemCardProps) {
    return (
        <GlassCard elevated>
            <View style={styles.header}>
                <Text style={styles.emoji}>{item.image}</Text>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category.replace('-', ' ')}</Text>
                </View>
            </View>

            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.shop}>{item.shopName}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.priceRow}>
                <View>
                    <Text style={styles.price}>{item.price} {item.currency}</Text>
                    <Text style={styles.priceNote}>≈ ${(item.price * 145).toFixed(2)} USD</Text>
                </View>
                <GlassButton
                    title="Pay with SOL"
                    icon="◎"
                    size="sm"
                    onPress={onBuy}
                />
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 40,
    },
    categoryBadge: {
        backgroundColor: 'rgba(0, 160, 178, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    categoryText: {
        color: '#00A0B2',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    name: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    shop: {
        color: '#00A0B2',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 14,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        paddingTop: 12,
    },
    price: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    priceNote: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 11,
        marginTop: 2,
    },
});
