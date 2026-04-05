import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { uiActions, authActions } from '../../store';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { userAPI } from '../../api/client';

const ThemeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;

  const options = [
    { id: 'deep_ocean', name: 'Deep Ocean', desc: 'Classic nautical luxury', tag: 'DARK · GOLD', preview: ['#020B18', '#071929', '#C9A84C'] },
    { id: 'pearl_harbor', name: 'Pearl Harbor', desc: 'Champagne light elegance', tag: 'LIGHT · CHAMPAGNE', preview: ['#F5F2EC', '#EDE9E0', '#8B6914'] },
    { id: 'midnight_marina', name: 'Midnight Marina', desc: 'Ultra-modern cyan noir', tag: 'DARK · ELECTRIC', preview: ['#000000', '#0A0A0A', '#00D4FF'] },
  ];

  const handleSelect = async (id: string) => {
    dispatch(uiActions.setTheme(id));
    try { await userAPI.updateTheme(id); } catch {}
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, paddingTop: SPACING.md, gap: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary },
    card: { margin: SPACING.base, marginBottom: 0, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 2 },
    bar: { height: 8, flexDirection: 'row' },
    body: { padding: SPACING.lg },
    tagWrap: { alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, marginBottom: SPACING.sm },
    tagText: { fontSize: TYPE_SCALE.xs, fontFamily: FONTS.body.bold },
    name: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg },
    desc: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.sm, marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md },
    hint: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs },
    check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>App Theme</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {options.map(opt => {
          const t = THEMES[opt.id];
          const active = opt.id === themeId;
          return (
            <TouchableOpacity key={opt.id} style={[s.card, { backgroundColor: t.colors.bgCard, borderColor: active ? t.colors.primary : t.colors.border }]} onPress={() => handleSelect(opt.id)} activeOpacity={0.85}>
              <View style={s.bar}>
                {opt.preview.map((c, i) => <View key={i} style={{ flex: 1, backgroundColor: c }} />)}
              </View>
              <View style={s.body}>
                <View style={[s.tagWrap, { backgroundColor: t.colors.primaryGlow, borderColor: t.colors.primary }]}>
                  <Text style={[s.tagText, { color: t.colors.primary }]}>{opt.tag}</Text>
                </View>
                <Text style={[s.name, { color: t.colors.textPrimary }]}>{opt.name}</Text>
                <Text style={[s.desc, { color: t.colors.textSecondary }]}>{opt.desc}</Text>
                <View style={s.row}>
                  <Text style={[s.hint, { color: t.colors.textTertiary }]}>Tap to apply</Text>
                  <View style={[s.check, { backgroundColor: active ? t.colors.primary : t.colors.bgElevated }]}>
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

export default ThemeScreen;
