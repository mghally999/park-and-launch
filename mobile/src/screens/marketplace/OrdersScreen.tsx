import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { MOCK_ORDERS } from '../../api/mockData';

const STATUS_META: any = {
  delivered: { label: 'Delivered', color: '#10B981', icon: 'checkmark-circle' },
  shipped: { label: 'Shipped', color: '#1A7DB5', icon: 'car' },
  processing: { label: 'Processing', color: '#F59E0B', icon: 'time' },
  pending: { label: 'Pending', color: '#94A3B8', icon: 'hourglass' },
};

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, gap: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, flex: 1 },
    card: { margin: SPACING.base, marginBottom: 0, marginTop: SPACING.md, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    ref: { fontFamily: FONTS.display.regular, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.base, letterSpacing: 1 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontFamily: FONTS.body.bold, fontSize: TYPE_SCALE.xs },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
    itemName: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, flex: 1 },
    itemQty: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginHorizontal: 8 },
    itemPrice: { fontFamily: FONTS.body.semibold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.sm },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
    totalLabel: { fontFamily: FONTS.body.semibold, color: theme.colors.textSecondary },
    totalVal: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.lg },
    trackBtn: { marginTop: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: theme.colors.primary, padding: 8, alignItems: 'center' },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={s.title}>My Orders</Text>
      </View>
      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={i => i._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: order }) => {
          const meta = STATUS_META[order.status] || STATUS_META.pending;
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <View>
                  <Text style={s.ref}>#{order.orderRef}</Text>
                  <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: meta.color + '20', borderWidth: 1, borderColor: meta.color }]}>
                  <Ionicons name={meta.icon} size={12} color={meta.color} />
                  <Text style={[s.statusText, { color: meta.color }]}>{meta.label.toUpperCase()}</Text>
                </View>
              </View>
              {order.items.map((item: any, i: number) => (
                <View key={i} style={s.itemRow}>
                  <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.itemQty}>x{item.quantity}</Text>
                  <Text style={s.itemPrice}>{(item.unitPrice * item.quantity).toLocaleString()} AED</Text>
                </View>
              ))}
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total</Text>
                <Text style={s.totalVal}>{order.pricing.totalAmount.toLocaleString()} AED</Text>
              </View>
              {order.status === 'shipped' && (
                <TouchableOpacity style={s.trackBtn}>
                  <Text style={{ fontFamily: FONTS.body.semibold, color: theme.colors.primary, fontSize: TYPE_SCALE.sm }}>📦 Track Order — {(order as any).trackingNumber}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
