import { configureStore, createSlice } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null as any, accessToken: null as string | null, isAuthenticated: false, isLoading: false, error: null as string | null },
  reducers: {
    setCredentials: (s, a) => { s.user = a.payload.user; s.accessToken = a.payload.accessToken; s.isAuthenticated = true; s.error = null; },
    updateUser: (s, a) => { s.user = { ...s.user, ...a.payload }; },
    setToken: (s, a) => { s.accessToken = a.payload; },
    setTheme: (s, a) => { if (s.user) s.user.theme = a.payload; },
    logout: (s) => { s.user = null; s.accessToken = null; s.isAuthenticated = false; },
    setLoading: (s, a) => { s.isLoading = a.payload; },
    setError: (s, a) => { s.error = a.payload; },
  },
});

const parkingSlice = createSlice({
  name: 'parking',
  initialState: { yards: [] as any[], selectedYard: null as any, myBookings: [] as any[], activeBooking: null as any, priceCalculation: null as any, filters: { emirate: '', maxPrice: null as any, minSpots: 1, sortBy: '-rating' }, isLoading: false, error: null as any },
  reducers: {
    setYards: (s, a) => { s.yards = a.payload; },
    setSelectedYard: (s, a) => { s.selectedYard = a.payload; },
    setMyBookings: (s, a) => { s.myBookings = a.payload; },
    setActiveBooking: (s, a) => { s.activeBooking = a.payload; },
    setPriceCalculation: (s, a) => { s.priceCalculation = a.payload; },
    setFilters: (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    setParkingLoading: (s, a) => { s.isLoading = a.payload; },
    setParkingError: (s, a) => { s.error = a.payload; },
    cancelBookingLocal: (s, a) => { s.myBookings = s.myBookings.map((b: any) => b._id === a.payload ? { ...b, status: 'cancelled' } : b); },
  },
});

const boatsSlice = createSlice({
  name: 'boats',
  initialState: { boats: [] as any[], selectedBoat: null as any, isLoading: false },
  reducers: {
    setBoats: (s, a) => { s.boats = a.payload; },
    addBoat: (s, a) => { s.boats.unshift(a.payload); },
    updateBoat: (s, a) => { const i = s.boats.findIndex((b: any) => b._id === a.payload._id); if (i !== -1) s.boats[i] = a.payload; },
    removeBoat: (s, a) => { s.boats = s.boats.filter((b: any) => b._id !== a.payload); },
    setSelectedBoat: (s, a) => { s.selectedBoat = a.payload; },
    setBoatsLoading: (s, a) => { s.isLoading = a.payload; },
  },
});

const charterSlice = createSlice({
  name: 'charter',
  initialState: { captains: [] as any[], packages: [] as any[], myBookings: [] as any[], activeCharter: null as any, liveLocation: null as any, isLoading: false },
  reducers: {
    setCaptains: (s, a) => { s.captains = a.payload; },
    setPackages: (s, a) => { s.packages = a.payload; },
    setCharterBookings: (s, a) => { s.myBookings = a.payload; },
    setActiveCharter: (s, a) => { s.activeCharter = a.payload; },
    updateCharterLocation: (s, a) => { s.liveLocation = a.payload; },
    setCharterLoading: (s, a) => { s.isLoading = a.payload; },
  },
});

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: { products: [] as any[], categories: [] as any[], cart: [] as any[], orders: [] as any[], searchQuery: '', selectedCategory: '', isLoading: false },
  reducers: {
    setProducts: (s, a) => { s.products = a.payload; },
    setCategories: (s, a) => { s.categories = a.payload; },
    addToCart: (s, a) => { const ex = s.cart.find((i: any) => i.product._id === a.payload.product._id); if (ex) (ex as any).quantity += 1; else s.cart.push({ ...a.payload, quantity: 1 }); },
    removeFromCart: (s, a) => { s.cart = s.cart.filter((i: any) => i.product._id !== a.payload); },
    updateCartQuantity: (s, a) => { const item = s.cart.find((i: any) => i.product._id === a.payload.productId); if (item) (item as any).quantity = a.payload.quantity; },
    clearCart: (s) => { s.cart = []; },
    setOrders: (s, a) => { s.orders = a.payload; },
    setSearchQuery: (s, a) => { s.searchQuery = a.payload; },
    setSelectedCategory: (s, a) => { s.selectedCategory = a.payload; },
    setMarketplaceLoading: (s, a) => { s.isLoading = a.payload; },
  },
});

const deliverySlice = createSlice({
  name: 'delivery',
  initialState: { deliveries: [] as any[], activeDelivery: null as any, driverLocation: null as any, marinas: [] as any[], isLoading: false },
  reducers: {
    setDeliveries: (s, a) => { s.deliveries = a.payload; },
    setActiveDelivery: (s, a) => { s.activeDelivery = a.payload; },
    updateDriverLocation: (s, a) => { s.driverLocation = a.payload; },
    setMarinas: (s, a) => { s.marinas = a.payload; },
    updateDeliveryStatus: (s, a) => { if ((s.activeDelivery as any)?._id === a.payload.deliveryId) (s.activeDelivery as any).status = a.payload.status; },
    setDeliveryLoading: (s, a) => { s.isLoading = a.payload; },
  },
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { notifications: [] as any[], unreadCount: 0 },
  reducers: {
    setNotifications: (s, a) => { s.notifications = a.payload; },
    prependNotification: (s, a) => { s.notifications.unshift(a.payload); s.unreadCount += 1; },
    setUnreadCount: (s, a) => { s.unreadCount = a.payload; },
    markAllRead: (s) => { s.notifications = s.notifications.map(n => ({ ...n, isRead: true })); s.unreadCount = 0; },
  },
});

const uiSlice = createSlice({
  name: 'ui',
  initialState: { theme: 'deep_ocean', isFirstLaunch: true, weatherData: null as any, tidesData: null as any },
  reducers: {
    setTheme: (s, a) => { s.theme = a.payload; },
    setFirstLaunch: (s, a) => { s.isFirstLaunch = a.payload; },
    setWeatherData: (s, a) => { s.weatherData = a.payload; },
    setTidesData: (s, a) => { s.tidesData = a.payload; },
  },
});

const rootReducer = combineReducers({ auth: authSlice.reducer, parking: parkingSlice.reducer, boats: boatsSlice.reducer, charter: charterSlice.reducer, marketplace: marketplaceSlice.reducer, delivery: deliverySlice.reducer, notifications: notificationsSlice.reducer, ui: uiSlice.reducer });
const persistConfig = { key: 'root', storage: AsyncStorage, whitelist: ['auth', 'ui'] };

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (g) => g({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } }),
});
export const persistor = persistStore(store);
export const authActions = authSlice.actions;
export const parkingActions = parkingSlice.actions;
export const boatsActions = boatsSlice.actions;
export const charterActions = charterSlice.actions;
export const marketplaceActions = marketplaceSlice.actions;
export const deliveryActions = deliverySlice.actions;
export const notificationsActions = notificationsSlice.actions;
export const uiActions = uiSlice.actions;
// keep appActions stub so existing imports don't break
export const appActions = { setMode: () => ({}), clearMode: () => ({}) } as any;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
