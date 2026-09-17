import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import GoogleOAuthRoot from '@/components/auth/GoogleOAuthRoot';
import WebAppSetup from '@/components/pwa/WebAppSetup';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QuoteDraftProvider } from '@/contexts/QuoteDraftContext';
import { AppLaunchScreen } from '@/components/ui/LoadingStates';

function AuthenticatedNavigator() {
  const { state, user } = useAuth();
  const segments = useSegments() as string[];
  const rootNavigationState = useRootNavigationState();
  const router = useRouter();
  const route = segments[0];
  const tab = segments[1];
  const isPublicCatalog = route === '(tabs)' && tab === 'productos';
  const isPublicHome = route === '(tabs)' && !tab;
  const isPublicQuote = route === 'cotizacion';
  const isPublicOnboarding = route === 'sumate';

  useEffect(() => {
    // Expo Router no permite navegar hasta que el Stack raíz tenga una key.
    // Esperar este punto evita el error al ingresar directamente en `/`.
    if (!rootNavigationState?.key) return;
    let target: Href | null = null;

    if (state !== 'loading') {
      if (state === 'unauthenticated' && route !== 'login' && !isPublicHome && !isPublicCatalog && !isPublicQuote && !isPublicOnboarding) {
        target = '/(tabs)/productos';
      } else if ((state === 'pending' || state === 'blocked') && route !== 'acceso-pendiente') {
        target = '/acceso-pendiente';
      } else {
        const isNonAdminAccountRoute = route === '(tabs)' && tab === 'perfil';
        // La ruta inicial de Tabs (Cotizaciones) no agrega un segundo segmento:
        // useSegments() devuelve solo ['(tabs)'] y `tab` queda undefined.
        const sellerRoutes = ['', 'index', 'productos', 'consultas', 'metricas', 'perfil'];
        if (state === 'authenticated' && user?.rol === 'vendedor' && route === '(tabs)' && !sellerRoutes.includes(tab || '')) {
          target = '/(tabs)/productos';
        } else if (state === 'authenticated' && !['admin', 'vendedor'].includes(user?.rol || '') && route === '(tabs)' && tab !== 'productos' && !isNonAdminAccountRoute) {
          target = '/(tabs)/productos';
        } else if (state === 'authenticated' && (route === 'login' || route === 'acceso-pendiente')) {
          target = user?.rol === 'admin' ? '/(tabs)' : '/(tabs)/productos';
        }
      }
    }

    if (!target) return;
    // La key confirma que el contenedor existe; diferir un ciclo permite que su
    // referencia termine de enlazarse antes de emitir la navegación.
    const timer = setTimeout(() => router.replace(target), 0);
    return () => clearTimeout(timer);
  }, [isPublicCatalog, isPublicHome, isPublicOnboarding, isPublicQuote, rootNavigationState?.key, route, router, state, tab, user]);

  const showLaunchOverlay = state === 'loading' && !isPublicHome && !isPublicCatalog && !isPublicQuote && !isPublicOnboarding;

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="acceso-pendiente" options={{ headerShown: false }} />
        <Stack.Screen name="cotizacion" options={{ headerShown: false }} />
        <Stack.Screen name="sumate" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {showLaunchOverlay ? (
        <View style={styles.launchOverlay} pointerEvents="auto">
          <AppLaunchScreen />
        </View>
      ) : null}
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  launchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({ SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf') });
  // En la exportación estática la fuente ya está disponible al generar el HTML,
  // mientras que el navegador puede informarla como pendiente en su primer
  // render. No cambiar todo el árbol web por esa diferencia evita que React
  // descarte la hidratación; el navegador aplica la fuente cuando termina.
  if (!loaded && Platform.OS !== 'web') return <AppLaunchScreen />;

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
        <style>{`@keyframes hc-launch-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
