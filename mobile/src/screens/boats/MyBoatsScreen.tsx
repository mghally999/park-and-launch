import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { MOCK_BOATS } from '../../api/mockData';

export default function MyBoatsScreen() {
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;

  const STATUS_COLOR: any = { in_yard: '#10B981', in_water: '#1A7DB5', in_transit: '#F59E0B', maintenance: '#EF4444' };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, paddingTop: SPACING.md, gap: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, flex: 1 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primary, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8 },
    addBtnText: { fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.sm },
    card: { marginHorizontal: SPACING.base, marginBottom: SPACING.md, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
    cardHeader: { padding: SPACING.base },
    boatRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    boatIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    boatName: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg, color: theme.colors.textPrimary },
    boatSub: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 2 },
    reg: { fontFamily: FONTS.body.regular, color: theme.colors.textTertiary, fontSize: 10, marginTop: 2 },
    statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
    specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
    specCell: { flex: 1, minWidth: '22%', backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
    specVal: { fontFamily: FONTS.body.bold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.sm },
    specLabel: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 9, marginTop: 2 },
    actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.divider },
    actionBtn: { flex: 1, padding: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 },
    actionText: { fontFamily: FONTS.body.semibold, fontSize: 11 },
    fuelBar: { marginTop: SPACING.sm },
    fuelTrack: { height: 6, backgroundColor: theme.colors.bgElevated, borderRadius: 3, overflow: 'hidden' },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={s.title}>My Vessels</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddBoat')}>
          <Ionicons name="add" size={16} color="#020B18" />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_BOATS}
        keyExtractor={i => i._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: 100 }}
        renderItem={({ item: boat }) => {
          const sc = STATUS_COLOR[boat.status] || theme.colors.textSecondary;
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.boatRow}>
                  <View style={[s.boatIcon, { backgroundColor: sc + '20', borderWidth: 2, borderColor: sc }]}>
                    <Ionicons name="boat" size={28} color={sc} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.boatName}>{boat.name}</Text>
                    <Text style={s.boatSub}>{boat.make} {boat.model} · {boat.year}</Text>
                    <Text style={s.reg}>Reg: {boat.registrationNumber}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: sc + '20', borderColor: sc }]}>
                    <Text style={{ fontFamily: FONTS.body.bold, color: sc, fontSize: 9 }}>{boat.status.replace(/_/g, ' ').toUpperCase()}</Text>
                  </View>
                </View>

                <View style={s.specsGrid}>
                  {[
                    ['Length', `${boat.dimensions.lengthFt}ft`],
                    ['Beam', `${boat.dimensions.beamFt}ft`],
                    ['Engine', `${boat.engine.horsepower}hp`],
                    ['Engines', String(boat.engine.numberOfEngines)],
                    ['Pax', String(boat.capacity.passengers)],
                    ['Fuel Cap', `${boat.capacity.fuelLiters}L`],
                    ['Color', boat.color],
                    ['Type', boat.type.replace('_', ' ')],
                  ].map(([label, val]) => (
                    <View key={label} style={s.specCell}>
                      <Text style={s.specVal} numberOfLines={1}>{val}</Text>
                      <Text style={s.specLabel}>{label}</Text>
                    </View>
                  ))}
                </View>

                {boat.fuelLevel && (
                  <View style={s.fuelBar}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10 }}>Fuel Level</Text>
                      <Text style={{ fontFamily: FONTS.body.bold, color: boat.fuelLevel > 50 ? theme.colors.green : theme.colors.amber, fontSize: 10 }}>{boat.fuelLevel}%</Text>
                    </View>
                    <View style={s.fuelTrack}>
                      <View style={{ width: `${boat.fuelLevel}%`, height: '100%', backgroundColor: boat.fuelLevel > 50 ? theme.colors.green : theme.colors.amber, borderRadius: 3 }} />
                    </View>
                  </View>
                )}

                {(boat as any).currentParking && (
                  <View style={{ marginTop: SPACING.sm, backgroundColor: theme.colors.primaryGlow, borderRadius: RADIUS.md, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="location" size={14} color={theme.colors.primary} />
                    <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 11, flex: 1 }}>
                      Stored at {(boat as any).currentParking.yardName} · Spot {(boat as any).currentParking.spotNumber}
                    </Text>
                  </View>
                )}
              </View>

              <View style={s.actions}>
                {(boat.status === 'in_yard') && <>
                  <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('CameraFeed', { boatId: boat._id })}>
                    <Ionicons name="videocam" size={14} color={theme.colors.primary} />
                    <Text style={[s.actionText, { color: theme.colors.primary }]}>Camera</Text>
                  </TouchableOpacity>
                  <View style={{ width: 1, backgroundColor: theme.colors.divider }} />
                  <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('DeliverySchedule', { boatId: boat._id })}>
                    <Ionicons name="navigate" size={14} color={theme.colors.accent} />
                    <Text style={[s.actionText, { color: theme.colors.accent }]}>Deliver</Text>
                  </TouchableOpacity>
                  <View style={{ width: 1, backgroundColor: theme.colors.divider }} />
                </>}
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons name="create-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={[s.actionText, { color: theme.colors.textSecondary }]}>Edit</Text>
                </TouchableOpacity>
                <View style={{ width: 1, backgroundColor: theme.colors.divider }} />
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons name="document-text-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={[s.actionText, { color: theme.colors.textSecondary }]}>Docs</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
