import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { authActions, uiActions } from '../../store';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';

export const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const user = useSelector((s: any) => s.auth?.user);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await SecureStore.deleteItemAsync('accessToken').catch(() => {});
        dispatch(authActions.logout());
      }},
    ]);
  };

  const menu = [
    { icon: 'boat-outline', label: 'My Vessels', onPress: () => navigation.navigate('HomeTab', { screen: 'MyBoats' }) },
    { icon: 'location-outline', label: 'My Bookings', onPress: () => navigation.navigate('ParkingTab', { screen: 'MyBookings' }) },
    { icon: 'receipt-outline', label: 'Orders', onPress: () => navigation.navigate('ShopTab', { screen: 'Orders' }) },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
    { icon: 'color-palette-outline', label: 'App Theme', sub: theme.name, onPress: () => navigation.navigate('Theme') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'document-text-outline', label: 'Terms & Privacy', onPress: () => {} },
  ];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    hero: { margin: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden' },
    inner: { padding: SPACING.xl, alignItems: 'center' },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.primary, marginBottom: SPACING.md },
    name: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: '#F0EDE5', letterSpacing: 1 },
    email: { fontFamily: FONTS.body.regular, color: 'rgba(240,237,229,0.6)', fontSize: TYPE_SCALE.sm, marginTop: 4 },
    badge: { marginTop: SPACING.md, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)', backgroundColor: 'rgba(201,168,76,0.1)' },
    badgeText: { fontFamily: FONTS.body.semibold, color: '#C9A84C', fontSize: TYPE_SCALE.xs, letterSpacing: 1.5 },
    menu: { marginHorizontal: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
    item: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, backgroundColor: theme.colors.bgCard, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
    itemIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    itemLabel: { flex: 1, fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, color: theme.colors.textPrimary },
    itemSub: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary },
    logout: { margin: SPACING.base, borderRadius: RADIUS.xl, padding: SPACING.base, backgroundColor: theme.colors.redBg, borderWidth: 1, borderColor: theme.colors.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
    logoutText: { fontFamily: FONTS.body.semibold, color: theme.colors.error, fontSize: TYPE_SCALE.base },
    version: { textAlign: 'center', color: theme.colors.textTertiary, fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, marginBottom: SPACING.md },
  });

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.hero}>
          <LinearGradient colors={theme.gradients.card as any} style={s.inner}>
            <View style={s.avatar}><Ionicons name="person" size={40} color={theme.colors.primary} /></View>
            <Text style={s.name}>{user?.name || 'Captain'}</Text>
            <Text style={s.email}>{user?.email || ''}</Text>
            <View style={s.badge}><Text style={s.badgeText}>{(user?.role || 'user').toUpperCase()}</Text></View>
          </LinearGradient>
        </View>

        <View style={s.menu}>
          {menu.map((item, i) => (
            <TouchableOpacity key={i} style={[s.item, i === menu.length - 1 && { borderBottomWidth: 0 }]} onPress={item.onPress}>
              <View style={s.itemIcon}><Ionicons name={item.icon as any} size={18} color={theme.colors.primary} /></View>
              <Text style={s.itemLabel}>{item.label}</Text>
              {(item as any).sub && <Text style={s.itemSub}>{(item as any).sub}</Text>}
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={s.version}>Park & Launch v1.0.0 · UAE 2025</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export const ThemeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const options = [
    { id: 'deep_ocean', name: 'Deep Ocean', desc: 'Classic nautical luxury', tag: 'DARK · GOLD', preview: ['#020B18', '#071929', '#C9A84C'] },
    { id: 'pearl_harbor', name: 'Pearl Harbor', desc: 'Champagne light elegance', tag: 'LIGHT · CHAMPAGNE', preview: ['#F5F2EC', '#EDE9E0', '#8B6914'] },
    { id: 'midnight_marina', name: 'Midnight Marina', desc: 'Ultra-modern cyan noir', tag: 'DARK · ELECTRIC', preview: ['#000000', '#0A0A0A', '#00D4FF'] },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: SPACING.base, gap: SPACING.md }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary }}>App Theme</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: SPACING.base }}>
        {options.map(opt => {
          const t = THEMES[opt.id];
          const active = opt.id === themeId;
          return (
            <TouchableOpacity key={opt.id} onPress={() => dispatch(uiActions.setTheme(opt.id))} style={{ marginBottom: SPACING.md, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 2, borderColor: active ? t.colors.primary : t.colors.border, backgroundColor: t.colors.bgCard }}>
              <View style={{ height: 8, flexDirection: 'row' }}>{opt.preview.map((c, i) => <View key={i} style={{ flex: 1, backgroundColor: c }} />)}</View>
              <View style={{ padding: SPACING.lg }}>
                <View style={{ alignSelf: 'flex-start', backgroundColor: t.colors.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: t.colors.primary, marginBottom: SPACING.sm }}>
                  <Text style={{ fontFamily: FONTS.body.bold, color: t.colors.primary, fontSize: TYPE_SCALE.xs }}>{opt.tag}</Text>
                </View>
                <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg, color: t.colors.textPrimary }}>{opt.name}</Text>
                <Text style={{ fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: t.colors.textSecondary, marginTop: 4 }}>{opt.desc}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.md }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: active ? t.colors.primary : t.colors.bgElevated, alignItems: 'center', justifyContent: 'center' }}>
                    {active && <Ionicons name="checkmark" size={16} color={t.colors.textInverse} />}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: SPACING.base, gap: SPACING.md }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary }}>Notifications</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="notifications-outline" size={60} color={theme.colors.textTertiary} />
        <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, marginTop: SPACING.md }}>No notifications yet</Text>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
