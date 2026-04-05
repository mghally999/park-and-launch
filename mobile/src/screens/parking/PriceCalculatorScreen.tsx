import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';

const YARDS_RATES = [
  { name: 'Jebel Ali Marine Yard', rate: 20, area: 'Jebel Ali' },
  { name: 'Ras Al Khor Dry Yard', rate: 22, area: 'Ras Al Khor' },
  { name: 'Dubai Marina Dry Dock', rate: 28, area: 'Dubai Marina' },
  { name: 'Palm Jumeirah Elite', rate: 30, area: 'Palm Jumeirah' },
  { name: 'Sharjah Marine Hub', rate: 15, area: 'Sharjah' },
];
const COMPETITOR = { name: 'Dubai Creek Yacht Club', rate: 67 };

export default function PriceCalculatorScreen() {
  const navigation = useNavigation<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const [length, setLength] = useState('33');
  const [plan, setPlan] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const ft = parseFloat(length) || 0;
  const multiplier = plan === 'monthly' ? 1 : plan === 'quarterly' ? 3 : 12;
  const discount = plan === 'monthly' ? 0 : plan === 'quarterly' ? 5 : 15;

  const calc = (rate: number) => {
    const base = ft * rate * multiplier;
    const disc = base * discount / 100;
    const after = base - disc;
    const tax = after * 0.05;
    return { base, disc, after, total: Math.round(after + tax) };
  };

  const compResult = calc(COMPETITOR.rate);
  const bestYard = YARDS_RATES[0];
  const bestResult = calc(bestYard.rate);
  const savings = compResult.total - bestResult.total;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, gap: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, flex: 1 },
    inputCard: { margin: SPACING.base, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border },
    label: { fontFamily: FONTS.body.medium, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
    ftInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: theme.colors.borderStrong, paddingHorizontal: SPACING.md, height: 56 },
    ftTextInput: { flex: 1, color: theme.colors.textPrimary, fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['2xl'], textAlign: 'center' },
    ftUnit: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm },
    planRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
    planBtn: { flex: 1, padding: 10, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center' },
    savingsHero: { margin: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden' },
    savingsAmt: { fontFamily: FONTS.display.bold, color: '#fff', fontSize: TYPE_SCALE['4xl'], marginTop: SPACING.sm },
    yardCard: { marginHorizontal: SPACING.base, marginBottom: SPACING.sm, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border },
    yardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    yardName: { fontFamily: FONTS.body.semibold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.sm, flex: 1 },
    yardPrice: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.xl },
    yardRate: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10 },
    compCard: { marginHorizontal: SPACING.base, marginBottom: SPACING.sm, backgroundColor: theme.colors.redBg, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.red + '40' },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={s.title}>Price Calculator</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={s.inputCard}>
          <Text style={s.label}>Your Boat Length</Text>
          <View style={s.ftInput}>
            <TouchableOpacity onPress={() => setLength(l => String(Math.max(10, (parseFloat(l)||0) - 1)))} style={{ padding: 8 }}><Ionicons name="remove-circle" size={26} color={theme.colors.primary} /></TouchableOpacity>
            <TextInput style={s.ftTextInput} value={length} onChangeText={v => setLength(v.replace(/[^0-9.]/g, ''))} keyboardType="numeric" />
            <Text style={s.ftUnit}>ft</Text>
            <TouchableOpacity onPress={() => setLength(l => String((parseFloat(l)||0) + 1))} style={{ padding: 8 }}><Ionicons name="add-circle" size={26} color={theme.colors.primary} /></TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', marginTop: SPACING.sm, gap: 6 }}>
            {[20, 30, 40, 50, 60].map(f => (
              <TouchableOpacity key={f} style={{ flex: 1, backgroundColor: parseFloat(length) === f ? theme.colors.primary : theme.colors.bgElevated, borderRadius: RADIUS.full, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: parseFloat(length) === f ? theme.colors.primary : theme.colors.border }} onPress={() => setLength(String(f))}>
                <Text style={{ fontFamily: FONTS.body.bold, color: parseFloat(length) === f ? '#020B18' : theme.colors.textSecondary, fontSize: 11 }}>{f}ft</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.label, { marginTop: SPACING.md }]}>Plan</Text>
          <View style={s.planRow}>
            {[['monthly', 'Monthly'], ['quarterly', 'Quarterly -5%'], ['annual', 'Annual -15%']].map(([id, label]) => (
              <TouchableOpacity key={id} style={[s.planBtn, { backgroundColor: plan === id ? theme.colors.primary : theme.colors.bgElevated, borderColor: plan === id ? theme.colors.primary : theme.colors.border }]} onPress={() => setPlan(id as any)}>
                <Text style={{ fontFamily: FONTS.body.semibold, color: plan === id ? '#020B18' : theme.colors.textSecondary, fontSize: 10 }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {ft > 0 && (
          <>
            <View style={s.savingsHero}>
              <LinearGradient colors={['#047857', '#065F46']} style={{ padding: SPACING.xl }}>
                <Text style={{ fontFamily: FONTS.body.bold, color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 2 }}>YOUR SAVINGS vs DUBAI CREEK YACHT CLUB</Text>
                <Text style={s.savingsAmt}>{savings.toLocaleString()} AED</Text>
                <Text style={{ fontFamily: FONTS.body.regular, color: 'rgba(255,255,255,0.7)', fontSize: TYPE_SCALE.sm, marginTop: 4 }}>
                  per {plan === 'monthly' ? 'month' : plan === 'quarterly' ? 'quarter' : 'year'} on a {ft}ft boat
                </Text>
                <Text style={{ fontFamily: FONTS.body.bold, color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 8 }}>
                  {Math.round((savings / compResult.total) * 100)}% cheaper than premium wet berthing
                </Text>
              </LinearGradient>
            </View>

            <Text style={[s.label, { marginHorizontal: SPACING.base, marginTop: SPACING.md, marginBottom: SPACING.sm }]}>Park & Launch Yards</Text>
            {YARDS_RATES.map(y => {
              const r = calc(y.rate);
              return (
                <View key={y.name} style={s.yardCard}>
                  <View style={s.yardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.yardName}>{y.name}</Text>
                      <Text style={s.yardRate}>{y.rate} AED/ft/month · {y.area}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.yardPrice}>{r.total.toLocaleString()}</Text>
                      <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10 }}>AED/{plan === 'monthly' ? 'mo' : plan === 'quarterly' ? 'qtr' : 'yr'} +VAT</Text>
                    </View>
                  </View>
                  {discount > 0 && <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.green, fontSize: 10, marginTop: 4 }}>💚 Saving {Math.round(r.disc).toLocaleString()} AED with {plan} plan</Text>}
                </View>
              );
            })}

            <Text style={[s.label, { marginHorizontal: SPACING.base, marginTop: SPACING.md, marginBottom: SPACING.sm }]}>Market Comparison</Text>
            <View style={s.compCard}>
              <View style={s.yardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.yardName, { color: theme.colors.error }]}>Dubai Creek Golf & Yacht Club</Text>
                  <Text style={s.yardRate}>67 AED/ft/month · Wet Berth</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.yardPrice, { color: theme.colors.error }]}>{compResult.total.toLocaleString()}</Text>
                  <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10 }}>AED/mo +VAT</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
