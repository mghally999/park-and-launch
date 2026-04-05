import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { appActions } from '../../store';
import { FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';

const { width, height } = Dimensions.get('window');

const MODES = [
  {
    id: 'user',
    label: 'Boat Owner',
    subtitle: 'Park, deliver & charter your vessel',
    icon: 'boat' as const,
    color: '#C9A84C',
    features: ['Find dry parking yards', 'Schedule boat delivery', 'Book charter trips', 'Marine shop access'],
  },
  {
    id: 'captain',
    label: 'Captain',
    subtitle: 'Offer charter services & trips',
    icon: 'navigate' as const,
    color: '#1A7DB5',
    features: ['Accept charter bookings', 'Manage your vessel', 'Track earnings', 'GPS trip sharing'],
  },
  {
    id: 'admin',
    label: 'Yard Manager',
    subtitle: 'Manage parking yards & operations',
    icon: 'shield-checkmark' as const,
    color: '#10B981',
    features: ['Manage parking spots', 'View all bookings', 'Assign deliveries', 'Analytics dashboard'],
  },
];

export default function ModeSelectScreen() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = (modeId: string, name: string) => {
    dispatch(appActions.setMode({ mode: modeId, userName: name }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#020B18', '#071929', '#0D2137']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Ionicons name="location" size={28} color="#C9A84C" />
        </View>
        <Text style={styles.brand}>PARK & LAUNCH</Text>
        <Text style={styles.tagline}>UAE's Marine Super App</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Choose your mode</Text>

        {MODES.map(mode => (
          <TouchableOpacity
            key={mode.id}
            style={[styles.card, selected === mode.id && { borderColor: mode.color, borderWidth: 2 }]}
            onPress={() => setSelected(selected === mode.id ? null : mode.id)}
            activeOpacity={0.85}
          >
            {/* Card header */}
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: mode.color + '20' }]}>
                <Ionicons name={mode.icon} size={28} color={mode.color} />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.modeLabel}>{mode.label}</Text>
                <Text style={styles.modeSub}>{mode.subtitle}</Text>
              </View>
              <View style={[styles.radio, selected === mode.id && { backgroundColor: mode.color, borderColor: mode.color }]}>
                {selected === mode.id && <Ionicons name="checkmark" size={14} color="#020B18" />}
              </View>
            </View>

            {/* Features - show when selected */}
            {selected === mode.id && (
              <View style={styles.features}>
                {mode.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={14} color={mode.color} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.continueBtn, { backgroundColor: mode.color }]}
                  onPress={() => handleContinue(mode.id, mode.label)}
                >
                  <Text style={styles.continueBtnText}>CONTINUE AS {mode.label.toUpperCase()}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#020B18" />
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Guest Button */}
        <TouchableOpacity
          style={styles.guestBtn}
          onPress={() => handleContinue('guest', 'Guest')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-outline" size={20} color="#94A3B8" />
          <View style={{ marginLeft: SPACING.md }}>
            <Text style={styles.guestLabel}>Continue as Guest</Text>
            <Text style={styles.guestSub}>Browse without an account</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#4A6480" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Info note */}
        <Text style={styles.note}>You can switch modes anytime from your profile</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020B18' },
  header: { alignItems: 'center', paddingTop: 70, paddingBottom: SPACING.xl },
  logoWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201,168,76,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', marginBottom: SPACING.md },
  brand: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: '#F0EDE5', letterSpacing: 3 },
  tagline: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: '#94A3B8', marginTop: 4 },
  scroll: { paddingHorizontal: SPACING.base, paddingBottom: 50 },
  sectionTitle: { fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.sm, color: '#94A3B8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: SPACING.md, textAlign: 'center' },
  card: { backgroundColor: '#071929', borderRadius: RADIUS.xl, marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(201,168,76,0.1)', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  modeLabel: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.md, color: '#F0EDE5' },
  modeSub: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: '#94A3B8', marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#4A6480', alignItems: 'center', justifyContent: 'center' },
  features: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.base, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: SPACING.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureText: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, color: '#94A3B8' },
  continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: RADIUS.full, paddingVertical: 12, marginTop: SPACING.md },
  continueBtnText: { fontFamily: FONTS.body.bold, fontSize: TYPE_SCALE.sm, color: '#020B18', letterSpacing: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginVertical: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dividerText: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: '#4A6480' },
  guestBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#071929', borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  guestLabel: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.base, color: '#F0EDE5' },
  guestSub: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: '#94A3B8', marginTop: 2 },
  note: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: '#4A6480', textAlign: 'center', marginTop: SPACING.xl },
});
