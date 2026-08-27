import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SPACING, SHADOWS, TYPOGRAPHY } from "@/constants/theme";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  variant?: "image" | "solid";
}

export default function MobileHeader({
  title,
  subtitle,
  variant = "image",
}: MobileHeaderProps) {
  const isSolid = variant === "solid";

  return (
    <View style={[styles.headerContainer, isSolid && styles.headerContainerSolid]}>
      {/* Imagen de fondo */}
      {!isSolid && (
        <Image
          source={require("../assets/images/background-hogar.jpeg")}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      )}

      {/* Contenido del header */}
      <View style={[styles.headerContent, isSolid && styles.headerContentSolid]}>
        {/* El recurso ya incluye su identidad circular. */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, isSolid && styles.logoDirect]}>
            <Image
              source={require("../assets/images/logo-transparent-circle.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </View>

        {/* Información de la sección */}
        <View style={styles.sectionInfo}>
          <ThemedText
            style={[styles.sectionTitle, isSolid && styles.sectionTitleSolid]}
          >
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText
              style={[
                styles.sectionSubtitle,
                isSolid && styles.sectionSubtitleSolid,
              ]}
            >
              {subtitle}
            </ThemedText>
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
  headerContainerSolid: {
    height: Platform.OS === "ios" ? 104 : 84,
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
    backgroundColor: COLORS.heroOverlay,
  },
  headerContentSolid: {
    backgroundColor: "#f3f4ff",
    paddingTop: Platform.OS === "ios" ? 42 : SPACING.md,
    paddingBottom: SPACING.sm,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlay,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  logoDirect: {
    width: 48,
    height: 48,
    backgroundColor: "transparent",
    borderWidth: 0,
    boxShadow: "none",
    elevation: 0,
  },
  logo: {
    width: 46,
    height: 46,
  },
  sectionInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.heroText,
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
  sectionTitleSolid: {
    color: COLORS.ink,
    ...(Platform.OS === "web"
      ? { textShadow: "none" }
      : { textShadowColor: "transparent", textShadowRadius: 0 }),
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.heroTextMuted,
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
  sectionSubtitleSolid: {
    color: COLORS.text,
    ...(Platform.OS === "web"
      ? { textShadow: "none" }
      : { textShadowColor: "transparent", textShadowRadius: 0 }),
    opacity: 1,
  },
});
