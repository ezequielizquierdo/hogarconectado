import React from "react";
import { View, StyleSheet, Platform, StatusBar } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
}

export default function MobileHeader({ title, subtitle }: MobileHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      {/* Imagen de fondo */}
      <Image
        source={require("../assets/images/background-hogar.jpeg")}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      {/* Contenido del header */}
      <View style={styles.headerContent}>
        {/* Logo con círculo contenedor */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require("../assets/images/logo-transparent-circle.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </View>

        {/* Información de la sección */}
        <View style={styles.sectionInfo}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={styles.sectionSubtitle}>{subtitle}</ThemedText>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    height: Platform.OS === "ios" ? 120 : 100, // Más altura en iOS para el notch
    overflow: "hidden",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === "ios" ? 50 : 30, // Safe area para notch
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  logo: {
    width: 40,
    height: 40,
  },
  sectionInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    ...(Platform.OS === "web"
      ? {
          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
        }
      : {
          textShadowColor: "rgba(0, 0, 0, 0.5)",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }),
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    ...(Platform.OS === "web"
      ? {
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
        }
      : {
          textShadowColor: "rgba(0, 0, 0, 0.5)",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }),
    opacity: 0.9,
  },
});
