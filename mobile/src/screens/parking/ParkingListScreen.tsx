import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { parkingActions } from '../../store';
import { MOCK_YARDS } from '../../api/mockData';

const DARK_MAP = [
  { elementType: 'geometry', stylers: [{ color: '#0D2137' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#04101C' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A3A5C' }] },
];

export default function ParkingListScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [emirate, setEmirate] = useState('');
  const [loading, setLoading] = useState(true);
  const [yards, setYards] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => { setYards(MOCK_YARDS); setLoading(false); }, 800);
  }, []);

  const filtered = yards.filter(y =>
    (!emirate || y.emirate === emirate) &&
    (!search || y.name.toLowerCase().includes(search.toLowerCase()) || y.area.toLowerCase().includes(search.toLowerCase()))
  );

  const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah'];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { padding: SPACING.base, paddingTop: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, letterSpacing: 1 },
    sub: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: theme.colors.textSecondary, marginTop: 2 },
    searchRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgInput, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: SPACING.md, height: 44 },
    searchInput: { flex: 1, color: theme.colors.textPrimary, fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, marginLeft: 8 },
    toggleBtn: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: theme.colors.bgCard, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
    filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm },
    chip: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1 },
    map: { flex: 1 },
    card: { backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, marginHorizontal: SPACING.base, marginBottom: SPACING.md, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', ...theme.shadows.md },
    cardBody: { padding: SPACING.base },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    yardName: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.md, color: theme.colors.textPrimary, flex: 1 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.amberBg, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
    ratingText: { fontFamily: FONTS.body.semibold, color: theme.colors.amber, fontSize: TYPE_SCALE.xs },
    area: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: SPACING.sm, gap: 4 },
    price: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.primary },
    priceSuffix: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: SPACING.sm },
    tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 4 },
    tagText: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10 },
    spotsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
    spotsText: { fontFamily: FONTS.body.semibold, color: theme.colors.green, fontSize: TYPE_SCALE.sm },
    featuredBadge: { backgroundColor: theme.colors.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.primary, marginBottom: 8, alignSelf: 'flex-start' },
    featuredText: { fontFamily: FONTS.body.bold, color: theme.colors.primary, fontSize: 10 },
    urgencyBadge: { backgroundColor: theme.colors.redBg, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.red },
    urgencyText: { fontFamily: FONTS.body.bold, color: theme.colors.red, fontSize: 10 },
    bookBtn: { padding: 12, alignItems: 'center' },
    bookBtnText: { fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.sm, letterSpacing: 1 },
  });

  const renderCard = ({ item: y }: any) => (
    <TouchableOpacity style={s.card} onPress={() => { dispatch(parkingActions.setSelectedYard(y)); navigation.navigate('ParkingDetail', { yardId: y._id }); }} activeOpacity={0.85}>
      <View style={s.cardBody}>
        {y.isFeatured && <View style={s.featuredBadge}><Text style={s.featuredText}>★ FEATURED</Text></View>}
        <View style={s.cardRow}>
          <Text style={s.yardName} numberOfLines={2}>{y.name}</Text>
          <View style={s.ratingBadge}>
            <Ionicons name="star" size={10} color={theme.colors.amber} />
            <Text style={s.ratingText}>{y.rating} ({y.reviewCount})</Text>
          </View>
        </View>
        <Text style={s.area}>{y.area}, {y.emirate}</Text>
        <View style={s.priceRow}>
          <Text style={s.price}>{y.pricing?.ratePerFootPerMonth}</Text>
          <Text style={s.priceSuffix}> AED / ft / month</Text>
        </View>
        <View style={s.tagsRow}>
          {y.services?.cctv24h && <View style={s.tag}><Ionicons name="videocam" size={10} color={theme.colors.primary} /><Text style={s.tagText}>24/7 CCTV</Text></View>}
          {y.services?.security24h && <View style={s.tag}><Ionicons name="shield-checkmark" size={10} color={theme.colors.primary} /><Text style={s.tagText}>Security</Text></View>}
          {y.services?.powerWash?.available && <View style={s.tag}><Ionicons name="water" size={10} color={theme.colors.primary} /><Text style={s.tagText}>Power Wash</Text></View>}
          {y.services?.wifi && <View style={s.tag}><Ionicons name="wifi" size={10} color={theme.colors.primary} /><Text style={s.tagText}>WiFi</Text></View>}
          {y.services?.electricHookup && <View style={s.tag}><Ionicons name="flash" size={10} color={theme.colors.primary} /><Text style={s.tagText}>Electric</Text></View>}
        </View>
        <View style={s.spotsRow}>
          <Text style={[s.spotsText, y.availableSpots === 0 && { color: theme.colors.red }]}>
            {y.availableSpots === 0 ? '● FULL' : `● ${y.availableSpots} spots available`}
          </Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs }}>Max {y.maxBoatLengthFt}ft</Text>
          {y.availableSpots > 0 && y.availableSpots <= 3 && <View style={s.urgencyBadge}><Text style={s.urgencyText}>Only {y.availableSpots} left!</Text></View>}
        </View>
      </View>
      <LinearGradient colors={theme.gradients.gold as any} style={s.bookBtn}>
        <Text style={s.bookBtnText}>{y.availableSpots === 0 ? 'JOIN WAITLIST' : 'VIEW & BOOK'}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Marine Yards</Text>
        <Text style={s.sub}>{yards.length} locations across UAE</Text>
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
            <TextInput style={s.searchInput} placeholder="Search yards, areas..." placeholderTextColor={theme.colors.textTertiary} value={search} onChangeText={setSearch} />
          </View>
          <TouchableOpacity style={s.toggleBtn} onPress={() => setViewMode(v => v === 'list' ? 'map' : 'list')}>
            <Ionicons name={viewMode === 'list' ? 'map-outline' : 'list-outline'} size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        {['All', ...emirates].map(e => {
          const active = (e === 'All' && !emirate) || e === emirate;
          return (
            <TouchableOpacity key={e} style={[s.chip, { backgroundColor: active ? theme.colors.primary : theme.colors.bgCard, borderColor: active ? theme.colors.primary : theme.colors.border }]} onPress={() => setEmirate(e === 'All' ? '' : e)}>
              <Text style={{ fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs, color: active ? '#020B18' : theme.colors.textSecondary }}>{e}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 60 }} /> : viewMode === 'map' ? (
        <MapView style={s.map} initialRegion={{ latitude: 25.2, longitude: 55.2, latitudeDelta: 0.8, longitudeDelta: 0.8 }} customMapStyle={theme.dark ? DARK_MAP : []}>
          {filtered.map((y: any) => (
            <Marker key={y._id} coordinate={{ latitude: y.location.coordinates[1], longitude: y.location.coordinates[0] }} title={y.name} description={`${y.availableSpots} spots · ${y.pricing?.ratePerFootPerMonth} AED/ft`} onPress={() => { dispatch(parkingActions.setSelectedYard(y)); navigation.navigate('ParkingDetail', { yardId: y._id }); }} />
          ))}
        </MapView>
      ) : (
        <FlatList data={filtered} keyExtractor={(i: any) => i._id} renderItem={renderCard} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: 100 }} ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 80 }}><Ionicons name="search" size={48} color={theme.colors.textTertiary} /><Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, marginTop: 12 }}>No yards found</Text></View>} />
      )}
    </SafeAreaView>
  );
}
