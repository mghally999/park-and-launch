import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { uiActions, parkingActions, boatsActions, notificationsActions } from '../../store';
import { MOCK_WEATHER, MOCK_BOOKINGS, MOCK_BOATS, MOCK_NOTIFICATIONS } from '../../api/mockData';

const WeatherStrip = ({ theme }: any) => {
  const w = MOCK_WEATHER.current;
  const safetyColors: any = { green: '#10B981', yellow: '#F59E0B', red: '#EF4444' };
  const sc = safetyColors[MOCK_WEATHER.current.safetyLevel];
  return (
    <View style={{ margin: SPACING.base, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', padding: SPACING.base, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <Ionicons name="sunny" size={36} color={theme.colors.primary} />
          <View>
            <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['2xl'], color: theme.colors.textPrimary }}>{w.temp}°C</Text>
            <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm }}>{w.condition} · Dubai Waters</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: sc + '20', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: sc }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sc }} />
          <Text style={{ fontFamily: FONTS.body.bold, color: sc, fontSize: TYPE_SCALE.xs }}>SAFE TO SAIL</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm }}>
        {[
          { icon: 'water-outline', label: 'Waves', val: `${w.waveHeight}m` },
          { icon: 'compass-outline', label: 'Wind', val: `${w.windSpeed}kn` },
          { icon: 'thermometer-outline', label: 'Sea', val: `${w.seaTemp}°C` },
          { icon: 'eye-outline', label: 'Vis', val: `${w.visibility}km` },
        ].map((s, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Ionicons name={s.icon as any} size={14} color={theme.colors.textTertiary} />
            <Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.xs, marginTop: 2 }}>{s.val}</Text>
            <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textTertiary, fontSize: 9 }}>{s.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.divider, padding: SPACING.sm, gap: SPACING.md }}>
        <Text style={{ fontFamily: FONTS.body.medium, color: theme.colors.textSecondary, fontSize: 10 }}>🎣 Best fishing:</Text>
        {MOCK_WEATHER.bestFishingTimes.map((t, i) => <View key={i} style={{ backgroundColor: theme.colors.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={{ fontFamily: FONTS.body.semibold, color: theme.colors.primary, fontSize: 9 }}>{t}</Text></View>)}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const userName = useSelector((s: any) => s.auth?.user?.name);
  const userRole = useSelector((s: any) => s.auth?.user?.role);
  const unreadCount = useSelector((s: any) => s.notifications?.unreadCount ?? 0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(notificationsActions.setUnreadCount(MOCK_NOTIFICATIONS.filter(n => !n.isRead).length));
    dispatch(parkingActions.setActiveBooking(MOCK_BOOKINGS[0]));
    dispatch(boatsActions.setBoats(MOCK_BOATS));
    dispatch(uiActions.setWeatherData(MOCK_WEATHER));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    { icon: 'location' as const, label: 'Find Parking', color: theme.colors.primary, onPress: () => navigation.navigate('ParkingTab') },
    { icon: 'boat' as const, label: 'Charter', color: '#1A7DB5', onPress: () => navigation.navigate('CharterTab') },
    { icon: 'navigate' as const, label: 'Deliver Boat', color: '#10B981', onPress: () => navigation.navigate('DeliverySchedule') },
    { icon: 'water' as const, label: 'Cleaning', color: '#6366F1', onPress: () => navigation.navigate('Cleaning') },
    { icon: 'fish' as const, label: 'Equipment', color: '#F59E0B', onPress: () => navigation.navigate('Equipment') },
    { icon: 'storefront' as const, label: 'Marine Shop', color: '#EF4444', onPress: () => navigation.navigate('ShopTab') },
  ];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: SPACING.md },
    greeting: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: theme.colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase' },
    userName: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['2xl'], color: theme.colors.textPrimary, letterSpacing: 1 },
    notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.bgCard, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
    badge: { position: 'absolute', top: 6, right: 6, backgroundColor: theme.colors.error, borderRadius: 6, minWidth: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: '#fff', fontSize: 7, fontFamily: FONTS.body.bold },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, marginBottom: SPACING.md, marginTop: SPACING.xl },
    sectionTitle: { fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.base, color: theme.colors.textPrimary, letterSpacing: 1.5, textTransform: 'uppercase' },
    seeAll: { fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs, color: theme.colors.primary },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.base, gap: SPACING.sm },
    quickCard: { width: '31%', aspectRatio: 1, borderRadius: RADIUS.xl, backgroundColor: theme.colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
    quickIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    quickLabel: { fontFamily: FONTS.body.medium, fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center' },
    bookingBanner: { margin: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden' },
    divider: { height: 1, backgroundColor: theme.colors.primary, marginHorizontal: SPACING.base, opacity: 0.2, marginTop: SPACING.xl },
    boatCard: { marginHorizontal: SPACING.base, marginBottom: SPACING.sm, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border },
    savingsBanner: { margin: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden' },
    tidesRow: { paddingHorizontal: SPACING.base, marginBottom: SPACING.xl },
    tideItem: { alignItems: 'center', backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.md, padding: SPACING.sm, flex: 1, borderWidth: 1, borderColor: theme.colors.border },
  });

  const statusColors: any = { in_yard: '#10B981', in_water: '#1A7DB5', in_transit: '#F59E0B', maintenance: '#EF4444' };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />} contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient colors={theme.gradients.hero as any} style={{ paddingTop: SPACING.md }}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.greeting}>{getGreeting()}</Text>
              <Text style={s.userName}>{userName?.split(' ')[0] || 'Captain'}</Text>
            </View>
            <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
              {unreadCount > 0 && <View style={s.badge}><Text style={s.badgeText}>{unreadCount}</Text></View>}
            </TouchableOpacity>
          </View>
          <WeatherStrip theme={theme} />
        </LinearGradient>

        {/* Active Booking */}
        <TouchableOpacity style={s.bookingBanner} onPress={() => navigation.navigate('ParkingTab', { screen: 'MyBookings' })}>
          <LinearGradient colors={['rgba(201,168,76,0.15)', 'rgba(201,168,76,0.05)']} style={{ padding: SPACING.base, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: RADIUS.xl }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md }}>
              <Ionicons name="location" size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.xs, letterSpacing: 1, textTransform: 'uppercase' }}>Active Parking · Spot A-07</Text>
              <Text style={{ fontFamily: FONTS.display.regular, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.md, marginTop: 2 }}>Jebel Ali Marine Yard</Text>
              <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, marginTop: 2 }}>15 days remaining · Blue Falcon</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={s.divider} />

        {/* Quick Actions */}
        <View>
          <View style={s.sectionHeader}><Text style={s.sectionTitle}>Services</Text></View>
          <View style={s.quickGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity key={i} style={s.quickCard} onPress={a.onPress} activeOpacity={0.75}>
                <View style={[s.quickIcon, { backgroundColor: a.color + '18' }]}><Ionicons name={a.icon} size={22} color={a.color} /></View>
                <Text style={s.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Vessels */}
        <View>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>My Vessels</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyBoats')}><Text style={s.seeAll}>View All →</Text></TouchableOpacity>
          </View>
          {MOCK_BOATS.map(boat => {
            const sc = statusColors[boat.status] || theme.colors.textSecondary;
            return (
              <View key={boat._id} style={s.boatCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, borderWidth: 1.5, borderColor: sc }}>
                      <Ionicons name="boat" size={22} color={sc} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.base, color: theme.colors.textPrimary }}>{boat.name}</Text>
                      <Text style={{ fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary, marginTop: 2 }}>{boat.make} {boat.model} · {boat.dimensions.lengthFt}ft · {boat.engine.horsepower}hp</Text>
                      {boat.fuelLevel && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Ionicons name="flame" size={10} color={boat.fuelLevel > 50 ? theme.colors.green : theme.colors.amber} />
                        <Text style={{ fontFamily: FONTS.body.regular, fontSize: 10, color: theme.colors.textSecondary }}>Fuel: {boat.fuelLevel}%</Text>
                      </View>}
                    </View>
                  </View>
                  <View style={{ backgroundColor: sc + '20', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: sc }}>
                    <Text style={{ fontFamily: FONTS.body.bold, color: sc, fontSize: 9 }}>{boat.status.replace(/_/g, ' ').toUpperCase()}</Text>
                  </View>
                </View>
                {boat.status === 'in_yard' && (
                  <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
                    <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.md, padding: 8, borderWidth: 1, borderColor: theme.colors.border }} onPress={() => navigation.navigate('CameraFeed', { boatId: boat._id })}>
                      <Ionicons name="videocam" size={14} color={theme.colors.primary} />
                      <Text style={{ fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs, color: theme.colors.primary }}>Live Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.md, padding: 8, borderWidth: 1, borderColor: theme.colors.border }} onPress={() => navigation.navigate('DeliverySchedule', { boatId: boat._id })}>
                      <Ionicons name="navigate" size={14} color={theme.colors.accent} />
                      <Text style={{ fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs, color: theme.colors.accent }}>Deliver Now</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Tides */}
        <View>
          <View style={s.sectionHeader}><Text style={s.sectionTitle}>Today's Tides</Text></View>
          <View style={[s.tidesRow, { flexDirection: 'row', gap: SPACING.sm }]}>
            {MOCK_WEATHER.tides.map((tide, i) => (
              <View key={i} style={s.tideItem}>
                <Ionicons name={tide.type === 'High' ? 'arrow-up' : 'arrow-down'} size={16} color={tide.type === 'High' ? '#1A7DB5' : theme.colors.textTertiary} />
                <Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.sm, marginTop: 4 }}>{tide.time}</Text>
                <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10 }}>{tide.heightM}m</Text>
                <Text style={{ fontFamily: FONTS.body.bold, color: tide.type === 'High' ? '#1A7DB5' : theme.colors.textTertiary, fontSize: 9, marginTop: 2 }}>{tide.type}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Savings Banner */}
        <View style={s.savingsBanner}>
          <LinearGradient colors={theme.gradients.gold as any} style={{ padding: SPACING.lg }}>
            <Text style={{ fontFamily: FONTS.body.bold, color: '#fff', fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>💰 COST COMPARISON</Text>
            <Text style={{ fontFamily: FONTS.display.bold, color: '#fff', fontSize: TYPE_SCALE.lg }}>Save 1,410 AED/month</Text>
            <Text style={{ fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.8)', fontSize: TYPE_SCALE.sm, marginTop: 4 }}>vs. Dubai Creek Yacht Club (67 AED/ft/month)</Text>
            <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md }}>
              {[['Park & Launch', '660 AED', '#fff'], ['Dubai Creek', '2,210 AED', 'rgba(255,255,255,0.5)']].map(([label, price, color]) => (
                <View key={label} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.md, padding: SPACING.sm }}>
                  <Text style={{ fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>{label}</Text>
                  <Text style={{ fontFamily: FONTS.display.bold, color, fontSize: TYPE_SCALE.base }}>{price}</Text>
                  <Text style={{ fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.6)', fontSize: 9 }}>per month (33ft boat)</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={{ marginTop: SPACING.md, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.full, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start' }} onPress={() => navigation.navigate('ParkingTab', { screen: 'PriceCalculator' })}>
              <Text style={{ fontFamily: FONTS.body.bold, color: '#fff', fontSize: TYPE_SCALE.sm }}>Calculate Your Savings →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
