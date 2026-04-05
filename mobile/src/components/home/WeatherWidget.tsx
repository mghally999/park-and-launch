import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';

export const WeatherWidget = ({ weather, theme }: any) => {
  if (!weather) return (
    <View style={{ margin: SPACING.base, height: 90, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm }}>Loading marine conditions...</Text>
    </View>
  );
  const safetyColors: any = { green: '#10B981', yellow: '#F59E0B', red: '#EF4444' };
  const safetyColor = safetyColors[weather.current?.safetyLevel] || '#10B981';
  return (
    <View style={{ margin: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden', backgroundColor: theme.colors.bgCard, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', padding: SPACING.base, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <Ionicons name="sunny" size={36} color={theme.colors.primary} />
          <View>
            <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['2xl'], color: theme.colors.textPrimary }}>{weather.current?.temp}°C</Text>
            <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm }}>{weather.current?.condition}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: safetyColor + '20', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: safetyColor }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: safetyColor }} />
            <Text style={{ fontFamily: FONTS.body.bold, color: safetyColor, fontSize: TYPE_SCALE.xs }}>Good</Text>
          </View>
          <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, marginTop: 4 }}>Dubai Waters</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm }}>
        {[
          { icon: 'water-outline', label: 'Waves', val: `${weather.current?.waveHeight || 0.8}m` },
          { icon: 'compass-outline', label: 'Wind', val: `${weather.current?.windSpeed || 15} kn` },
          { icon: 'thermometer-outline', label: 'Sea', val: `${weather.current?.seaTemp || 31}°C` },
          { icon: 'eye-outline', label: 'Vis', val: `${weather.current?.visibility || 10}km` },
        ].map((stat, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Ionicons name={stat.icon as any} size={14} color={theme.colors.textTertiary} />
            <Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.xs, marginTop: 2 }}>{stat.val}</Text>
            <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textTertiary, fontSize: 10 }}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const QuickActionCard = ({ icon, label, color, onPress, theme }: any) => (
  <TouchableOpacity onPress={onPress} style={{ width: '31%', aspectRatio: 1, borderRadius: RADIUS.xl, backgroundColor: theme.colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }} activeOpacity={0.75}>
    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={{ fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary, textAlign: 'center' }}>{label}</Text>
  </TouchableOpacity>
);

export const ActiveBookingBanner = ({ booking, theme, onPress }: any) => {
  if (!booking) return null;
  return (
    <TouchableOpacity onPress={onPress} style={{ margin: SPACING.base, borderRadius: RADIUS.xl, overflow: 'hidden' }}>
      <LinearGradient colors={['rgba(201,168,76,0.15)', 'rgba(201,168,76,0.05)']} style={{ padding: SPACING.base, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: RADIUS.xl }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md }}>
          <Ionicons name="location" size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.body.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.xs, letterSpacing: 1, textTransform: 'uppercase' }}>Active Parking</Text>
          <Text style={{ fontFamily: FONTS.display.regular, color: theme.colors.textPrimary, fontSize: TYPE_SCALE.md, marginTop: 2 }}>{booking.yard?.name || 'Parking Active'}</Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, marginTop: 2 }}>Ref: {booking.bookingRef}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export const BoatStatusCard = ({ boat, theme, onPress, onCamera, onDeliver }: any) => {
  const statusColors: any = { in_yard: '#10B981', in_water: '#1A7DB5', in_transit: '#F59E0B', maintenance: '#EF4444' };
  const statusColor = statusColors[boat.status] || theme.colors.textSecondary;
  return (
    <TouchableOpacity onPress={onPress} style={{ marginHorizontal: SPACING.base, marginBottom: SPACING.sm, backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border }} activeOpacity={0.85}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, borderWidth: 1.5, borderColor: statusColor }}>
            <Ionicons name="boat" size={22} color={statusColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.base, color: theme.colors.textPrimary }}>{boat.name}</Text>
            <Text style={{ fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary, marginTop: 2 }}>{boat.make} {boat.model} · {boat.dimensions?.lengthFt}ft</Text>
          </View>
        </View>
        <View style={{ backgroundColor: statusColor + '20', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: statusColor }}>
          <Text style={{ fontFamily: FONTS.body.bold, color: statusColor, fontSize: 10 }}>{boat.status?.replace(/_/g, ' ').toUpperCase()}</Text>
        </View>
      </View>
      {(boat.status === 'in_yard') && (
        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
          <TouchableOpacity onPress={onCamera} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.md, paddingVertical: 8, borderWidth: 1, borderColor: theme.colors.border }}>
            <Ionicons name="videocam" size={14} color={theme.colors.primary} />
            <Text style={{ fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs, color: theme.colors.primary }}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDeliver} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.md, paddingVertical: 8, borderWidth: 1, borderColor: theme.colors.border }}>
            <Ionicons name="navigate" size={14} color={theme.colors.accent} />
            <Text style={{ fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.xs, color: theme.colors.accent }}>Deliver</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};
