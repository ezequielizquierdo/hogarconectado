import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, useWindowDimensions } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { DesktopTabBar } from "@/components/navigation/DesktopTabBar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const showUsersInNavigation = user?.rol === "admin" && isDesktop;

  return (
    <Tabs
      tabBar={(props) =>
        isDesktop ? (
          <DesktopTabBar {...props} showUsers={user?.rol === "admin"} />
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
          title: "Cotizaciones",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore_new"
        options={{
          title: "Consulta Stock",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="doc.text.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          title: "Productos",
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
          title: "Calculadora",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="percent" color={color} />
          ),
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
          title: "Perfil",
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
  );
}
