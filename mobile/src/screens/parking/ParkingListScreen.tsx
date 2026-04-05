import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { RootState, parkingActions } from '../../store';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { parkingAPI } from '../../api/client';

const ParkingListScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: RootState) => s.ui.theme);
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const yards = useSelector((s: RootState) => s.parking.yards);
  const isLoading = useSelector((s: RootState) => s.parking.isLoading);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [emirateFilter, setEmirateFilter] = useState('');
  const [filteredYards, setFilteredYards] = useState(yards);

  const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah'];

  useEffect(() => {
    fetchYards();
    getUserLocation();
  }, []);

  useEffect(() => {
    let result = yards;
    if (emirateFilter) result = result.filter((y: any) => y.emirate === emirateFilter);
    if (search) result = result.filter((y: any) =>
      y.name.toLowerCase().includes(search.toLowerCase()) ||
      y.area.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredYards(result);
  }, [yards, search, emirateFilter]);

  const fetchYards = async () => {
    dispatch(parkingActions.setParkingLoading(true));
    try {
      const params: any = { limit: 50, sort: '-rating' };
      if (emirateFilter) params.emirate = emirateFilter;
      const { data } = await parkingAPI.getYards(params);
      dispatch(parkingActions.setYards(data.data));
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(parkingActions.setParkingLoading(false));
    }
  };

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, letterSpacing: 1 },
    subtitle: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: theme.colors.textSecondary, marginTop: 2 },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md },
    searchBox: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.colors.bgInput, borderRadius: RADIUS.lg,
      borderWidth: 1, borderColor: theme.colors.border,
      paddingHorizontal: SPACING.md, height: 44,
    },
    searchInput: { flex: 1, color: theme.colors.textPrimary, fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, marginLeft: 8 },
    toggleBtn: {
      width: 44, height: 44, borderRadius: RADIUS.md,
      backgroundColor: theme.colors.bgCard, borderWidth: 1,
      borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center',
    },
    filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, paddingVertical: SPACING.sm },
    filterChip: {
      paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full,
      borderWidth: 1,
    },
    filterText: { fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs },
    map: { flex: 1 },
    card: {
      backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl,
      marginHorizontal: SPACING.base, marginBottom: SPACING.md,
      overflow: 'hidden',
      borderWidth: 1, borderColor: theme.colors.border,
      ...theme.shadows.md,
    },
    cardTop: { padding: SPACING.base },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    yardName: { fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.md, color: theme.colors.textPrimary, flex: 1 },
    ratingPill: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: theme.colors.amberBg, borderRadius: RADIUS.full,
      paddingHorizontal: 10, paddingVertical: 4,
    },
    ratingText: { fontFamily: FONTS.body.semibold, color: theme.colors.amber, fontSize: TYPE_SCALE.xs },
    area: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: theme.colors.textSecondary, marginTop: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: SPACING.sm, gap: 4 },
    price: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.primary },
    priceSuffix: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary },
    spotsRow: { flexDirection: 'row', gap: SPACING.base, marginTop: SPACING.sm },
    spotsAvail: { fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.sm, color: '#10B981' },
    services: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: SPACING.sm },
    serviceTag: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.full,
      paddingHorizontal: 10, paddingVertical: 4,
    },
    serviceText: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary },
    bookBtn: { padding: SPACING.md, alignItems: 'center' },
    bookBtnText: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, color: theme.colors.textInverse, letterSpacing: 1 },
    emptyState: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, marginTop: SPACING.md },
    urgencyBadge: {
      position: 'absolute', top: SPACING.md, right: SPACING.md,
      backgroundColor: theme.colors.redBg, borderRadius: RADIUS.full,
      paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.red,
    },
    urgencyText: { fontFamily: FONTS.body.bold, color: theme.colors.red, fontSize: TYPE_SCALE.xs },
    featuredBadge: {
      backgroundColor: theme.colors.primaryGlow, borderRadius: RADIUS.full,
      paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.primary,
      marginBottom: SPACING.sm, alignSelf: 'flex-start',
    },
    featuredText: { fontFamily: FONTS.body.semibold, color: theme.colors.primary, fontSize: TYPE_SCALE.xs },
  });

  const renderYardCard = ({ item: yard }: { item: any }) => {
    const isLow = yard.availableSpots <= 3;
    const isFull = yard.availableSpots === 0;

    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => { dispatch(parkingActions.setSelectedYard(yard)); navigation.navigate('ParkingDetail', { yardId: yard._id }); }}
        activeOpacity={0.85}
      >
        <View style={s.cardTop}>
          {yard.isFeatured && <View style={s.featuredBadge}><Text style={s.featuredText}>★ FEATURED</Text></View>}

          <View style={s.cardRow}>
            <Text style={s.yardName} numberOfLines={1}>{yard.name}</Text>
            <View style={s.ratingPill}>
              <Ionicons name="star" size={10} color={theme.colors.amber} />
              <Text style={s.ratingText}>{yard.rating?.toFixed(1) || '—'}</Text>
            </View>
          </View>

          <Text style={s.area}>{yard.area}, {yard.emirate}</Text>

          <View style={s.priceRow}>
            <Text style={s.price}>{yard.pricing?.ratePerFootPerMonth}</Text>
            <Text style={s.priceSuffix}> AED / ft / month</Text>
          </View>

          <View style={s.spotsRow}>
            <Text style={[s.spotsAvail, isFull && { color: theme.colors.error }]}>
              {isFull ? 'FULL' : `${yard.availableSpots} spots available`}
            </Text>
            <Text style={s.serviceText}>Max {yard.maxBoatLengthFt}ft</Text>
          </View>

          <View style={s.services}>
            {yard.services?.cctv24h && <View style={s.serviceTag}><Ionicons name="videocam" size={10} color={theme.colors.textSecondary} /><Text style={s.serviceText}>24/7 CCTV</Text></View>}
            {yard.services?.security24h && <View style={s.serviceTag}><Ionicons name="shield-checkmark" size={10} color={theme.colors.textSecondary} /><Text style={s.serviceText}>Security</Text></View>}
            {yard.services?.powerWash?.available && <View style={s.serviceTag}><Ionicons name="water" size={10} color={theme.colors.textSecondary} /><Text style={s.serviceText}>Power Wash</Text></View>}
            {yard.services?.electricHookup && <View style={s.serviceTag}><Ionicons name="flash" size={10} color={theme.colors.textSecondary} /><Text style={s.serviceText}>Electric</Text></View>}
          </View>
        </View>

        {isLow && !isFull && (
          <View style={s.urgencyBadge}>
            <Text style={s.urgencyText}>Only {yard.availableSpots} left!</Text>
          </View>
        )}

        <LinearGradient colors={theme.gradients.gold as any} style={s.bookBtn}>
          <Text style={s.bookBtnText}>{isFull ? 'JOIN WAITLIST' : 'BOOK NOW'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Marine Yards</Text>
        <Text style={s.subtitle}>{yards.length} locations across UAE</Text>
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
            <TextInput
              style={s.searchInput}
              placeholder="Search yards, areas..."
              placeholderTextColor={theme.colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={s.toggleBtn} onPress={() => setViewMode(v => v === 'list' ? 'map' : 'list')}>
            <Ionicons name={viewMode === 'list' ? 'map-outline' : 'list-outline'} size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Emirate filters */}
      <FlatList
        horizontal
        data={['All', ...emirates]}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        renderItem={({ item }) => {
          const active = (item === 'All' && !emirateFilter) || item === emirateFilter;
          return (
            <TouchableOpacity
              style={[s.filterChip, { backgroundColor: active ? theme.colors.primary : theme.colors.bgCard, borderColor: active ? theme.colors.primary : theme.colors.border }]}
              onPress={() => setEmirateFilter(item === 'All' ? '' : item)}
            >
              <Text style={[s.filterText, { color: active ? theme.colors.textInverse : theme.colors.textSecondary }]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {viewMode === 'map' ? (
        <MapView
          style={s.map}
          initialRegion={{ latitude: 25.2048, longitude: 55.2708, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
          customMapStyle={theme.id === 'deep_ocean' || theme.id === 'midnight_marina' ? darkMapStyle : []}
        >
          {filteredYards.map((yard: any) => (
            <Marker
              key={yard._id}
              coordinate={{ latitude: yard.location?.coordinates[1], longitude: yard.location?.coordinates[0] }}
              title={yard.name}
              description={`${yard.availableSpots} spots • ${yard.pricing?.ratePerFootPerMonth} AED/ft`}
              onPress={() => navigation.navigate('ParkingDetail', { yardId: yard._id })}
            />
          ))}
          {userLocation && <Circle center={{ latitude: userLocation.lat, longitude: userLocation.lng }} radius={1000} fillColor="rgba(201,168,76,0.1)" strokeColor={theme.colors.primary} />}
        </MapView>
      ) : (
        <FlatList
          data={filteredYards}
          keyExtractor={(item: any) => item._id}
          renderItem={renderYardCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: 100 }}
          ListEmptyComponent={
            isLoading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 60 }} /> : (
              <View style={s.emptyState}>
                <Ionicons name="search" size={48} color={theme.colors.textTertiary} />
                <Text style={s.emptyText}>No yards found</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0D2137' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#020B18' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#04101C' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A3A5C' }] },
];

export default ParkingListScreen;
