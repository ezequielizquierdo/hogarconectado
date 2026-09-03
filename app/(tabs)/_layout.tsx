import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { DesktopTabBar } from "@/components/navigation/DesktopTabBar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { DesktopHeaderProvider } from "@/contexts/DesktopHeaderContext";
import { ConsultasProvider, useConsultasResumen } from "@/contexts/ConsultasContext";

function ConsultasTabIcon({ color }: { color: string }) {
  const { nuevas } = useConsultasResumen();
  return (
    <View>
      <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />
      {nuevas > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{nuevas > 9 ? "9+" : nuevas}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { state, user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isAdmin = user?.rol === "admin";
  const isSeller = user?.rol === "vendedor";
  const isAuthenticated = state === "authenticated";
  const showUsersInNavigation = isAdmin && isDesktop;

  return (
    <DesktopHeaderProvider>
      <ConsultasProvider>
      <Tabs
      tabBar={(props) =>
        isDesktop ? (
          <DesktopTabBar
            {...props}
            isAdmin={isAdmin}
            isSeller={isSeller}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <BottomTabBar {...props} />
        )
      }
      screenOptions={{
        tabBarActiveTintColor: COLORS.primaryDark,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarActiveBackgroundColor: COLORS.cardBackground,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarItemStyle: {
          minHeight: Platform.OS === "android" ? 48 : 44,
          borderRadius: RADIUS.sm,
          marginHorizontal: 2,
          marginVertical: SPACING.xs,
        },
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          web: isDesktop
            ? undefined
            : {
                height: 68,
                paddingTop: SPACING.xs,
                paddingBottom: SPACING.xs,
                backgroundColor: COLORS.surface,
                borderTopColor: COLORS.border,
              },
          default: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
          },
        }),
        sceneStyle: isDesktop
          ? { paddingTop: 72, backgroundColor: COLORS.background }
          : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: isAdmin || isSeller ? undefined : null,
          title: "Cotizaciones",
          tabBarLabel: isDesktop ? "Cotizaciones" : "Cotizar",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore_new"
        options={{
          href: null,
          title: "Consulta Stock",
          tabBarLabel: isDesktop ? "Consulta Stock" : "Stock",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="doc.text.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          title: "Productos",
          tabBarLabel: "Productos",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cube.box.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore_clean"
        options={{
          href: null,
          title: "Contacto",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculadora"
        options={{
          href: isAdmin ? undefined : null,
          title: "Calculadora",
          tabBarLabel: isDesktop ? "Calculadora" : "Calcular",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="percent" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultas"
        options={{
          href: isAdmin || isSeller ? undefined : null,
          title: "Consultas",
          tabBarLabel: "Consultas",
          tabBarIcon: ({ color }) => <ConsultasTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="usuarios"
        options={{
          title: "Usuarios",
          href: showUsersInNavigation ? undefined : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.2.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          href: isAuthenticated ? undefined : null,
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.crop.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Esto oculta la tab pero mantiene la ruta
        }}
      />
      </Tabs>
      </ConsultasProvider>
    </DesktopHeaderProvider>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error,
  },
  badgeText: { color: COLORS.ink, fontSize: 9, fontWeight: "800" },
});
