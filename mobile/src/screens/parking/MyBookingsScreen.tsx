import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { MOCK_BOOKINGS } from '../../api/mockData';

export default function MyBookingsScreen() {
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;

  const STATUS_COLOR: any = { active: theme.colors.green, expired: theme.colors.textTertiary, cancelled: theme.colors.error, pending_payment: theme.colors.amber };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, paddingTop: SPACING.md, gap: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary },
    card: { marginHorizontal: SPACING.base, marginBottom: SPACING.md, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
    cardBody: { padding: SPACING.base },
    ref: { fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.base, color: theme.colors.primary, letterSpacing: 1 },
    yardName: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg, color: theme.colors.textPrimary, marginTop: 4 },
    area: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 2 },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
    infoCell: { backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.md, padding: SPACING.sm, minWidth: '45%', flex: 1 },
    infoCellLabel: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    infoCellVal: { fontFamily: FONTS.body.semibold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.sm, marginTop: 2 },
    daysLeft: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.xl, marginTop: SPACING.md },
    daysLabel: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs },
    progressBar: { height: 6, backgroundColor: theme.colors.bgElevated, borderRadius: 3, marginTop: SPACING.sm, overflow: 'hidden' },
    statusBadge: { alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 4, marginTop: SPACING.sm },
    actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.divider },
    actionBtn: { flex: 1, padding: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
    actionText: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={s.title}>My Bookings</Text>
      </View>
      <FlatList
        data={MOCK_BOOKINGS}
        keyExtractor={i => i._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: 100 }}
        renderItem={({ item: b }) => {
          const totalDays = Math.round((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24));
          const elapsed = totalDays - b.daysRemaining;
          const progress = (elapsed / totalDays) * 100;
          const statusColor = STATUS_COLOR[b.status] || theme.colors.textSecondary;
          return (
            <View style={s.card}>
              <View style={s.cardBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={s.ref}>{b.bookingRef}</Text>
                  <View style={[s.statusBadge, { backgroundColor: statusColor + '20', borderWidth: 1, borderColor: statusColor }]}>
                    <Text style={{ fontFamily: FONTS.body.bold, color: statusColor, fontSize: 10 }}>{b.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={s.yardName}>{b.yard.name}</Text>
                <Text style={s.area}>{b.yard.area}, {b.yard.emirate}</Text>
                <View style={s.infoGrid}>
                  {[
                    ['Spot', b.spotNumber],
                    ['Plan', b.planType.toUpperCase()],
                    ['Boat', b.boat.name],
                    ['Length', `${b.boat.dimensions.lengthFt}ft`],
                    ['Monthly Rate', `${b.pricing.ratePerFootPerMonth || 20} AED/ft`],
                    ['Total Paid', `${b.pricing.grandTotal.toLocaleString()} AED`],
                  ].map(([label, val]) => (
                    <View key={label} style={s.infoCell}>
                      <Text style={s.infoCellLabel}>{label}</Text>
                      <Text style={s.infoCellVal}>{val}</Text>
                    </View>
                  ))}
                </View>
                {b.status === 'active' && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: SPACING.md }}>
                      <Text style={s.daysLeft}>{b.daysRemaining}</Text>
                      <Text style={s.daysLabel}>days remaining</Text>
                    </View>
                    <View style={s.progressBar}>
                      <View style={{ width: `${progress}%`, height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 }} />
                    </View>
                    <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10, marginTop: 4 }}>
                      {new Date(b.startDate).toLocaleDateString('en-AE')} → {new Date(b.endDate).toLocaleDateString('en-AE')}
                    </Text>
                  </>
                )}
              </View>
              <View style={s.actionsRow}>
                <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('CameraFeed', { bookingId: b._id })}>
                  <Ionicons name="videocam" size={16} color={theme.colors.primary} />
                  <Text style={[s.actionText, { color: theme.colors.primary }]}>Live Camera</Text>
                </TouchableOpacity>
                <View style={{ width: 1, backgroundColor: theme.colors.divider }} />
                <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('DeliverySchedule', { bookingId: b._id })}>
                  <Ionicons name="navigate" size={16} color={theme.colors.accent} />
                  <Text style={[s.actionText, { color: theme.colors.accent }]}>Deliver Boat</Text>
                </TouchableOpacity>
                <View style={{ width: 1, backgroundColor: theme.colors.divider }} />
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons name="refresh" size={16} color={theme.colors.green} />
                  <Text style={[s.actionText, { color: theme.colors.green }]}>Renew</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Ionicons name="location-outline" size={60} color={theme.colors.textTertiary} />
            <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, marginTop: 12 }}>No bookings yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
