import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { MOCK_NOTIFICATIONS } from '../../api/mockData';

const NOTIF_ICONS: any = {
  booking_expiring: { icon: 'alert-circle', color: '#F59E0B' },
  delivery_started: { icon: 'car', color: '#1A7DB5' },
  boat_parked_1month: { icon: 'time', color: '#10B981' },
  weather_alert: { icon: 'thunderstorm', color: '#EF4444' },
  charter_confirmed: { icon: 'boat', color: '#C9A84C' },
  order_delivered: { icon: 'checkmark-circle', color: '#10B981' },
  promotion: { icon: 'pricetag', color: '#8B5CF6' },
};

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);

  const unread = notifs.filter(n => !n.isRead).length;
  const markRead = (id: string) => setNotifs(ns => ns.map(n => n._id === id ? { ...n, isRead: true } : n));
  const markAll = () => setNotifs(ns => ns.map(n => ({ ...n, isRead: true })));

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, paddingTop: SPACING.md, gap: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, flex: 1 },
    badge: { backgroundColor: theme.colors.primary, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
    badgeText: { fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.xs },
    markAll: { fontFamily: FONTS.body.medium, color: theme.colors.primary, fontSize: TYPE_SCALE.sm },
    item: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
    iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, flexShrink: 0 },
    itemTitle: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, flex: 1, lineHeight: 18 },
    itemMsg: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary, marginTop: 4, lineHeight: 16 },
    itemTime: { fontFamily: FONTS.body.regular, fontSize: 10, color: theme.colors.textTertiary, marginTop: 4 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginTop: 6, marginLeft: 4, flexShrink: 0 },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        {unread > 0 && <View style={s.badge}><Text style={s.badgeText}>{unread} new</Text></View>}
        {unread > 0 && <TouchableOpacity onPress={markAll}><Text style={s.markAll}>Mark all read</Text></TouchableOpacity>}
      </View>

      <FlatList
        data={notifs}
        keyExtractor={i => i._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item: n }) => {
          const meta = NOTIF_ICONS[n.type] || { icon: 'information-circle', color: theme.colors.primary };
          return (
            <TouchableOpacity style={[s.item, !n.isRead && { backgroundColor: theme.colors.primaryGlow }]} onPress={() => markRead(n._id)}>
              <View style={[s.iconWrap, { backgroundColor: meta.color + '20', borderWidth: 1, borderColor: meta.color + '40' }]}>
                <Ionicons name={meta.icon as any} size={22} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.itemTitle, { color: n.isRead ? theme.colors.textSecondary : theme.colors.textPrimary }]}>{n.title}</Text>
                <Text style={s.itemMsg}>{n.message}</Text>
                <Text style={s.itemTime}>{timeAgo(n.createdAt)}</Text>
              </View>
              {!n.isRead && <View style={s.unreadDot} />}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
