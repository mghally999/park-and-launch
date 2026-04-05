import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Auth screens
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main screens
import HomeScreen from '../screens/main/HomeScreen';

// Parking
import ParkingListScreen from '../screens/parking/ParkingListScreen';
import ParkingDetailScreen from '../screens/parking/ParkingDetailScreen';
import BookParkingScreen from '../screens/parking/BookParkingScreen';
import BookingDetailScreen from '../screens/parking/BookingDetailScreen';
import MyBookingsScreen from '../screens/parking/MyBookingsScreen';
import CameraFeedScreen from '../screens/parking/CameraFeedScreen';
import PriceCalculatorScreen from '../screens/parking/PriceCalculatorScreen';

// Boats
import MyBoatsScreen from '../screens/boats/MyBoatsScreen';
import AddBoatScreen from '../screens/boats/AddBoatScreen';
import BoatDetailScreen from '../screens/boats/BoatDetailScreen';

// Charter
import CharterScreen from '../screens/charter/CharterScreen';
import CaptainDetailScreen from '../screens/charter/CaptainDetailScreen';
import BookCharterScreen from '../screens/charter/BookCharterScreen';
import TrackCharterScreen from '../screens/charter/TrackCharterScreen';
import CharterHistoryScreen from '../screens/charter/CharterHistoryScreen';

// Marketplace
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import ProductDetailScreen from '../screens/marketplace/ProductDetailScreen';
import CartScreen from '../screens/marketplace/CartScreen';
import CheckoutScreen from '../screens/marketplace/CheckoutScreen';
import OrdersScreen from '../screens/marketplace/OrdersScreen';

// Delivery
import DeliveryScheduleScreen from '../screens/delivery/DeliveryScheduleScreen';
import TrackDeliveryScreen from '../screens/delivery/TrackDeliveryScreen';
import DeliveryHistoryScreen from '../screens/delivery/DeliveryHistoryScreen';

// Services
import CleaningScreen from '../screens/services/CleaningScreen';
import EquipmentScreen from '../screens/services/EquipmentScreen';

// Profile
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ThemeScreen from '../screens/profile/ThemeScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const sharedOpts = { headerShown: false, animation: 'slide_from_right' as const };

const HomeStack = () => (
  <Stack.Navigator screenOptions={sharedOpts}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="MyBoats" component={MyBoatsScreen} />
    <Stack.Screen name="AddBoat" component={AddBoatScreen} />
    <Stack.Screen name="BoatDetail" component={BoatDetailScreen} />
    <Stack.Screen name="DeliverySchedule" component={DeliveryScheduleScreen} />
    <Stack.Screen name="TrackDelivery" component={TrackDeliveryScreen} />
    <Stack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} />
    <Stack.Screen name="Cleaning" component={CleaningScreen} />
    <Stack.Screen name="Equipment" component={EquipmentScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const ParkingStack = () => (
  <Stack.Navigator screenOptions={sharedOpts}>
    <Stack.Screen name="ParkingList" component={ParkingListScreen} />
    <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} />
    <Stack.Screen name="PriceCalculator" component={PriceCalculatorScreen} />
    <Stack.Screen name="BookParking" component={BookParkingScreen} />
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
    <Stack.Screen name="CameraFeed" component={CameraFeedScreen} />
  </Stack.Navigator>
);

const CharterStack = () => (
  <Stack.Navigator screenOptions={sharedOpts}>
    <Stack.Screen name="Charter" component={CharterScreen} />
    <Stack.Screen name="CaptainDetail" component={CaptainDetailScreen} />
    <Stack.Screen name="BookCharter" component={BookCharterScreen} />
    <Stack.Screen name="TrackCharter" component={TrackCharterScreen} />
    <Stack.Screen name="CharterHistory" component={CharterHistoryScreen} />
  </Stack.Navigator>
);

const MarketplaceStack = () => (
  <Stack.Navigator screenOptions={sharedOpts}>
    <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={sharedOpts}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Theme" component={ThemeScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const TAB_ICONS: Record<string, [string, string]> = {
  HomeTab: ['compass', 'compass-outline'],
  ParkingTab: ['location', 'location-outline'],
  CharterTab: ['boat', 'boat-outline'],
  ShopTab: ['storefront', 'storefront-outline'],
  ProfileTab: ['person-circle', 'person-circle-outline'],
};

const MainTabs = ({ theme }: { theme: any }) => {
  const cartCount = useSelector((s: any) => s.marketplace?.cart?.length || 0);
  const unreadCount = useSelector((s: any) => s.notifications?.unreadCount || 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBg,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
        },
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarLabelStyle: { fontSize: 10, marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const [active, inactive] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Explore' }} />
      <Tab.Screen name="ParkingTab" component={ParkingStack} options={{ title: 'Park' }} />
      <Tab.Screen name="CharterTab" component={CharterStack} options={{ title: 'Charter' }} />
      <Tab.Screen name="ShopTab" component={MarketplaceStack} options={{
        title: 'Shop',
        tabBarBadge: cartCount > 0 ? cartCount : undefined,
        tabBarBadgeStyle: { backgroundColor: theme.colors.primary, color: theme.colors.textInverse, fontSize: 9 },
      }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{
        title: 'Me',
        tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        tabBarBadgeStyle: { backgroundColor: theme.colors.error },
      }} />
    </Tab.Navigator>
  );
};

const AuthStack = ({ theme }: { theme: any }) => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="OTP" component={OTPScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

export const AppNavigator = ({ theme }: { theme: any }) => {
  const isAuthenticated = useSelector((s: any) => s.auth?.isAuthenticated || false);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth">{() => <AuthStack theme={theme} />}</Stack.Screen>
      ) : (
        <Stack.Screen name="Main">{() => <MainTabs theme={theme} />}</Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
