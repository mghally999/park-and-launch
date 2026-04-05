import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { THEMES, FONTS, SPACING, TYPE_SCALE } from '../../theme';
const EquipmentScreen = () => {
  const nav = useNavigation();
  const themeId = useSelector((s) => s.ui.theme);
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: theme.colors.bg }}>
      <View style={{ flexDirection:'row', alignItems:'center', padding:16, gap:12 }}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: FONTS.display.bold, fontSize: 20, color: theme.colors.textPrimary }}>EquipmentScreen</Text>
      </View>
    </SafeAreaView>
  );
};
export default EquipmentScreen;
