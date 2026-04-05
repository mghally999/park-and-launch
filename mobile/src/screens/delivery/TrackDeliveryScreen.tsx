import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, AnimatedRegion } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

import { RootState, deliveryActions } from '../../store';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { deliveryAPI } from '../../api/client';
import { useSocket } from '../../hooks/useSocket';

const STATUS_STEPS = [
  { key: 'scheduled', label: 'Scheduled', icon: 'calendar' },
  { key: 'driver_assigned', label: 'Driver Assigned', icon: 'person' },
  { key: 'en_route_to_yard', label: 'En Route to Yard', icon: 'car' },
  { key: 'at_yard', label: 'At Yard', icon: 'location' },
  { key: 'loading', label: 'Loading Boat', icon: 'boat' },
  { key: 'in_transit', label: 'In Transit', icon: 'navigate' },
  { key: 'approaching_destination', label: 'Almost There', icon: 'flag' },
  { key: 'arrived', label: 'Arrived', icon: 'checkmark-circle' },
  { key: 'completed', label: 'Completed', icon: 'trophy' },
];

const TrackDeliveryScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { deliveryId } = route.params || {};

  const themeId = useSelector((s: RootState) => s.ui.theme);
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const activeDelivery = useSelector((s: RootState) => s.delivery.activeDelivery);
  const driverLocation = useSelector((s: RootState) => s.delivery.driverLocation);
  const { joinDeliveryRoom, leaveDeliveryRoom } = useSocket();

  const mapRef = useRef<MapView>(null);
  const pulseAnim = useSharedValue(1);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    pulseAnim.value = withRepeat(withTiming(1.3, { duration: 800 }), -1, true);
  }, []);

  useEffect(() => {
    if (deliveryId) {
      fetchDelivery();
      joinDeliveryRoom(deliveryId);
    }
    return () => { if (deliveryId) leaveDeliveryRoom(deliveryId); };
  }, [deliveryId]);

  // Animate map to follow driver
  useEffect(() => {
    if (driverLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: driverLocation.lat,
        longitude: driverLocation.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  }, [driverLocation]);

  const fetchDelivery = async () => {
    try {
      const { data } = await deliveryAPI.track(deliveryId);
      dispatch(deliveryActions.setActiveDelivery(data.data));
      if (data.data.currentLocation) {
        dispatch(deliveryActions.updateDriverLocation({
          lat: data.data.currentLocation.lat,
          lng: data.data.currentLocation.lng,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: 2 - pulseAnim.value,
  }));

  const delivery = activeDelivery;
  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === delivery?.status);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    map: { height: 320 },
    headerOverlay: {
      position: 'absolute', top: 0, left: 0, right: 0,
      flexDirection: 'row', alignItems: 'center',
      padding: SPACING.base, paddingTop: SPACING.xl,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.md, color: '#fff', marginLeft: SPACING.md },
    content: { flex: 1 },
    refRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
      borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
    },
    refText: { fontFamily: FONTS.body.medium, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm },
    refCode: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.base, letterSpacing: 1 },
    statusCard: {
      margin: SPACING.base, borderRadius: RADIUS.xl,
      backgroundColor: theme.colors.bgCard, padding: SPACING.base,
      borderWidth: 1, borderColor: theme.colors.border,
      ...theme.shadows.md,
    },
    statusLabel: { fontFamily: FONTS.body.semibold, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm },
    statusValue: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.lg, color: theme.colors.primary },
    timelineContainer: { padding: SPACING.base },
    timelineTitle: { fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.sm, color: theme.colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.md },
    timelineStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
    stepIcon: {
      width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
      marginRight: SPACING.md,
    },
    stepLine: { position: 'absolute', left: 15, top: 32, width: 2, height: SPACING.lg + SPACING.md },
    stepLabel: { fontFamily: FONTS.body.medium, fontSize: TYPE_SCALE.sm, paddingTop: 6 },
    driverCard: {
      margin: SPACING.base, borderRadius: RADIUS.xl,
      backgroundColor: theme.colors.bgCard, padding: SPACING.base,
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1, borderColor: theme.colors.border,
    },
    driverAvatar: {
      width: 52, height: 52, borderRadius: 26,
      backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: theme.colors.primary,
    },
    driverInfo: { flex: 1, marginLeft: SPACING.md },
    driverName: { fontFamily: FONTS.body.semibold, fontSize: TYPE_SCALE.md, color: theme.colors.textPrimary },
    driverRole: { fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.xs, color: theme.colors.textSecondary, marginTop: 2 },
    callBtn: {
      backgroundColor: theme.colors.primary, borderRadius: RADIUS.full,
      paddingHorizontal: SPACING.md, paddingVertical: 8,
    },
    callBtnText: { fontFamily: FONTS.body.semibold, color: theme.colors.textInverse, fontSize: TYPE_SCALE.sm },
  });

  if (loading) return (
    <SafeAreaView style={s.container}>
      <ActivityIndicator color={theme.colors.primary} style={{ flex: 1 }} />
    </SafeAreaView>
  );

  const driverCoord = driverLocation
    ? { latitude: driverLocation.lat, longitude: driverLocation.lng }
    : null;

  const originCoord = delivery?.origin?.location?.coordinates
    ? { latitude: delivery.origin.location.coordinates[1], longitude: delivery.origin.location.coordinates[0] }
    : { latitude: 25.2048, longitude: 55.2708 };

  const destCoord = delivery?.destination?.location?.coordinates
    ? { latitude: delivery.destination.location.coordinates[1], longitude: delivery.destination.location.coordinates[0] }
    : { latitude: 25.1127, longitude: 55.1178 };

  return (
    <View style={s.container}>
      {/* MAP */}
      <View style={{ height: 320 }}>
        <MapView
          ref={mapRef}
          style={s.map}
          initialRegion={{ ...originCoord, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
          customMapStyle={theme.dark ? darkMapStyle : []}
        >
          {/* Origin */}
          <Marker coordinate={originCoord} title={delivery?.origin?.name || 'Yard'} pinColor={theme.colors.accent} />
          {/* Destination */}
          <Marker coordinate={destCoord} title={delivery?.destination?.name || 'Marina'} pinColor={theme.colors.primary} />
          {/* Route line */}
          <Polyline coordinates={[originCoord, destCoord]} strokeColor={theme.colors.primary} strokeWidth={2} lineDashPattern={[8, 4]} />
          {/* Driver (animated) */}
          {driverCoord && (
            <Marker coordinate={driverCoord} title="Driver">
              <View style={{ alignItems: 'center' }}>
                <Animated.View style={[{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primaryGlow }, pulseStyle]} />
                <View style={{ position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
                  <Ionicons name="boat" size={18} color="#fff" />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        {/* Header overlay */}
        <View style={s.headerOverlay}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Track Delivery</Text>
        </View>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Ref & Status */}
        <View style={s.refRow}>
          <View>
            <Text style={s.refText}>Delivery Reference</Text>
            <Text style={s.refCode}>{delivery?.deliveryRef || 'DLV---'}</Text>
          </View>
          <View style={[s.stepIcon, { backgroundColor: theme.colors.greenBg, width: 'auto', paddingHorizontal: 12 }]}>
            <Text style={{ fontFamily: FONTS.body.semibold, color: theme.colors.green, fontSize: TYPE_SCALE.xs }}>
              {delivery?.status?.replace(/_/g, ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Status Message */}
        <View style={s.statusCard}>
          <Text style={s.statusLabel}>Current Status</Text>
          <Text style={s.statusValue}>{STATUS_STEPS[currentStepIdx]?.label || '—'}</Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.sm, marginTop: 4 }}>
            {delivery?.destination?.name ? `Heading to ${delivery.destination.name}` : ''}
          </Text>
        </View>

        {/* Driver Card */}
        {delivery?.driver && (
          <View style={s.driverCard}>
            <View style={s.driverAvatar}>
              <Ionicons name="person" size={24} color={theme.colors.primary} />
            </View>
            <View style={s.driverInfo}>
              <Text style={s.driverName}>{delivery.driver.name}</Text>
              <Text style={s.driverRole}>Certified Marine Transport Driver</Text>
            </View>
            <TouchableOpacity style={s.callBtn} onPress={() => delivery.driver.phone && Linking.openURL(`tel:${delivery.driver.phone}`)}>
              <Text style={s.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline */}
        <View style={s.timelineContainer}>
          <Text style={s.timelineTitle}>Delivery Timeline</Text>
          {STATUS_STEPS.map((step, idx) => {
            const done = idx < currentStepIdx;
            const active = idx === currentStepIdx;
            return (
              <View key={step.key} style={s.timelineStep}>
                <View style={[s.stepIcon, {
                  backgroundColor: done ? theme.colors.greenBg : active ? theme.colors.primaryGlow : theme.colors.bgElevated,
                  borderWidth: active ? 2 : 0,
                  borderColor: theme.colors.primary,
                }]}>
                  <Ionicons
                    name={(done ? 'checkmark' : step.icon) as any}
                    size={14}
                    color={done ? theme.colors.green : active ? theme.colors.primary : theme.colors.textTertiary}
                  />
                </View>
                {idx < STATUS_STEPS.length - 1 && (
                  <View style={[s.stepLine, { backgroundColor: done ? theme.colors.green : theme.colors.divider }]} />
                )}
                <Text style={[s.stepLabel, { color: done ? theme.colors.textPrimary : active ? theme.colors.primary : theme.colors.textTertiary }]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0D2137' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#020B18' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#04101C' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A3A5C' }] },
];

export default TrackDeliveryScreen;
