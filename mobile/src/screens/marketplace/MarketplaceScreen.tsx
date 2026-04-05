import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { marketplaceActions } from '../../store';
import { MOCK_PRODUCTS } from '../../api/mockData';

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'fishing_equipment', label: 'Fishing' },
  { id: 'life_jackets', label: 'Safety' },
  { id: 'anchoring', label: 'Anchoring' },
  { id: 'cleaning_supplies', label: 'Cleaning' },
  { id: 'bait', label: 'Bait' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'deck_hardware', label: 'Deck' },
  { id: 'electrical', label: 'Electrical' },
];

export default function MarketplaceScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const cart = useSelector((s: any) => s.marketplace?.cart || []);
  const cartCount = cart.length;
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const filtered = MOCK_PRODUCTS.filter(p =>
    (!cat || p.category === cat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: any) => {
    dispatch(marketplaceActions.addToCart({ product, quantity: 1 }));
    Toast.show({ type: 'success', text1: 'Added to Cart', text2: product.name.slice(0, 40) });
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { padding: SPACING.base, paddingTop: SPACING.md },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, letterSpacing: 1 },
    sub: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: theme.colors.textSecondary, marginTop: 2 },
    cartBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
    badge: { position: 'absolute', top: 4, right: 4, backgroundColor: theme.colors.primary, borderRadius: 8, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: '#020B18', fontSize: 9, fontFamily: FONTS.body.bold },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgInput, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: SPACING.md, height: 44, marginTop: SPACING.md },
    searchInput: { flex: 1, color: theme.colors.textPrimary, fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, marginLeft: 8 },
    catRow: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, gap: 8 },
    chip: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1 },
    featuredBanner: { margin: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden' },
    featuredInner: { padding: SPACING.base, flexDirection: 'row', alignItems: 'center' },
    featuredText: { fontFamily: FONTS.display.bold, color: '#fff', fontSize: TYPE_SCALE.md, flex: 1 },
    featuredSub: { fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.8)', fontSize: TYPE_SCALE.xs, marginTop: 2 },
    grid: { padding: SPACING.sm, paddingBottom: 100 },
    card: { flex: 1, margin: SPACING.sm, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
    imgPlaceholder: { height: 140, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
    cardBody: { padding: SPACING.md },
    brand: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    name: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, color: theme.colors.textPrimary, marginTop: 2 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    ratingText: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10 },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm },
    price: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.md },
    comparePrice: { fontFamily: FONTS.body.regular, color: theme.colors.textTertiary, fontSize: 10, textDecorationLine: 'line-through' },
    addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
    saleTag: { position: 'absolute', top: 10, left: 10, backgroundColor: theme.colors.error, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
    saleText: { fontFamily: FONTS.body.bold, color: '#fff', fontSize: 9 },
    featuredTag: { position: 'absolute', top: 10, right: 10, backgroundColor: theme.colors.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.primary },
    featuredTagText: { fontFamily: FONTS.body.bold, color: theme.colors.primary, fontSize: 9 },
  });

  const ICONS: any = { electronics: 'radio', fishing_equipment: 'fish', life_jackets: 'shield', anchoring: 'link', cleaning_supplies: 'sparkles', bait: 'ellipsis-horizontal', navigation: 'compass', deck_hardware: 'settings', electrical: 'flash' };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>Marine Shop</Text>
            <Text style={s.sub}>{MOCK_PRODUCTS.length}+ products · Free delivery over 500 AED</Text>
          </View>
          <TouchableOpacity style={s.cartBtn} onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={22} color={theme.colors.primary} />
            {cartCount > 0 && <View style={s.badge}><Text style={s.badgeText}>{cartCount}</Text></View>}
          </TouchableOpacity>
        </View>
        <View style={s.searchBox}>
          <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
          <TextInput style={s.searchInput} placeholder="Search Garmin, Shimano, safety gear..." placeholderTextColor={theme.colors.textTertiary} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} /></TouchableOpacity> : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
        {CATEGORIES.map(c => {
          const active = c.id === cat;
          return (
            <TouchableOpacity key={c.id} style={[s.chip, { backgroundColor: active ? theme.colors.primary : theme.colors.bgCard, borderColor: active ? theme.colors.primary : theme.colors.border }]} onPress={() => setCat(c.id)}>
              <Text style={{ fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs, color: active ? '#020B18' : theme.colors.textSecondary }}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!search && !cat && (
        <View style={s.featuredBanner}>
          <LinearGradient colors={['#1A7DB5', '#0D2137']} style={s.featuredInner}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.primary, fontSize: 10, letterSpacing: 1.5, marginBottom: 4 }}>EID SPECIAL OFFER</Text>
              <Text style={s.featuredText}>Up to 25% Off Premium Fishing Gear</Text>
              <Text style={s.featuredSub}>Shimano · Penn · Daiwa · Garmin</Text>
            </View>
            <Ionicons name="fish" size={44} color="rgba(201,168,76,0.4)" />
          </LinearGradient>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(i: any) => i._id}
        numColumns={2}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: p }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('ProductDetail', { product: p })} activeOpacity={0.85}>
            <View style={s.imgPlaceholder}>
              <Ionicons name={(ICONS[p.category] || 'cube-outline') as any} size={44} color={theme.colors.primary + '60'} />
              <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textTertiary, fontSize: 9, marginTop: 4 }}>{p.brand || p.category}</Text>
            </View>
            {p.compareAtPrice && <View style={s.saleTag}><Text style={s.saleText}>SALE</Text></View>}
            {(p as any).isFeatured && <View style={s.featuredTag}><Text style={s.featuredTagText}>★ TOP</Text></View>}
            <View style={s.cardBody}>
              <Text style={s.brand}>{p.brand || p.category.replace(/_/g, ' ')}</Text>
              <Text style={s.name} numberOfLines={2}>{p.name}</Text>
              <View style={s.ratingRow}>
                {[1,2,3,4,5].map(i => <Ionicons key={i} name={i <= Math.round(p.rating) ? 'star' : 'star-outline'} size={9} color={theme.colors.amber} />)}
                <Text style={s.ratingText}>({p.reviewCount})</Text>
              </View>
              <View style={s.priceRow}>
                <View>
                  <Text style={s.price}>{p.price} <Text style={{ fontSize: 10, fontFamily: FONTS.body.regular, color: theme.colors.textSecondary }}>AED</Text></Text>
                  {p.compareAtPrice && <Text style={s.comparePrice}>{p.compareAtPrice} AED</Text>}
                </View>
                <TouchableOpacity style={s.addBtn} onPress={() => addToCart(p)}>
                  <Ionicons name="add" size={18} color="#020B18" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Ionicons name="search" size={48} color={theme.colors.textTertiary} /><Text style={{ color: theme.colors.textSecondary, fontFamily: FONTS.body.regular, marginTop: 12 }}>No products found</Text></View>}
      />
    </SafeAreaView>
  );
}
