import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { MOCK_CAPTAINS, MOCK_CHARTER_PACKAGES } from '../../api/mockData';

export default function CharterScreen() {
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const [tab, setTab] = useState<'packages' | 'captains'>('packages');

  const ICONS: any = { fishing: 'fish', sunset_cruise: 'sunny', island_hopping: 'map', corporate: 'briefcase', fishing_tournament: 'trophy' };
  const COLORS: any = { fishing: '#1A7DB5', sunset_cruise: '#C9A84C', island_hopping: '#10B981', corporate: '#8B5CF6', fishing_tournament: '#EF4444' };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { padding: SPACING.base, paddingTop: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, letterSpacing: 1 },
    sub: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 2 },
    tabs: { flexDirection: 'row', margin: SPACING.base, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.full, padding: 4, borderWidth: 1, borderColor: theme.colors.border },
    tab: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.full, alignItems: 'center' },
    pkgCard: { marginHorizontal: SPACING.base, marginBottom: SPACING.md, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
    pkgHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, gap: SPACING.md },
    pkgIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    pkgTitle: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg, color: theme.colors.textPrimary, flex: 1 },
    pkgDesc: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm, lineHeight: 20 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm, gap: 4 },
    price: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.xl },
    priceSuffix: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs },
    includes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: SPACING.base, paddingBottom: SPACING.md },
    incTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 4 },
    incText: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10 },
    bookBtn: { padding: SPACING.md, alignItems: 'center' },
    bookBtnText: { fontFamily: FONTS.body.bold, color: '#020B18', letterSpacing: 1 },
    popularBadge: { backgroundColor: theme.colors.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.primary },
    capCard: { marginHorizontal: SPACING.base, marginBottom: SPACING.md, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border },
    capRow: { flexDirection: 'row', alignItems: 'flex-start' },
    capAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.primary },
    capInfo: { flex: 1, marginLeft: SPACING.md },
    capName: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.md, color: theme.colors.textPrimary },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    trips: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs },
    vessel: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 4 },
    bio: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, marginTop: SPACING.sm, lineHeight: 16 },
    priceTag: { backgroundColor: theme.colors.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.primary, alignSelf: 'flex-start', marginTop: 6 },
    priceTagText: { fontFamily: FONTS.body.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.xs },
    bookNow: { marginTop: SPACING.md, borderRadius: RADIUS.full, overflow: 'hidden' },
    unavailableBadge: { backgroundColor: theme.colors.redBg, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.red },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Charter</Text>
        <Text style={s.sub}>Licensed UAE captains · Instant booking</Text>
      </View>

      <View style={s.tabs}>
        {(['packages', 'captains'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && { backgroundColor: theme.colors.primary }]} onPress={() => setTab(t)}>
            <Text style={{ fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, color: tab === t ? '#020B18' : theme.colors.textSecondary }}>
              {t === 'packages' ? '🎣 Trip Types' : '👨‍✈️ Captains'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tab === 'packages' ? MOCK_CHARTER_PACKAGES : MOCK_CAPTAINS}
        keyExtractor={(i: any, index: number) => (i.id || i._id || String(index))}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }: any) => {
          if (tab === 'packages') {
            const color = COLORS[item.type] || theme.colors.primary;
            return (
              <View style={s.pkgCard}>
                <View style={s.pkgHeader}>
                  <View style={[s.pkgIcon, { backgroundColor: color + '20' }]}><Ionicons name={ICONS[item.type] || 'boat'} size={26} color={color} /></View>
                  <Text style={s.pkgTitle}>{item.title}</Text>
                  {item.popular && <View style={s.popularBadge}><Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.primary, fontSize: 9 }}>HOT</Text></View>}
                </View>
                <Text style={s.pkgDesc}>{item.description}</Text>
                <View style={s.priceRow}>
                  <Text style={s.price}>{item.pricePerHour.min}</Text>
                  <Text style={s.priceSuffix}> AED/hr · up to {item.maxPassengers} guests</Text>
                </View>
                <View style={s.includes}>
                  {item.includes.slice(0,4).map((inc: string, i: number) => (
                    <View key={i} style={s.incTag}><Ionicons name="checkmark-circle" size={10} color={color} /><Text style={s.incText}>{inc}</Text></View>
                  ))}
                  {item.includes.length > 4 && <View style={s.incTag}><Text style={s.incText}>+{item.includes.length - 4} more</Text></View>}
                </View>
                <LinearGradient colors={[color, color + 'BB']} style={s.bookBtn}>
                  <TouchableOpacity onPress={() => navigation.navigate('BookCharter', { package: item })}>
                    <Text style={s.bookBtnText}>BOOK THIS TRIP</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            );
          }
          const cap = item;
          return (
            <View style={s.capCard}>
              <View style={s.capRow}>
                <View style={s.capAvatar}><Ionicons name="person" size={32} color={theme.colors.primary} /></View>
                <View style={s.capInfo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={s.capName}>{cap.name}</Text>
                    {!cap.captainProfile.isAvailable && <View style={s.unavailableBadge}><Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.error, fontSize: 9 }}>BUSY</Text></View>}
                    {cap.captainProfile.isAvailable && <View style={{ backgroundColor: theme.colors.greenBg, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.green }}><Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.green, fontSize: 9 }}>AVAILABLE</Text></View>}
                  </View>
                  <View style={s.ratingRow}>
                    {[1,2,3,4,5].map(i => <Ionicons key={i} name={i <= Math.round(cap.captainProfile.rating) ? 'star' : 'star-outline'} size={11} color={theme.colors.amber} />)}
                    <Text style={s.trips}>{cap.captainProfile.rating} · {cap.captainProfile.totalTrips} trips</Text>
                  </View>
                  <Text style={s.vessel}>{cap.captainProfile.vessel.name} · {cap.captainProfile.vessel.vesselType} · {cap.captainProfile.vessel.capacity} pax · {cap.captainProfile.vessel.length}ft</Text>
                  <View style={s.priceTag}><Text style={s.priceTagText}>From {cap.availableBoats[0]?.charter?.pricePerHour || 400} AED/hr</Text></View>
                </View>
              </View>
              <Text style={s.bio} numberOfLines={3}>{cap.captainProfile.bio}</Text>
              {cap.captainProfile.isAvailable && (
                <TouchableOpacity style={s.bookNow} onPress={() => navigation.navigate('BookCharter', { captain: cap })}>
                  <LinearGradient colors={theme.gradients.gold as any} style={{ padding: 12, alignItems: 'center', borderRadius: RADIUS.full }}>
                    <Text style={{ fontFamily: FONTS.body.bold, color: '#020B18', letterSpacing: 1 }}>BOOK CAPTAIN {cap.name.split(' ')[1].toUpperCase()}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
