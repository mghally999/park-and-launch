import { Platform } from 'react-native';

// System fonts only — no font files needed
export const FONTS = {
  display: {
    regular: Platform.select({ ios: 'Georgia', android: 'serif' }),
    bold: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }),
  },
  body: {
    light: Platform.select({ ios: 'Helvetica-Light', android: 'sans-serif-light' }),
    regular: Platform.select({ ios: 'Helvetica', android: 'sans-serif' }),
    medium: Platform.select({ ios: 'Helvetica', android: 'sans-serif-medium' }),
    semibold: Platform.select({ ios: 'Helvetica-Bold', android: 'sans-serif-medium' }),
    bold: Platform.select({ ios: 'Helvetica-Bold', android: 'sans-serif' }),
  },
};

export const TYPE_SCALE = {
  xs: 11, sm: 13, base: 15, md: 17, lg: 20,
  xl: 24, '2xl': 28, '3xl': 34, '4xl': 40,
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24,
  '2xl': 32, '3xl': 40, '4xl': 48, '5xl': 64,
};

export const RADIUS = { sm: 6, md: 10, lg: 14, xl: 20, '2xl': 28, full: 999 };

const deepOcean = {
  id: 'deep_ocean', name: 'Deep Ocean', dark: true,
  colors: {
    bg: '#020B18', bgCard: '#071929', bgElevated: '#0D2137', bgInput: '#0A1E30',
    primary: '#C9A84C', primaryDark: '#A8882E', primaryLight: '#E8C96A',
    primaryGlow: 'rgba(201,168,76,0.2)', accent: '#1A7DB5', accentLight: '#2A9FDE',
    textPrimary: '#F0EDE5', textSecondary: '#94A3B8', textTertiary: '#4A6480',
    textGold: '#C9A84C', textInverse: '#020B18',
    success: '#2DD4BF', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
    border: 'rgba(201,168,76,0.15)', borderStrong: 'rgba(201,168,76,0.35)',
    divider: 'rgba(255,255,255,0.06)', shadow: 'rgba(0,0,0,0.7)',
    green: '#10B981', greenBg: 'rgba(16,185,129,0.12)',
    red: '#EF4444', redBg: 'rgba(239,68,68,0.12)',
    amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.12)',
    tabBg: '#040F1A', tabActive: '#C9A84C', tabInactive: '#4A6480',
  },
  gradients: {
    hero: ['#020B18', '#071929', '#0D2137'] as string[],
    card: ['#071929', '#0D2137'] as string[],
    gold: ['#C9A84C', '#A8882E'] as string[],
    goldReverse: ['#E8C96A', '#C9A84C'] as string[],
    primary: ['#071929', '#0D3152'] as string[],
  },
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.4, shadowRadius: 3, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },
    gold: { shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  },
};

const pearlHarbor = {
  id: 'pearl_harbor', name: 'Pearl Harbor', dark: false,
  colors: {
    bg: '#F5F2EC', bgCard: '#FFFFFF', bgElevated: '#EDE9E0', bgInput: '#F0ECE3',
    primary: '#8B6914', primaryDark: '#6B4F0E', primaryLight: '#C9A84C',
    primaryGlow: 'rgba(139,105,20,0.15)', accent: '#1A5276', accentLight: '#2980B9',
    textPrimary: '#1A1614', textSecondary: '#6B5B4A', textTertiary: '#A89880',
    textGold: '#8B6914', textInverse: '#F5F2EC',
    success: '#1A7A5E', warning: '#D97706', error: '#B91C1C', info: '#1D4ED8',
    border: 'rgba(139,105,20,0.2)', borderStrong: 'rgba(139,105,20,0.4)',
    divider: 'rgba(0,0,0,0.06)', shadow: 'rgba(0,0,0,0.15)',
    green: '#047857', greenBg: 'rgba(4,120,87,0.08)',
    red: '#B91C1C', redBg: 'rgba(185,28,28,0.08)',
    amber: '#D97706', amberBg: 'rgba(217,119,6,0.08)',
    tabBg: '#FFFFFF', tabActive: '#8B6914', tabInactive: '#A89880',
  },
  gradients: {
    hero: ['#EDE9E0', '#F5F2EC', '#FAFAF8'] as string[],
    card: ['#FFFFFF', '#F5F2EC'] as string[],
    gold: ['#8B6914', '#C9A84C'] as string[],
    goldReverse: ['#C9A84C', '#8B6914'] as string[],
    primary: ['#F5F2EC', '#EDE9E0'] as string[],
  },
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
    gold: { shadowColor: '#8B6914', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  },
};

const midnightMarina = {
  id: 'midnight_marina', name: 'Midnight Marina', dark: true,
  colors: {
    bg: '#000000', bgCard: '#0A0A0A', bgElevated: '#111111', bgInput: '#0D0D0D',
    primary: '#00D4FF', primaryDark: '#009ABF', primaryLight: '#66E8FF',
    primaryGlow: 'rgba(0,212,255,0.2)', accent: '#C0C0C0', accentLight: '#E8E8E8',
    textPrimary: '#F0F0F0', textSecondary: '#808080', textTertiary: '#404040',
    textGold: '#00D4FF', textInverse: '#000000',
    success: '#00FF87', warning: '#FFB800', error: '#FF3366', info: '#00D4FF',
    border: 'rgba(0,212,255,0.1)', borderStrong: 'rgba(0,212,255,0.3)',
    divider: 'rgba(255,255,255,0.04)', shadow: 'rgba(0,0,0,0.9)',
    green: '#00FF87', greenBg: 'rgba(0,255,135,0.08)',
    red: '#FF3366', redBg: 'rgba(255,51,102,0.08)',
    amber: '#FFB800', amberBg: 'rgba(255,184,0,0.08)',
    tabBg: '#050505', tabActive: '#00D4FF', tabInactive: '#404040',
  },
  gradients: {
    hero: ['#000000', '#050505', '#0A0A0A'] as string[],
    card: ['#0A0A0A', '#111111'] as string[],
    gold: ['#00D4FF', '#009ABF'] as string[],
    goldReverse: ['#66E8FF', '#00D4FF'] as string[],
    primary: ['#0A0A0A', '#001A20'] as string[],
  },
  shadows: {
    sm: { shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    md: { shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
    lg: { shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 },
    gold: { shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  },
};

export const THEMES: Record<string, typeof deepOcean> = {
  deep_ocean: deepOcean,
  pearl_harbor: pearlHarbor as any,
  midnight_marina: midnightMarina,
};

export const DEFAULT_THEME = deepOcean;
export const getTheme = (id: string) => THEMES[id] || deepOcean;
