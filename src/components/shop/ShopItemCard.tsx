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
    const isGBP = item.currency === 'GBP';
    const priceDisplay = isGBP ? `£${item.price.toFixed(2)}` : `${item.price} ${item.currency}`;
    const priceNote = isGBP ? 'Droid delivery · Pay with OASIS' : `≈ $${(item.price * 145).toFixed(2)} USD`;

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
                    <Text style={styles.price}>{priceDisplay}</Text>
                    <Text style={styles.priceNote}>{priceNote}</Text>
                </View>
                <GlassButton
                    title="Order Now"
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
        fontSize: 36,
    },
    categoryBadge: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#333333',
    },
    categoryText: {
        color: '#888888',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    name: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    shop: {
        color: '#888888',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        color: '#666666',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 14,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#2A2A2A',
        paddingTop: 12,
    },
    price: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    priceNote: {
        color: '#555555',
        fontSize: 11,
        marginTop: 2,
    },
});
