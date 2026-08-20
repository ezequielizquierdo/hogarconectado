import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import GoogleOAuthRoot from '@/components/auth/GoogleOAuthRoot';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

function AuthenticatedNavigator() {
  const { state } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (state === 'loading') return;
    const route = segments[0];
    if (state === 'unauthenticated' && route !== 'login') router.replace('/login');
    if ((state === 'pending' || state === 'blocked') && route !== 'acceso-pendiente') router.replace('/acceso-pendiente');
    if (state === 'authenticated' && (route === 'login' || route === 'acceso-pendiente')) router.replace('/(tabs)');
  }, [router, segments, state]);

  if (state === 'loading') {
    return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="acceso-pendiente" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf') });
  if (!loaded) return null;

  return (
    <GoogleOAuthRoot>
      <AuthProvider>
        <AuthenticatedNavigator />
      </AuthProvider>
    </GoogleOAuthRoot>
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
