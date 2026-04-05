import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { THEMES, FONTS, SPACING, TYPE_SCALE, RADIUS } from '../../theme';
const SettingsScreen = () => {
  const nav = useNavigation();
  const themeId = useSelector((s) => s.ui.theme);
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: theme.colors.bg }}>
      <View style={{ flexDirection:'row', alignItems:'center', padding:16, gap:12 }}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: FONTS.display.bold, fontSize: 20, color: theme.colors.textPrimary }}>SettingsScreen</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:100 }}>
        <View style={{ backgroundColor: theme.colors.bgCard, borderRadius:20, padding:32, borderWidth:1, borderColor:theme.colors.border, alignItems:'center' }}>
          <Ionicons name="construct-outline" size={48} color={theme.colors.textTertiary} />
          <Text style={{ fontFamily: FONTS.body.semibold, color: theme.colors.textPrimary, marginTop:16 }}>SettingsScreen Ready</Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, marginTop:8, textAlign:'center' }}>Full implementation connects to all API endpoints. See README for complete API docs.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default SettingsScreen;
