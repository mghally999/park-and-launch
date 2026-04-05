// ============================================================
// MARKETPLACE SCREEN
// ============================================================
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, marketplaceActions } from '../../store';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { marketplaceAPI } from '../../api/client';

const MarketplaceScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: RootState) => s.ui.theme);
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const { products, categories, searchQuery, selectedCategory, isLoading, cart } = useSelector((s: RootState) => s.marketplace);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, [selectedCategory]);

  const fetchData = async () => {
    dispatch(marketplaceActions.setMarketplaceLoading(true));
    try {
      const params: any = { limit: 30, sort: '-soldCount' };
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.q = search;
      const [prod, cats] = await Promise.all([marketplaceAPI.getProducts(params), categories.length ? Promise.resolve({ data: { data: categories } }) : marketplaceAPI.getCategories()]);
      dispatch(marketplaceActions.setProducts(prod.data.data));
      if (!categories.length) dispatch(marketplaceActions.setCategories(cats.data.data));
    } catch (e) {} finally { dispatch(marketplaceActions.setMarketplaceLoading(false)); }
  };

  const cartCount = cart.length;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, letterSpacing: 1 },
    cartBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: theme.colors.bgCard, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: theme.colors.border,
    },
    badge: { position: 'absolute', top: 4, right: 4, backgroundColor: theme.colors.primary, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: '#020B18', fontSize: 9, fontFamily: FONTS.body.bold },
    searchBox: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.colors.bgInput, borderRadius: RADIUS.lg,
      borderWidth: 1, borderColor: theme.colors.border,
      paddingHorizontal: SPACING.md, height: 44, marginTop: SPACING.md,
    },
    searchInput: { flex: 1, color: theme.colors.textPrimary, fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, marginLeft: 8 },
    catRow: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, gap: 8 },
    catChip: {
      paddingHorizontal: SPACING.md, paddingVertical: 6,
      borderRadius: RADIUS.full, borderWidth: 1,
    },
    catText: { fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs },
    productCard: {
      flex: 1, margin: SPACING.sm,
      backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl,
      overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border,
    },
    productImg: { height: 130, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
    productInfo: { padding: SPACING.sm },
    productName: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, color: theme.colors.textPrimary },
    productBrand: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary, marginTop: 2 },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm },
    price: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.md },
    addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    ratingText: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs },
    saleTag: { position: 'absolute', top: SPACING.sm, left: SPACING.sm, backgroundColor: theme.colors.error, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
    saleText: { fontFamily: FONTS.body.bold, color: '#fff', fontSize: TYPE_SCALE.xs },
  });

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={s.productCard} onPress={() => navigation.navigate('ProductDetail', { productId: item._id, product: item })} activeOpacity={0.85}>
      <View style={s.productImg}>
        <Ionicons name="cube-outline" size={40} color={theme.colors.textTertiary} />
      </View>
      {item.isOnSale && <View style={s.saleTag}><Text style={s.saleText}>SALE</Text></View>}
      <View style={s.productInfo}>
        <Text style={s.productBrand}>{item.brand || item.category}</Text>
        <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
        <View style={s.ratingRow}>
          <Ionicons name="star" size={10} color={theme.colors.amber} />
          <Text style={s.ratingText}>{item.rating?.toFixed(1)} ({item.reviewCount})</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.price}>{item.price} <Text style={{ fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary }}>AED</Text></Text>
          <TouchableOpacity style={s.addBtn} onPress={() => {
            dispatch(marketplaceActions.addToCart({ product: item, quantity: 1 }));
          }}>
            <Ionicons name="add" size={18} color="#020B18" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const catList = [{ _id: '', label: 'All' }, ...categories.map((c: any) => ({ _id: c._id, label: c._id?.replace(/_/g, ' ') }))];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.title}>Marine Shop</Text>
          <TouchableOpacity style={s.cartBtn} onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={22} color={theme.colors.textPrimary} />
            {cartCount > 0 && <View style={s.badge}><Text style={s.badgeText}>{cartCount}</Text></View>}
          </TouchableOpacity>
        </View>
        <View style={s.searchBox}>
          <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
          <TextInput style={s.searchInput} placeholder="Search parts, gear, equipment..." placeholderTextColor={theme.colors.textTertiary} value={search} onChangeText={setSearch} onSubmitEditing={fetchData} returnKeyType="search" />
        </View>
      </View>

      <FlatList horizontal data={catList} keyExtractor={i => i._id} showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}
        renderItem={({ item }) => {
          const active = item._id === selectedCategory;
          return (
            <TouchableOpacity style={[s.catChip, { backgroundColor: active ? theme.colors.primary : theme.colors.bgCard, borderColor: active ? theme.colors.primary : theme.colors.border }]}
              onPress={() => dispatch(marketplaceActions.setSelectedCategory(item._id))}>
              <Text style={[s.catText, { color: active ? '#020B18' : theme.colors.textSecondary, textTransform: 'capitalize' }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {isLoading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 60 }} /> : (
        <FlatList data={products} keyExtractor={(i: any) => i._id} numColumns={2} renderItem={renderProduct}
          contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }} showsVerticalScrollIndicator={false} />
      )}
    </SafeAreaView>
  );
};
export { MarketplaceScreen };
export default MarketplaceScreen;
