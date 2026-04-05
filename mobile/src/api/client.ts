import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { store, authActions } from '../store';


const BASE_URL = __DEV__
  ? 'http://localhost:3001/api/v1'
  : 'https://api.parkandlaunch.ae/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0',
    'X-Platform': 'mobile',
  },
});

// Inject access token on every request
api.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    const token = (state as any).auth?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${BASE_URL.replace('/api/v1', '')}/api/v1/auth/refresh-token`, { refreshToken });
        store.dispatch(authActions.setToken(data.accessToken));
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(authActions.logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: (token: string) => api.post('/auth/refresh-token', { refreshToken: token }),
  verifyOTP: (otp: string) => api.post('/auth/verify-otp', { otp }),
  resendOTP: () => api.post('/auth/resend-otp'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
};

// PARKING
export const parkingAPI = {
  getYards: (params?: any) => api.get('/parking/yards', { params }),
  getYard: (id: string) => api.get(`/parking/yards/${id}`),
  checkAvailability: (id: string) => api.get(`/parking/yards/${id}/availability`),
  calculatePrice: (data: any) => api.post('/parking/calculate-price', data),
  createBooking: (data: any) => api.post('/parking/book', data),
  getMyBookings: (params?: any) => api.get('/parking/bookings', { params }),
  cancelBooking: (id: string, reason: string) => api.put(`/parking/bookings/${id}/cancel`, { reason }),
  getCameraFeed: (bookingId: string) => api.get(`/parking/camera/${bookingId}`),
};

// BOATS
export const boatsAPI = {
  getMyBoats: () => api.get('/boats'),
  addBoat: (data: any) => api.post('/boats', data),
  updateBoat: (id: string, data: any) => api.put(`/boats/${id}`, data),
  deleteBoat: (id: string) => api.delete(`/boats/${id}`),
  logCondition: (id: string, data: any) => api.post(`/boats/${id}/condition`, data),
};

// CHARTER
export const charterAPI = {
  getCaptains: (params?: any) => api.get('/charter/captains', { params }),
  getPackages: () => api.get('/charter/packages'),
  bookCharter: (data: any) => api.post('/charter/book', data),
  getMyCharters: (params?: any) => api.get('/charter/bookings', { params }),
  trackCharter: (id: string) => api.get(`/charter/bookings/${id}/track`),
  rateCharter: (id: string, data: any) => api.post(`/charter/bookings/${id}/rate`, data),
};

// MARKETPLACE
export const marketplaceAPI = {
  getProducts: (params?: any) => api.get('/marketplace/products', { params }),
  getCategories: () => api.get('/marketplace/categories'),
  getProduct: (id: string) => api.get(`/marketplace/products/${id}`),
  addReview: (id: string, data: any) => api.post(`/marketplace/products/${id}/review`, data),
  createOrder: (data: any) => api.post('/marketplace/orders', data),
  getMyOrders: () => api.get('/marketplace/orders'),
};

// DELIVERY
export const deliveryAPI = {
  getMarinas: () => api.get('/delivery/marinas'),
  schedule: (data: any) => api.post('/delivery/schedule', data),
  track: (id: string) => api.get(`/delivery/${id}/track`),
  getHistory: (params?: any) => api.get('/delivery/history', { params }),
};

// SERVICES
export const servicesAPI = {
  getCleaningPackages: () => api.get('/services/cleaning'),
  bookCleaning: (data: any) => api.post('/services/cleaning/book', data),
  getEquipment: () => api.get('/services/equipment'),
};

// WEATHER
export const weatherAPI = {
  getMarineWeather: (params?: any) => api.get('/weather/marine', { params }),
};

// USER
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  updateTheme: (theme: string) => api.put('/users/theme', { theme }),
  getNotifications: (params?: any) => api.get('/users/notifications', { params }),
  markNotificationRead: (id: string) => api.put(`/users/notifications/${id}/read`),
};

export default api;
