import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import SplashScreen from "@/components/ui/SplashScreen";
import { warmupService } from "@/services";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [showSplash, setShowSplash] = useState(true);

  // Warm-up del backend al iniciar la app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Iniciar warm-up del backend en paralelo con la carga de fuentes
        await warmupService.warmupBackend();
      } catch (error) {
        console.log("Warm-up error (no crítico):", error);
      }
    };

    initializeApp();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />

      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      )}
    </ThemeProvider>
  );
}
