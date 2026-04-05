// ============================================================
// CHARTER SCREEN - Uber for fishing
// ============================================================
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, charterActions } from '../../store';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { charterAPI } from '../../api/client';

const StarRating = ({ rating, color }: { rating: number; color: string }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1,2,3,4,5].map(i => <Ionicons key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'} size={11} color={color} />)}
  </View>
);

const CharterScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const themeId = useSelector((s: RootState) => s.ui.theme);
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const { captains, packages, isLoading } = useSelector((s: RootState) => s.charter);
  const [activeTab, setActiveTab] = useState<'packages' | 'captains'>('packages');

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    dispatch(charterActions.setCharterLoading(true));
    try {
      const [pkgs, caps] = await Promise.all([charterAPI.getPackages(), charterAPI.getCaptains()]);
      dispatch(charterActions.setPackages(pkgs.data.data));
      dispatch(charterActions.setCaptains(caps.data.data));
    } catch (e) {} finally { dispatch(charterActions.setCharterLoading(false)); }
  };

  const typeIcons: Record<string, string> = {
    fishing: 'fish', sunset_cruise: 'sunny', island_hopping: 'map', leisure_cruise: 'boat', corporate: 'briefcase',
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { padding: SPACING.base, paddingTop: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, letterSpacing: 1 },
    subtitle: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 2 },
    tabs: { flexDirection: 'row', margin: SPACING.base, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.full, padding: 4, borderWidth: 1, borderColor: theme.colors.border },
    tab: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.full, alignItems: 'center' },
    tabText: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, letterSpacing: 0.5 },
    pkgCard: {
      marginHorizontal: SPACING.base, marginBottom: SPACING.md,
      backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl,
      overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border,
    },
    pkgTop: { padding: SPACING.base },
    pkgTitle: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg, color: theme.colors.textPrimary },
    pkgDesc: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 4, lineHeight: 20 },
    priceRange: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.xl, marginTop: SPACING.sm },
    priceSuffix: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs },
    includes: { flexWrap: 'wrap', flexDirection: 'row', gap: 6, marginTop: SPACING.sm },
    includeTag: {
      flexDirection: 'row', gap: 4, alignItems: 'center',
      backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.full,
      paddingHorizontal: 10, paddingVertical: 4,
    },
    bookBtn: { padding: SPACING.md, alignItems: 'center' },
    bookBtnText: { fontFamily: FONTS.body.semibold, color: '#020B18', letterSpacing: 1 },
    popularBadge: {
      position: 'absolute', top: SPACING.md, right: SPACING.md,
      backgroundColor: theme.colors.primaryGlow, borderRadius: RADIUS.full,
      paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.primary,
    },
    captainCard: {
      marginHorizontal: SPACING.base, marginBottom: SPACING.md,
      backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl,
      padding: SPACING.base, flexDirection: 'row',
      borderWidth: 1, borderColor: theme.colors.border,
    },
    avatar: {
      width: 70, height: 70, borderRadius: 35,
      backgroundColor: theme.colors.bgElevated,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: theme.colors.primary,
    },
    captainInfo: { flex: 1, marginLeft: SPACING.md },
    captainName: { fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.md, color: theme.colors.textPrimary },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
    trips: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs },
    vessel: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 4 },
    bookNowBtn: {
      marginTop: SPACING.sm, borderRadius: RADIUS.full,
      borderWidth: 1, borderColor: theme.colors.primary,
      paddingVertical: 6, paddingHorizontal: SPACING.md, alignSelf: 'flex-start',
    },
    bookNowText: { fontFamily: FONTS.body.semibold, color: theme.colors.primary, fontSize: TYPE_SCALE.xs },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Charter</Text>
        <Text style={s.subtitle}>Fishing trips, cruises & more</Text>
      </View>

      <View style={s.tabs}>
        {(['packages', 'captains'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && { backgroundColor: theme.colors.primary }]} onPress={() => setActiveTab(tab)}>
            <Text style={[s.tabText, { color: activeTab === tab ? '#020B18' : theme.colors.textSecondary }]}>
              {tab === 'packages' ? 'Trip Types' : 'Captains'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 60 }} /> : (
        <FlatList
          data={activeTab === 'packages' ? packages : captains}
          keyExtractor={(item: any) => item.id || item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            if (activeTab === 'packages') {
              return (
                <View style={s.pkgCard}>
                  <View style={s.pkgTop}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryGlow, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={(typeIcons[item.type] || 'boat') as any} size={20} color={theme.colors.primary} />
                      </View>
                      <Text style={s.pkgTitle}>{item.title}</Text>
                    </View>
                    <Text style={s.pkgDesc}>{item.description}</Text>
                    <Text style={s.priceRange}>{item.pricePerHour?.min}–{item.pricePerHour?.max} <Text style={s.priceSuffix}>AED/hr</Text></Text>
                    <View style={s.includes}>
                      {item.includes?.slice(0,3).map((inc: string, i: number) => (
                        <View key={i} style={s.includeTag}>
                          <Ionicons name="checkmark-circle" size={10} color={theme.colors.success} />
                          <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs }}>{inc}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, marginTop: SPACING.sm }}>
                      Up to {item.maxPassengers} passengers • {item.durationOptions?.join(', ')} hrs
                    </Text>
                  </View>
                  {item.popular && <View style={s.popularBadge}><Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.xs }}>POPULAR</Text></View>}
                  <LinearGradient colors={theme.gradients.gold as any} style={s.bookBtn}>
                    <TouchableOpacity onPress={() => navigation.navigate('CharterTab', { screen: 'Charter', params: { selectedType: item.type } })}>
                      <Text style={s.bookBtnText}>BOOK THIS TRIP</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              );
            }
            return (
              <View style={s.captainCard}>
                <View style={s.avatar}>
                  <Ionicons name="person" size={30} color={theme.colors.primary} />
                </View>
                <View style={s.captainInfo}>
                  <Text style={s.captainName}>{item.name}</Text>
                  <View style={s.ratingRow}>
                    <StarRating rating={item.captainProfile?.rating || 0} color={theme.colors.amber} />
                    <Text style={s.trips}>{item.captainProfile?.totalTrips || 0} trips</Text>
                  </View>
                  <Text style={s.vessel}>{item.captainProfile?.vessel?.name} • {item.captainProfile?.vessel?.capacity} pax</Text>
                  <Text style={{ fontFamily: FONTS.body.light, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, marginTop: 4 }} numberOfLines={2}>{item.captainProfile?.bio}</Text>
                  <TouchableOpacity style={s.bookNowBtn} onPress={() => navigation.navigate('BookCharter', { captainId: item._id, captain: item })}>
                    <Text style={s.bookNowText}>BOOK CAPTAIN →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};
export default CharterScreen;
