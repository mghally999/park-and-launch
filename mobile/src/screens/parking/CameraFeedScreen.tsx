import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { MOCK_YARDS } from '../../api/mockData';

const CAMERAS = [
  { id: 'JAY_01', label: 'Main Entrance', icon: 'home', streamId: 'ysz-CNkcdOU' },
  { id: 'JAY_02', label: 'Row A — Your Boat', icon: 'boat', streamId: 'ysz-CNkcdOU', isBoat: true },
  { id: 'JAY_03', label: 'Row B Storage', icon: 'grid', streamId: 'ysz-CNkcdOU' },
  { id: 'JAY_04', label: 'Security Gate', icon: 'shield-checkmark', streamId: 'ysz-CNkcdOU' },
];

export default function CameraFeedScreen() {
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const [selected, setSelected] = useState(CAMERAS[1]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, gap: SPACING.md, backgroundColor: 'rgba(0,0,0,0.8)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 54 },
    headerTitle: { fontFamily: FONTS.display.bold, color: '#fff', fontSize: TYPE_SCALE.base, flex: 1 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EF4444', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
    liveText: { fontFamily: FONTS.body.bold, color: '#fff', fontSize: 10 },
    videoContainer: { height: 280, backgroundColor: '#000', marginTop: 88 },
    camInfo: { padding: SPACING.base, backgroundColor: 'rgba(0,0,0,0.9)' },
    camName: { fontFamily: FONTS.display.bold, color: '#fff', fontSize: TYPE_SCALE.lg },
    camSub: { fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.6)', fontSize: TYPE_SCALE.sm, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
    stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
    statVal: { fontFamily: FONTS.body.bold, color: '#fff', fontSize: TYPE_SCALE.sm },
    statLabel: { fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },
    camList: { padding: SPACING.base },
    camListTitle: { fontFamily: FONTS.body.bold, color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 1.5, marginBottom: SPACING.md, textTransform: 'uppercase' },
    camBtn: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.xl, marginBottom: SPACING.sm, borderWidth: 1, gap: SPACING.md },
    camBtnLabel: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.sm, flex: 1 },
    boatTagWrap: { backgroundColor: theme.colors.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: theme.colors.primary },
    boatTag: { fontFamily: FONTS.body.bold, color: theme.colors.primary, fontSize: 9 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={s.headerTitle}>Live Camera — Jebel Ali</Text>
        <View style={s.liveBadge}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} /><Text style={s.liveText}>LIVE</Text></View>
      </View>

      <View style={s.videoContainer}>
        <WebView
          source={{ uri: `https://www.youtube.com/embed/${selected.streamId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${selected.streamId}` }}
          style={{ flex: 1 }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      <ScrollView style={{ backgroundColor: '#000' }} showsVerticalScrollIndicator={false}>
        <View style={s.camInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={s.camName}>{selected.label}</Text>
              <Text style={s.camSub}>Camera {selected.id} · 1080p HD</Text>
            </View>
            {selected.isBoat && <View style={s.boatTagWrap}><Text style={s.boatTag}>⚓ YOUR BOAT SPOT</Text></View>}
          </View>
          <View style={s.statsRow}>
            {[
              { val: '24/7', label: 'Monitoring' },
              { val: '1080p', label: 'Resolution' },
              { val: '< 3s', label: 'Latency' },
              { val: '30 days', label: 'Recording' },
            ].map((st, i) => (
              <View key={i} style={s.stat}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.camList}>
          <Text style={s.camListTitle}>All Cameras — Jebel Ali Marine Yard</Text>
          {CAMERAS.map(cam => (
            <TouchableOpacity key={cam.id} style={[s.camBtn, { backgroundColor: selected.id === cam.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)', borderColor: selected.id === cam.id ? theme.colors.primary : 'rgba(255,255,255,0.1)' }]} onPress={() => setSelected(cam)}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: selected.id === cam.id ? theme.colors.primaryGlow : 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={cam.icon as any} size={16} color={selected.id === cam.id ? theme.colors.primary : 'rgba(255,255,255,0.5)'} />
              </View>
              <Text style={[s.camBtnLabel, { color: selected.id === cam.id ? '#fff' : 'rgba(255,255,255,0.6)' }]}>{cam.label}</Text>
              {cam.isBoat && <View style={s.boatTagWrap}><Text style={s.boatTag}>YOUR BOAT</Text></View>}
              {selected.id === cam.id && <Ionicons name="play-circle" size={20} color={theme.colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ margin: SPACING.base, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', marginBottom: 80 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={{ fontFamily: FONTS.body.bold, color: '#10B981', fontSize: TYPE_SCALE.sm }}>Security Status: All Clear</Text>
          </View>
          <Text style={{ fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.5)', fontSize: TYPE_SCALE.xs }}>Last security sweep: {new Date().toLocaleTimeString()} · No incidents detected · Armed guard on duty</Text>
        </View>
      </ScrollView>
    </View>
  );
}
