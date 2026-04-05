import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';

const CAPTAIN_LOCATIONS = [
  { lat: 25.0900, lng: 55.1300 },
  { lat: 25.0700, lng: 55.1100 },
  { lat: 25.1000, lng: 55.1500 },
  { lat: 25.0800, lng: 55.1600 },
];

export default function BookCharterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const { captain, package: pkg } = route.params || {};

  const [stage, setStage] = useState<'confirm' | 'searching' | 'found' | 'tracking'>('confirm');
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(12);
  const [captainPos, setCaptainPos] = useState({ lat: 25.0900, lng: 55.1300 });
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const youCoord = { latitude: 25.0774, longitude: 55.1404 };

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (stage === 'searching') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(interval); setStage('found'); return 100; }
          return p + 8;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'tracking') {
      const interval = setInterval(() => {
        setCaptainPos(pos => ({
          lat: pos.lat + (youCoord.latitude - pos.lat) * 0.05,
          lng: pos.lng + (youCoord.longitude - pos.lng) * 0.05,
        }));
        setEta(e => Math.max(1, e - 1));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const capName = captain?.name || 'Captain Ahmed Al Mazrouei';
  const price = captain?.availableBoats?.[0]?.charter?.pricePerHour || 450;
  const vessel = captain?.captainProfile?.vessel?.name || 'Arabian Pearl';

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    map: { height: 320 },
    backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1 },
    confirmCard: { margin: SPACING.base, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border },
    confirmTitle: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg, color: theme.colors.textPrimary, marginBottom: SPACING.md },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
    infoLabel: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm },
    infoVal: { fontFamily: FONTS.body.semibold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.sm },
    requestBtn: { margin: SPACING.base, borderRadius: RADIUS.full, overflow: 'hidden', ...theme.shadows.gold },
    requestInner: { paddingVertical: SPACING.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    requestText: { fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.base, letterSpacing: 1.5 },
    searchingCard: { margin: SPACING.base, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
    searchTitle: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg, color: theme.colors.textPrimary, marginTop: SPACING.md },
    searchSub: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 8, textAlign: 'center' },
    progressBar: { width: '100%', height: 4, backgroundColor: theme.colors.bgElevated, borderRadius: 2, marginTop: SPACING.xl, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 2 },
    foundCard: { margin: SPACING.base, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.green },
    capRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    capAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.primary },
    capName: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.md, color: theme.colors.textPrimary },
    capSub: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 2 },
    etaBadge: { backgroundColor: theme.colors.greenBg, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.green },
    etaText: { fontFamily: FONTS.display.bold, color: theme.colors.green, fontSize: TYPE_SCALE.base },
    etaLabel: { fontFamily: FONTS.body.regular, color: theme.colors.green, fontSize: 10 },
    trackBtn: { marginHorizontal: SPACING.base, marginBottom: SPACING.sm, borderRadius: RADIUS.full, overflow: 'hidden' },
    trackingCard: { margin: SPACING.base, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.primary },
  });

  const DARK_MAP = [
    { elementType: 'geometry', stylers: [{ color: '#0D2137' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#04101C' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A3A5C' }] },
  ];

  return (
    <View style={s.container}>
      <View style={{ height: 320 }}>
        <MapView style={s.map} initialRegion={{ latitude: 25.0850, longitude: 55.1350, latitudeDelta: 0.06, longitudeDelta: 0.06 }} customMapStyle={theme.dark ? DARK_MAP : []}>
          <Marker coordinate={youCoord} title="Your Location"><View style={{ alignItems: 'center' }}><View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.primary, borderWidth: 3, borderColor: '#fff' }} /></View></Marker>
          {stage === 'tracking' && <Marker coordinate={{ latitude: captainPos.lat, longitude: captainPos.lng }} title={capName}>
            <View style={{ alignItems: 'center' }}>
              <Animated.View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.accent + '30', position: 'absolute', transform: [{ scale: pulseAnim }] }} />
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
                <Ionicons name="boat" size={20} color="#fff" />
              </View>
            </View>
          </Marker>}
          {(stage === 'searching' || stage === 'confirm') && CAPTAIN_LOCATIONS.map((loc, i) => (
            <Marker key={i} coordinate={{ latitude: loc.lat, longitude: loc.lng }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                <Ionicons name="boat" size={16} color="#fff" />
              </View>
            </Marker>
          ))}
          {stage === 'tracking' && <Polyline coordinates={[{ latitude: captainPos.lat, longitude: captainPos.lng }, youCoord]} strokeColor={theme.colors.primary} strokeWidth={2} lineDashPattern={[6, 3]} />}
        </MapView>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {stage === 'confirm' && (
          <>
            <View style={s.confirmCard}>
              <Text style={s.confirmTitle}>{pkg ? `📋 ${pkg.title}` : `🚢 Book Captain`}</Text>
              {[
                ['Captain', capName],
                ['Vessel', vessel],
                ['Date', new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()],
                ['Departure', 'Dubai Marina Mall Marina'],
                ['Duration', '4 hours'],
                ['Rate', `${price} AED/hr`],
                ['Total (4hrs)', `${price * 4} AED + 5% VAT`],
              ].map(([label, val]) => (
                <View key={label} style={s.infoRow}>
                  <Text style={s.infoLabel}>{label}</Text>
                  <Text style={s.infoVal}>{val}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={s.requestBtn} onPress={() => setStage('searching')}>
              <LinearGradient colors={theme.gradients.gold as any} style={s.requestInner}>
                <Ionicons name="boat" size={18} color="#020B18" />
                <Text style={s.requestText}>REQUEST CAPTAIN</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {stage === 'searching' && (
          <View style={s.searchingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={s.searchTitle}>Finding your captain...</Text>
            <Text style={s.searchSub}>Connecting you with licensed UAE captains near Dubai Marina</Text>
            <View style={s.progressBar}><View style={[s.progressFill, { width: `${progress}%` }]} /></View>
            <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textTertiary, fontSize: 11, marginTop: 8 }}>{progress < 100 ? `Searching ${Math.round(progress)}%...` : 'Match found!'}</Text>
          </View>
        )}

        {stage === 'found' && (
          <>
            <View style={s.foundCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md }}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.green} />
                <Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.green, fontSize: TYPE_SCALE.sm }}>Captain confirmed!</Text>
              </View>
              <View style={s.capRow}>
                <View style={s.capAvatar}><Ionicons name="person" size={28} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.capName}>{capName}</Text>
                  <Text style={s.capSub}>{vessel} · ⭐ 4.9 · 847 trips</Text>
                  <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 11, marginTop: 4 }}>License: UAE-CAPT-2018-00234</Text>
                </View>
                <View style={s.etaBadge}>
                  <Text style={s.etaText}>12</Text>
                  <Text style={s.etaLabel}>min</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={s.trackBtn} onPress={() => setStage('tracking')}>
              <LinearGradient colors={theme.gradients.gold as any} style={{ padding: SPACING.base, alignItems: 'center', borderRadius: RADIUS.full, flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                <Ionicons name="navigate" size={16} color="#020B18" />
                <Text style={{ fontFamily: FONTS.body.bold, color: '#020B18', letterSpacing: 1 }}>TRACK CAPTAIN LIVE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {stage === 'tracking' && (
          <View style={s.trackingCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
              <Text style={{ fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.md }}>🚢 En Route to You</Text>
              <View style={s.etaBadge}><Text style={s.etaText}>{eta}</Text><Text style={s.etaLabel}>min</Text></View>
            </View>
            <View style={s.capRow}>
              <View style={[s.capAvatar, { width: 52, height: 52, borderRadius: 26 }]}><Ionicons name="person" size={24} color={theme.colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.body.semibold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.base }}>{capName}</Text>
                <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm }}>{vessel}</Text>
              </View>
              <TouchableOpacity style={{ backgroundColor: theme.colors.primary, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8 }}>
                <Text style={{ fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.sm }}>Call</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: SPACING.md, backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.md, padding: SPACING.sm }}>
              <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs }}>📍 Heading to Dubai Marina Mall Marina, Pier A</Text>
              <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, marginTop: 4 }}>🔴 Live GPS tracking active</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
