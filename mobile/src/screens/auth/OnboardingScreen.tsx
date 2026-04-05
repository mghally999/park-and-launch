import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { uiActions } from '../../store';
import { FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', icon: 'location' as const, title: 'Secure Dry Parking', subtitle: 'From 20 AED per foot', description: 'Store your vessel in secured yards across Dubai — up to 60% cheaper than marina wet berths.', accent: '#C9A84C' },
  { id: '2', icon: 'navigate' as const, title: 'Park & Launch', subtitle: 'On-demand boat delivery', description: 'Schedule your boat to be delivered to any marina. Track its journey live.', accent: '#1A7DB5' },
  { id: '3', icon: 'boat' as const, title: 'Charter on Demand', subtitle: 'Like Uber on the sea', description: 'Book licensed captains for fishing trips, sunset cruises, island hopping, and corporate charters.', accent: '#10B981' },
  { id: '4', icon: 'videocam' as const, title: '24/7 Camera Access', subtitle: 'See your boat anytime', description: 'Live CCTV feeds from your vessel\'s spot, condition photo logs, and real-time security alerts.', accent: '#C9A84C' },
];

export default function OnboardingScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [idx, setIdx] = useState(0);
  const listRef = useRef<FlatList>(null);

  const next = () => {
    if (idx < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: idx + 1, animated: true });
      setIdx(i => i + 1);
    } else {
      dispatch(uiActions.setFirstLaunch(false));
      navigation.navigate('Login');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#020B18' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#020B18', '#071929', '#020B18']} style={StyleSheet.absoluteFill} />

      <View style={{ position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' }}>
        <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.sm, color: 'rgba(201,168,76,0.5)', letterSpacing: 4 }}>PARK & LAUNCH</Text>
      </View>

      <FlatList ref={listRef} data={SLIDES} keyExtractor={s => s.id} horizontal pagingEnabled scrollEnabled={false} showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING['3xl'], paddingTop: 80 }}>
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: item.accent + '15', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl, borderWidth: 1, borderColor: item.accent + '40' }}>
              <Ionicons name={item.icon} size={52} color={item.accent} />
            </View>
            <Text style={{ fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.sm, color: item.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: SPACING.sm }}>{item.subtitle}</Text>
            <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['3xl'], color: '#F0EDE5', textAlign: 'center', letterSpacing: 1, lineHeight: 40 }}>{item.title}</Text>
            <Text style={{ fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.base, color: '#94A3B8', textAlign: 'center', lineHeight: 24, marginTop: SPACING.md }}>{item.description}</Text>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: SPACING['2xl'], paddingBottom: SPACING['3xl'] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: SPACING.xl }}>
          {SLIDES.map((_, i) => <View key={i} style={{ height: 4, borderRadius: 2, backgroundColor: i === idx ? '#C9A84C' : '#4A6480', width: i === idx ? 24 : 8 }} />)}
        </View>
        <TouchableOpacity style={{ borderRadius: RADIUS.full, overflow: 'hidden', shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }} onPress={next}>
          <LinearGradient colors={['#C9A84C', '#A8882E']} style={{ paddingVertical: SPACING.base, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.base, letterSpacing: 1.5 }}>
              {idx === SLIDES.length - 1 ? 'GET STARTED' : 'CONTINUE'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {idx < SLIDES.length - 1 && (
          <TouchableOpacity style={{ alignItems: 'center', marginTop: SPACING.md }} onPress={() => { dispatch(uiActions.setFirstLaunch(false)); navigation.navigate('Login'); }}>
            <Text style={{ fontFamily: FONTS.body.regular, color: '#4A6480', fontSize: TYPE_SCALE.sm }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
