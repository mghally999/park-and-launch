import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { marketplaceActions } from '../../store';

export default function CartScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const cart = useSelector((s: any) => s.marketplace?.cart || []);
  const subtotal = cart.reduce((sum: number, i: any) => sum + (i.product.price * i.quantity), 0);
  const tax = Math.round(subtotal * 0.05);
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + tax + shipping;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, gap: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, flex: 1 },
    clearBtn: { fontFamily: FONTS.body.medium, color: theme.colors.error, fontSize: TYPE_SCALE.sm },
    item: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgCard, marginHorizontal: SPACING.base, marginBottom: SPACING.sm, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border },
    imgBox: { width: 60, height: 60, borderRadius: RADIUS.md, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    itemName: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, color: theme.colors.textPrimary, flex: 1 },
    itemPrice: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.md, color: theme.colors.primary, marginTop: 4 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
    qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
    qtyText: { fontFamily: FONTS.body.bold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.base, minWidth: 24, textAlign: 'center' },
    deleteBtn: { padding: 8 },
    summary: { margin: SPACING.base, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border },
    summaryTitle: { fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.base, color: theme.colors.textPrimary, letterSpacing: 1, marginBottom: SPACING.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm },
    summaryValue: { fontFamily: FONTS.body.semibold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.sm },
    dividerLine: { height: 1, backgroundColor: theme.colors.divider, marginVertical: SPACING.sm },
    totalLabel: { fontFamily: FONTS.display.bold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.base },
    totalValue: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.xl },
    checkoutBtn: { margin: SPACING.base, borderRadius: RADIUS.full, overflow: 'hidden', ...theme.shadows.gold },
    checkoutInner: { paddingVertical: SPACING.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    checkoutText: { fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.base, letterSpacing: 1.5 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, marginTop: SPACING.xl },
    emptySub: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, marginTop: SPACING.sm, textAlign: 'center', paddingHorizontal: SPACING['2xl'] },
    shopBtn: { marginTop: SPACING.xl, borderRadius: RADIUS.full, overflow: 'hidden' },
    freeShip: { backgroundColor: theme.colors.greenBg, borderRadius: RADIUS.md, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
    freeShipText: { fontFamily: FONTS.body.medium, color: theme.colors.green, fontSize: TYPE_SCALE.xs, flex: 1 },
  });

  if (cart.length === 0) return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={s.title}>Cart</Text>
      </View>
      <View style={s.empty}>
        <Ionicons name="cart-outline" size={80} color={theme.colors.textTertiary} />
        <Text style={s.emptyTitle}>Your cart is empty</Text>
        <Text style={s.emptySub}>Discover premium marine equipment, fishing gear, and safety equipment.</Text>
        <TouchableOpacity style={s.shopBtn} onPress={() => navigation.goBack()}>
          <LinearGradient colors={theme.gradients.gold as any} style={{ paddingVertical: 12, paddingHorizontal: 32, borderRadius: RADIUS.full }}>
            <Text style={{ fontFamily: FONTS.body.bold, color: '#020B18', letterSpacing: 1 }}>BROWSE SHOP</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={s.title}>Cart ({cart.length})</Text>
        <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [{ text: 'Cancel' }, { text: 'Clear', onPress: () => dispatch(marketplaceActions.clearCart()) }])}>
          <Text style={s.clearBtn}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(i: any) => i.product._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }: any) => (
          <View style={s.item}>
            <View style={s.imgBox}><Ionicons name="cube-outline" size={28} color={theme.colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.itemName} numberOfLines={2}>{item.product.name}</Text>
              <Text style={s.itemPrice}>{(item.product.price * item.quantity).toLocaleString()} AED</Text>
              <View style={s.qtyRow}>
                <TouchableOpacity style={s.qtyBtn} onPress={() => {
                  if (item.quantity === 1) dispatch(marketplaceActions.removeFromCart(item.product._id));
                  else dispatch(marketplaceActions.updateCartQuantity({ productId: item.product._id, quantity: item.quantity - 1 }));
                }}><Ionicons name="remove" size={14} color={theme.colors.textPrimary} /></TouchableOpacity>
                <Text style={s.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={s.qtyBtn} onPress={() => dispatch(marketplaceActions.updateCartQuantity({ productId: item.product._id, quantity: item.quantity + 1 }))}><Ionicons name="add" size={14} color={theme.colors.textPrimary} /></TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={s.deleteBtn} onPress={() => dispatch(marketplaceActions.removeFromCart(item.product._id))}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={s.summary}>
            {subtotal > 500 && <View style={s.freeShip}><Ionicons name="checkmark-circle" size={16} color={theme.colors.green} /><Text style={s.freeShipText}>🎉 You qualify for FREE shipping!</Text></View>}
            <Text style={s.summaryTitle}>ORDER SUMMARY</Text>
            <View style={s.summaryRow}><Text style={s.summaryLabel}>Subtotal ({cart.length} items)</Text><Text style={s.summaryValue}>{subtotal.toLocaleString()} AED</Text></View>
            <View style={s.summaryRow}><Text style={s.summaryLabel}>Shipping</Text><Text style={[s.summaryValue, shipping === 0 && { color: theme.colors.green }]}>{shipping === 0 ? 'FREE' : `${shipping} AED`}</Text></View>
            <View style={s.summaryRow}><Text style={s.summaryLabel}>VAT (5%)</Text><Text style={s.summaryValue}>{tax} AED</Text></View>
            <View style={s.dividerLine} />
            <View style={s.summaryRow}><Text style={s.totalLabel}>Total</Text><Text style={s.totalValue}>{total.toLocaleString()} AED</Text></View>
          </View>
        )}
      />

      <TouchableOpacity style={s.checkoutBtn} onPress={() => navigation.navigate('Checkout', { total, cart })}>
        <LinearGradient colors={theme.gradients.gold as any} style={s.checkoutInner}>
          <Ionicons name="lock-closed" size={16} color="#020B18" />
          <Text style={s.checkoutText}>SECURE CHECKOUT — {total.toLocaleString()} AED</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
