import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// ============================================================
// AUTH SLICE
// ============================================================
interface AuthState {
  user: any | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  } as AuthState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: any; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = { ...state.user, ...action.payload };
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      if (state.user) state.user.theme = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload; },
    setError: (state, action: PayloadAction<string | null>) => { state.error = action.payload; },
  },
});

// ============================================================
// PARKING SLICE
// ============================================================
interface ParkingState {
  yards: any[];
  selectedYard: any | null;
  myBookings: any[];
  activeBooking: any | null;
  priceCalculation: any | null;
  filters: {
    emirate: string;
    maxPrice: number | null;
    minSpots: number;
    sortBy: string;
  };
  isLoading: boolean;
  error: string | null;
}

const parkingSlice = createSlice({
  name: 'parking',
  initialState: {
    yards: [],
    selectedYard: null,
    myBookings: [],
    activeBooking: null,
    priceCalculation: null,
    filters: { emirate: '', maxPrice: null, minSpots: 1, sortBy: '-rating' },
    isLoading: false,
    error: null,
  } as ParkingState,
  reducers: {
    setYards: (state, action: PayloadAction<any[]>) => { state.yards = action.payload; },
    setSelectedYard: (state, action: PayloadAction<any>) => { state.selectedYard = action.payload; },
    setMyBookings: (state, action: PayloadAction<any[]>) => { state.myBookings = action.payload; },
    setActiveBooking: (state, action: PayloadAction<any>) => { state.activeBooking = action.payload; },
    setPriceCalculation: (state, action: PayloadAction<any>) => { state.priceCalculation = action.payload; },
    setFilters: (state, action: PayloadAction<Partial<ParkingState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setParkingLoading: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload; },
    setParkingError: (state, action: PayloadAction<string | null>) => { state.error = action.payload; },
    cancelBookingLocal: (state, action: PayloadAction<string>) => {
      state.myBookings = state.myBookings.map(b => b._id === action.payload ? { ...b, status: 'cancelled' } : b);
    },
  },
});

// ============================================================
// BOATS SLICE
// ============================================================
const boatsSlice = createSlice({
  name: 'boats',
  initialState: { boats: [] as any[], selectedBoat: null as any, isLoading: false },
  reducers: {
    setBoats: (state, action) => { state.boats = action.payload; },
    addBoat: (state, action) => { state.boats.unshift(action.payload); },
    updateBoat: (state, action) => {
      const idx = state.boats.findIndex(b => b._id === action.payload._id);
      if (idx !== -1) state.boats[idx] = action.payload;
    },
    removeBoat: (state, action) => { state.boats = state.boats.filter(b => b._id !== action.payload); },
    setSelectedBoat: (state, action) => { state.selectedBoat = action.payload; },
    setBoatsLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

// ============================================================
// CHARTER SLICE
// ============================================================
const charterSlice = createSlice({
  name: 'charter',
  initialState: {
    captains: [] as any[],
    packages: [] as any[],
    myBookings: [] as any[],
    activeCharter: null as any,
    liveLocation: null as any,
    isLoading: false,
  },
  reducers: {
    setCaptains: (state, action) => { state.captains = action.payload; },
    setPackages: (state, action) => { state.packages = action.payload; },
    setCharterBookings: (state, action) => { state.myBookings = action.payload; },
    setActiveCharter: (state, action) => { state.activeCharter = action.payload; },
    updateCharterLocation: (state, action) => { state.liveLocation = action.payload; },
    setCharterLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

// ============================================================
// MARKETPLACE SLICE
// ============================================================
const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    products: [] as any[],
    categories: [] as any[],
    cart: [] as Array<{ product: any; quantity: number; variant?: string }>,
    orders: [] as any[],
    searchQuery: '',
    selectedCategory: '',
    isLoading: false,
  },
  reducers: {
    setProducts: (state, action) => { state.products = action.payload; },
    setCategories: (state, action) => { state.categories = action.payload; },
    addToCart: (state, action) => {
      // HashMap O(1) lookup by product ID
      const existing = state.cart.find(item => item.product._id === action.payload.product._id && item.variant === action.payload.variant);
      if (existing) existing.quantity += action.payload.quantity || 1;
      else state.cart.push({ ...action.payload, quantity: action.payload.quantity || 1 });
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(item => item.product._id !== action.payload);
    },
    updateCartQuantity: (state, action) => {
      const item = state.cart.find(i => i.product._id === action.payload.productId);
      if (item) item.quantity = action.payload.quantity;
    },
    clearCart: (state) => { state.cart = []; },
    setOrders: (state, action) => { state.orders = action.payload; },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    setSelectedCategory: (state, action) => { state.selectedCategory = action.payload; },
    setMarketplaceLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

// ============================================================
// DELIVERY SLICE
// ============================================================
const deliverySlice = createSlice({
  name: 'delivery',
  initialState: {
    deliveries: [] as any[],
    activeDelivery: null as any,
    driverLocation: null as { lat: number; lng: number } | null,
    marinas: [] as any[],
    isLoading: false,
  },
  reducers: {
    setDeliveries: (state, action) => { state.deliveries = action.payload; },
    setActiveDelivery: (state, action) => { state.activeDelivery = action.payload; },
    updateDriverLocation: (state, action) => { state.driverLocation = action.payload; },
    setMarinas: (state, action) => { state.marinas = action.payload; },
    updateDeliveryStatus: (state, action) => {
      if (state.activeDelivery?._id === action.payload.deliveryId) {
        state.activeDelivery.status = action.payload.status;
      }
    },
    setDeliveryLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

// ============================================================
// NOTIFICATIONS SLICE
// ============================================================
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [] as any[],
    unreadCount: 0,
  },
  reducers: {
    setNotifications: (state, action) => { state.notifications = action.payload; },
    prependNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
    markAllRead: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
  },
});

// ============================================================
// UI SLICE
// ============================================================
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'deep_ocean' as string,
    isFirstLaunch: true,
    weatherData: null as any,
    tidesData: null as any[],
  },
  reducers: {
    setTheme: (state, action) => { state.theme = action.payload; },
    setFirstLaunch: (state, action) => { state.isFirstLaunch = action.payload; },
    setWeatherData: (state, action) => { state.weatherData = action.payload; },
    setTidesData: (state, action) => { state.tidesData = action.payload; },
  },
});

// ============================================================
// COMBINE & PERSIST
// ============================================================
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  parking: parkingSlice.reducer,
  boats: boatsSlice.reducer,
  charter: charterSlice.reducer,
  marketplace: marketplaceSlice.reducer,
  delivery: deliverySlice.reducer,
  notifications: notificationsSlice.reducer,
  ui: uiSlice.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'ui'], // Only persist auth & theme
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Export actions
export const authActions = authSlice.actions;
export const parkingActions = parkingSlice.actions;
export const boatsActions = boatsSlice.actions;
export const charterActions = charterSlice.actions;
export const marketplaceActions = marketplaceSlice.actions;
export const deliveryActions = deliverySlice.actions;
export const notificationsActions = notificationsSlice.actions;
export const uiActions = uiSlice.actions;

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
