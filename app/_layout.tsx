import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import GoogleOAuthRoot from '@/components/auth/GoogleOAuthRoot';
import WebAppSetup from '@/components/pwa/WebAppSetup';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QuoteDraftProvider } from '@/contexts/QuoteDraftContext';
import { AppLaunchScreen } from '@/components/ui/LoadingStates';

function AuthenticatedNavigator() {
  const { state, user } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();
  const route = segments[0];
  const tab = segments[1];
  const isPublicCatalog = route === '(tabs)' && tab === 'productos';

  useEffect(() => {
    if (state === 'loading') return;
    if (state === 'unauthenticated' && route !== 'login' && !isPublicCatalog) {
      router.replace('/(tabs)/productos');
    }
    if ((state === 'pending' || state === 'blocked') && route !== 'acceso-pendiente') router.replace('/acceso-pendiente');
    const isNonAdminAccountRoute = route === '(tabs)' && tab === 'perfil';
    // La ruta inicial de Tabs (Cotizaciones) no agrega un segundo segmento:
    // useSegments() devuelve solo ['(tabs)'] y `tab` queda undefined.
    const sellerRoutes = ['', 'index', 'productos', 'consultas', 'perfil'];
    if (state === 'authenticated' && user?.rol === 'vendedor' && route === '(tabs)' && !sellerRoutes.includes(tab || '')) {
      router.replace('/(tabs)/productos');
    } else if (state === 'authenticated' && !['admin', 'vendedor'].includes(user?.rol || '') && route === '(tabs)' && tab !== 'productos' && !isNonAdminAccountRoute) {
      router.replace('/(tabs)/productos');
    }
    if (state === 'authenticated' && (route === 'login' || route === 'acceso-pendiente')) {
      router.replace(user?.rol === 'admin' ? '/(tabs)' : '/(tabs)/productos');
    }
  }, [isPublicCatalog, route, router, state, tab, user]);

  // El catálogo es público: no debe quedar bloqueado por la validación remota
  // de una sesión guardada cuando el backend está iniciándose.
  if (state === 'loading' && !isPublicCatalog) {
    return <AppLaunchScreen />;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="acceso-pendiente" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf') });
  if (!loaded) return <AppLaunchScreen />;

  return (
    <>
      <Head>
        <title>Hogar Conectado</title>
        <meta name="description" content="Catálogo y operación comercial de Hogar Conectado" />
        <meta name="theme-color" content="#9BA8FF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hogar Conectado" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/pwa-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/pwa-icon.png" />
      </Head>
      <WebAppSetup />
      <GoogleOAuthRoot>
        <AuthProvider>
          <QuoteDraftProvider>
            <AuthenticatedNavigator />
          </QuoteDraftProvider>
        </AuthProvider>
      </GoogleOAuthRoot>
    </>
  );
}
