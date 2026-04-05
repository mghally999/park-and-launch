import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { RootState, authActions, uiActions } from '../../store';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { userAPI } from '../../api/client';

// ============================================================
// PROFILE SCREEN
// ============================================================
export const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: RootState) => s.ui.theme);
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const user = useSelector((s: RootState) => s.auth.user);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('accessToken');
          dispatch(authActions.logout());
        }
      }
    ]);
  };

  const menuItems = [
    { icon: 'boat-outline', label: 'My Vessels', desc: 'Manage your boats', onPress: () => navigation.navigate('HomeTab', { screen: 'MyBoats' }) },
    { icon: 'location-outline', label: 'My Bookings', desc: 'Parking history & active', onPress: () => navigation.navigate('ParkingTab', { screen: 'MyBookings' }) },
    { icon: 'receipt-outline', label: 'Orders', desc: 'Marine shop orders', onPress: () => navigation.navigate('ShopTab', { screen: 'Orders' }) },
    { icon: 'notifications-outline', label: 'Notifications', desc: `Unread: ${0}`, onPress: () => navigation.navigate('Notifications') },
    { icon: 'color-palette-outline', label: 'App Theme', desc: theme.name, onPress: () => navigation.navigate('Theme') },
    { icon: 'person-outline', label: 'Edit Profile', desc: 'Update your details', onPress: () => navigation.navigate('EditProfile') },
    { icon: 'settings-outline', label: 'Settings', desc: 'Notifications & preferences', onPress: () => navigation.navigate('Settings') },
    { icon: 'shield-outline', label: 'Security', desc: 'Password & 2FA', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', desc: 'Contact us 24/7', onPress: () => {} },
    { icon: 'document-text-outline', label: 'Terms & Privacy', desc: 'Legal information', onPress: () => {} },
  ];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    heroCard: { margin: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden' },
    heroInner: { padding: SPACING.xl, alignItems: 'center' },
    avatar: {
      width: 88, height: 88, borderRadius: 44,
      backgroundColor: theme.colors.bgElevated,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 3, borderColor: theme.colors.primary,
      marginBottom: SPACING.md,
    },
    name: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: '#F0EDE5', letterSpacing: 1, textAlign: 'center' },
    email: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: 'rgba(240,237,229,0.7)', marginTop: 4 },
    planBadge: {
      marginTop: SPACING.md, borderRadius: RADIUS.full,
      paddingHorizontal: SPACING.md, paddingVertical: 6,
      borderWidth: 1, borderColor: 'rgba(201,168,76,0.5)',
      backgroundColor: 'rgba(201,168,76,0.1)',
    },
    planText: { fontFamily: FONTS.body.semibold, color: '#C9A84C', fontSize: TYPE_SCALE.xs, letterSpacing: 1.5 },
    statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.md },
    statCard: {
      flex: 1, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl,
      padding: SPACING.md, alignItems: 'center',
      borderWidth: 1, borderColor: theme.colors.border,
    },
    statVal: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.primary },
    statLabel: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary, marginTop: 4 },
    menuSection: { marginHorizontal: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
    menuItem: {
      flexDirection: 'row', alignItems: 'center',
      padding: SPACING.base, backgroundColor: theme.colors.bgCard,
      borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
    },
    menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    menuLabel: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, color: theme.colors.textPrimary },
    menuDesc: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary, marginTop: 2 },
    logoutBtn: {
      margin: SPACING.base, borderRadius: RADIUS.xl, padding: SPACING.base,
      backgroundColor: theme.colors.redBg, borderWidth: 1, borderColor: theme.colors.red,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    },
    logoutText: { fontFamily: FONTS.body.semibold, color: theme.colors.error, fontSize: TYPE_SCALE.base },
    verifiedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.green, marginLeft: 6 },
  });

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Card */}
        <View style={s.heroCard}>
          <LinearGradient colors={theme.gradients.card as any} style={s.heroInner}>
            <View style={s.avatar}>
              <Ionicons name="person" size={40} color={theme.colors.primary} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={s.name}>{user?.name}</Text>
              {user?.isPhoneVerified && <View style={s.verifiedDot} />}
            </View>
            <Text style={s.email}>{user?.email}</Text>
            <View style={s.planBadge}>
              <Text style={s.planText}>{(user?.subscription?.plan || 'FREE').toUpperCase()} MEMBER</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { val: user?.totalBookings || 0, label: 'Bookings' },
            { val: user?.loyaltyPoints || 0, label: 'Points' },
            { val: (user?.totalSpent || 0).toLocaleString(), label: 'AED Spent' },
          ].map((stat, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statVal}>{stat.val}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={s.menuSection}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={[s.menuItem, i === menuItems.length - 1 && { borderBottomWidth: 0 }]} onPress={item.onPress}>
              <View style={s.menuIcon}><Ionicons name={item.icon as any} size={18} color={theme.colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', color: theme.colors.textTertiary, fontFamily: FONTS.body.light, fontSize: TYPE_SCALE.xs, marginBottom: SPACING.md }}>
          Park & Launch v1.0.0 • © 2025 All Rights Reserved
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================
// THEME SELECTOR SCREEN
// ============================================================
export const ThemeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: RootState) => s.ui.theme);
  const theme = THEMES[themeId] || THEMES.deep_ocean;

  const themeOptions = [
    {
      id: 'deep_ocean', name: 'Deep Ocean', desc: 'Classic nautical luxury',
      preview: ['#020B18', '#071929', '#C9A84C'],
      tag: 'DARK · GOLD',
    },
    {
      id: 'pearl_harbor', name: 'Pearl Harbor', desc: 'Champagne light elegance',
      preview: ['#F5F2EC', '#EDE9E0', '#8B6914'],
      tag: 'LIGHT · CHAMPAGNE',
    },
    {
      id: 'midnight_marina', name: 'Midnight Marina', desc: 'Ultra-modern cyan noir',
      preview: ['#000000', '#0A0A0A', '#00D4FF'],
      tag: 'DARK · ELECTRIC',
    },
  ];

  const handleSelect = async (id: string) => {
    dispatch(uiActions.setTheme(id));
    dispatch(authActions.setTheme(id));
    try { await userAPI.updateTheme(id); } catch (e) {}
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, paddingTop: SPACING.md, gap: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, letterSpacing: 1 },
    card: {
      margin: SPACING.base, marginBottom: 0, borderRadius: RADIUS.xl,
      overflow: 'hidden', borderWidth: 2,
    },
    previewBar: { height: 6, flexDirection: 'row' },
    cardBody: { padding: SPACING.lg },
    themeTag: {
      alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4,
      borderWidth: 1, marginBottom: SPACING.sm,
    },
    themeName: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg },
    themeDesc: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, marginTop: 4 },
    checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md },
    checkCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>App Theme</Text>
      </View>

      {themeOptions.map(opt => {
        const isActive = opt.id === themeId;
        const t = THEMES[opt.id as keyof typeof THEMES];
        return (
          <TouchableOpacity key={opt.id} style={[s.card, { borderColor: isActive ? t.colors.primary : t.colors.border, backgroundColor: t.colors.bgCard }]} onPress={() => handleSelect(opt.id)}>
            <View style={s.previewBar}>
              {opt.preview.map((c, i) => <View key={i} style={{ flex: 1, backgroundColor: c }} />)}
            </View>
            <View style={s.cardBody}>
              <View style={[s.themeTag, { backgroundColor: t.colors.primaryGlow, borderColor: t.colors.primary }]}>
                <Text style={{ fontFamily: FONTS.body.bold, color: t.colors.primary, fontSize: TYPE_SCALE.xs }}>{opt.tag}</Text>
              </View>
              <Text style={[s.themeName, { color: t.colors.textPrimary }]}>{opt.name}</Text>
              <Text style={[s.themeDesc, { color: t.colors.textSecondary }]}>{opt.desc}</Text>
              <View style={s.checkRow}>
                <Text style={{ fontFamily: FONTS.body.regular, color: t.colors.textTertiary, fontSize: TYPE_SCALE.xs }}>Tap to apply</Text>
                <View style={[s.checkCircle, { backgroundColor: isActive ? t.colors.primary : t.colors.bgElevated }]}>
                  {isActive && <Ionicons name="checkmark" size={16} color={t.colors.textInverse} />}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
};

// ============================================================
// NOTIFICATIONS SCREEN
// ============================================================
export const NotificationsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: RootState) => s.ui.theme);
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const { notifications, unreadCount } = useSelector((s: RootState) => s.notifications);

  const notifIcon: Record<string, string> = {
    booking_confirmed: 'checkmark-circle', booking_expiring: 'alert-circle',
    delivery_started: 'car', delivery_arrived: 'flag',
    charter_confirmed: 'boat', payment_received: 'card',
    weather_alert: 'thunderstorm', boat_parked_1month: 'time',
    camera_alert: 'videocam', promotion: 'pricetag',
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base, paddingTop: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, letterSpacing: 1 },
    clearBtn: { fontFamily: FONTS.body.medium, color: theme.colors.primary, fontSize: TYPE_SCALE.sm },
    item: {
      flexDirection: 'row', alignItems: 'flex-start',
      padding: SPACING.base, borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
    },
    iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    notifTitle: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, flex: 1 },
    notifMsg: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 16 },
    time: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textTertiary, marginTop: 4 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginTop: 4, marginLeft: 4 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, marginTop: SPACING.md },
  });

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity>
            <Text style={s.clearBtn}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="notifications-outline" size={60} color={theme.colors.textTertiary} />
          <Text style={s.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        notifications.map((notif: any, i: number) => (
          <TouchableOpacity key={i} style={[s.item, !notif.isRead && { backgroundColor: theme.colors.primaryGlow }]}>
            <View style={[s.iconWrap, { backgroundColor: notif.isRead ? theme.colors.bgElevated : theme.colors.bgCard }]}>
              <Ionicons name={(notifIcon[notif.type] || 'information-circle') as any} size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.notifTitle, { color: theme.colors.textPrimary }]}>{notif.title}</Text>
              <Text style={s.notifMsg}>{notif.message}</Text>
              <Text style={s.time}>{timeAgo(notif.createdAt)}</Text>
            </View>
            {!notif.isRead && <View style={s.unreadDot} />}
          </TouchableOpacity>
        ))
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;
