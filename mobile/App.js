import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { store, persistor } from './src/store';
import { THEMES, DEFAULT_THEME } from './src/theme';
import { AppNavigator } from './src/navigation';

LogBox.ignoreLogs([
  'Non-serializable values',
  'Sending `onAnimatedValueUpdate`',
  'Constants.manifest',
  'ViewPropTypes',
  'fontFamily',
]);

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <AppCore />
            <Toast />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

function AppCore() {
  const [ready, setReady] = useState(false);
  const themeId = useSelector((s) => s.ui?.theme) || 'deep_ocean';
  const theme = THEMES[themeId] || DEFAULT_THEME;

  useEffect(() => {
    setTimeout(() => setReady(true), 200);
  }, []);

  const onReady = useCallback(async () => {
    if (ready) { try { await SplashScreen.hideAsync(); } catch {} }
  }, [ready]);

  if (!ready) return null;

  return (
    <NavigationContainer
      onReady={onReady}
      theme={{
        dark: theme.dark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.bg,
          card: theme.colors.bgCard,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
      }}
    >
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.bg}
      />
      <AppNavigator theme={theme} />
    </NavigationContainer>
  );
}
