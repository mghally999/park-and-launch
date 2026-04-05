import React, { useEffect, useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { uiActions, parkingActions, boatsActions, notificationsActions } from '../../store';
import { weatherAPI, parkingAPI, boatsAPI, userAPI } from '../../api/client';
import { WeatherWidget, QuickActionCard, ActiveBookingBanner, BoatStatusCard } from '../../components/home/WeatherWidget';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const user = useSelector((s: any) => s.auth?.user);
  const weather = useSelector((s: any) => s.ui?.weatherData);
  const boats = useSelector((s: any) => s.boats?.boats || []);
  const activeBooking = useSelector((s: any) => s.parking?.activeBooking);
  const unreadCount = useSelector((s: any) => s.notifications?.unreadCount || 0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [weatherRes, boatsRes, bookingsRes] = await Promise.allSettled([
        weatherAPI.getMarineWeather(),
        boatsAPI.getMyBoats(),
        parkingAPI.getMyBookings({ status: 'active', limit: 1 }),
      ]);
      if (weatherRes.status === 'fulfilled') dispatch(uiActions.setWeatherData(weatherRes.value.data.data));
      if (boatsRes.status === 'fulfilled') dispatch(boatsActions.setBoats(boatsRes.value.data.data));
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data.data.length > 0) {
        dispatch(parkingActions.setActiveBooking(bookingsRes.value.data.data[0]));
      }
    } catch (e) {}
  }, [dispatch]);

  useEffect(() => { fetchData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Valid Ionicons names
  const quickActions = [
    { icon: 'location' as const, label: 'Find Parking', color: theme.colors.primary, onPress: () => navigation.navigate('ParkingTab') },
    { icon: 'boat' as const, label: 'Charter', color: theme.colors.accent, onPress: () => navigation.navigate('CharterTab') },
    { icon: 'navigate' as const, label: 'Deliver Boat', color: '#10B981', onPress: () => navigation.navigate('DeliverySchedule') },
    { icon: 'water' as const, label: 'Cleaning', color: '#6366F1', onPress: () => navigation.navigate('Cleaning') },
    { icon: 'fish' as const, label: 'Equipment', color: '#F59E0B', onPress: () => navigation.navigate('Equipment') },
    { icon: 'storefront' as const, label: 'Marine Shop', color: '#EF4444', onPress: () => navigation.navigate('ShopTab') },
  ];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    heroSection: { paddingHorizontal: SPACING.base, paddingTop: SPACING.xl },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: theme.colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase' },
    userName: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['2xl'], color: theme.colors.textPrimary, letterSpacing: 1, marginTop: 2 },
    notifBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.bgCard, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
    badge: { position: 'absolute', top: 6, right: 6, backgroundColor: theme.colors.error, borderRadius: 6, minWidth: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: '#fff', fontSize: 7, fontFamily: FONTS.body.bold },
    section: { marginTop: SPACING.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, marginBottom: SPACING.md },
    sectionTitle: { fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.base, color: theme.colors.textPrimary, letterSpacing: 1.5, textTransform: 'uppercase' },
    seeAll: { fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs, color: theme.colors.primary, letterSpacing: 1 },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.base, gap: SPACING.sm },
    goldLine: { height: 1, backgroundColor: theme.colors.primary, marginHorizontal: SPACING.base, marginTop: SPACING.xl, opacity: 0.3 },
    addBoatBtn: { marginHorizontal: SPACING.base, marginTop: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', alignItems: 'center' },
    addBoatText: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, marginTop: 4, fontSize: TYPE_SCALE.sm },
    savingsBanner: { margin: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden' },
    savingsInner: { padding: SPACING.lg },
    savingsTitle: { fontFamily: FONTS.display.bold, color: '#fff', fontSize: TYPE_SCALE.base, letterSpacing: 0.5 },
    savingsDesc: { fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.8)', fontSize: TYPE_SCALE.sm, marginTop: 4 },
    calcBtn: { marginTop: SPACING.md, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.full, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start' },
    calcBtnText: { fontFamily: FONTS.body.bold, color: '#fff', fontSize: TYPE_SCALE.sm },
  });

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient colors={theme.gradients.hero as any} style={{ paddingTop: SPACING.md }}>
          <View style={s.heroSection}>
            <View style={s.headerRow}>
              <View>
                <Text style={s.greeting}>{getGreeting()}</Text>
                <Text style={s.userName}>{user?.name?.split(' ')[0] || 'Captain'}</Text>
              </View>
              <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate('Notifications')}>
                <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
                {unreadCount > 0 && <View style={s.badge}><Text style={s.badgeText}>{unreadCount}</Text></View>}
              </TouchableOpacity>
            </View>
          </View>
          <WeatherWidget weather={weather} theme={theme} />
        </LinearGradient>

        {activeBooking && (
          <ActiveBookingBanner
            booking={activeBooking}
            theme={theme}
            onPress={() => navigation.navigate('ParkingTab', { screen: 'BookingDetail', params: { bookingId: activeBooking._id } })}
          />
        )}

        <View style={s.goldLine} />

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Services</Text>
          </View>
          <View style={s.quickGrid}>
            {quickActions.map((a, i) => <QuickActionCard key={i} {...a} theme={theme} />)}
          </View>
        </View>

        {boats.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>My Vessels</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyBoats')}><Text style={s.seeAll}>View All →</Text></TouchableOpacity>
            </View>
            {boats.slice(0, 3).map((boat: any) => (
              <BoatStatusCard
                key={boat._id}
                boat={boat}
                theme={theme}
                onPress={() => navigation.navigate('BoatDetail', { boatId: boat._id })}
                onCamera={() => navigation.navigate('ParkingTab', { screen: 'CameraFeed' })}
                onDeliver={() => navigation.navigate('DeliverySchedule', { boatId: boat._id })}
              />
            ))}
          </View>
        )}

        <TouchableOpacity style={s.addBoatBtn} onPress={() => navigation.navigate('AddBoat')}>
          <Ionicons name="add" size={20} color={theme.colors.textSecondary} />
          <Text style={s.addBoatText}>Add a vessel</Text>
        </TouchableOpacity>

        <View style={s.savingsBanner}>
          <LinearGradient colors={theme.gradients.gold as any} style={s.savingsInner}>
            <Text style={s.savingsTitle}>Save up to AED 1,000/month</Text>
            <Text style={s.savingsDesc}>vs. Dubai Creek Yacht Club (67 AED/ft/month)</Text>
            <TouchableOpacity style={s.calcBtn} onPress={() => navigation.navigate('ParkingTab', { screen: 'PriceCalculator' })}>
              <Text style={s.calcBtnText}>Calculate Savings →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
