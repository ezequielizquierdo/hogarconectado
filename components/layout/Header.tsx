import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/constants/theme";

interface HeaderProps {
  sectionTitle: string;
  sectionSubtitle: string;
  variant?: "image" | "solid";
}

export default function Header({
  sectionTitle,
  sectionSubtitle,
  variant = "image",
}: HeaderProps) {
  const isSolid = variant === "solid";

  return (
    <View style={[styles.headerContainer, isSolid && styles.headerContainerSolid]}>
      <View style={styles.headerBackground} data-testid="header-background">
        {!isSolid && (
          <Image
            source={require("@/assets/images/background-hogar.jpeg")}
            style={styles.backgroundImage}
            contentFit="cover"
            data-testid="header-background-image"
          />
        )}
        <View style={[styles.headerOverlay, isSolid && styles.headerOverlaySolid]}>
          <View style={[styles.logoCircle, isSolid && styles.logoCircleSolid]}>
            <Image
              source={require("@/assets/images/logo-transparent-circle.png")}
              style={styles.logoImage}
              contentFit="contain"
              accessibilityLabel="Logo de Hogar Conectado"
            />
          </View>
          <View style={styles.sectionContainer}>
            <ThemedText
              style={[styles.sectionTitle, isSolid && styles.sectionTitleSolid]}
            >
              {sectionTitle}
            </ThemedText>
            <Text
              style={[
                styles.sectionSubtitle,
                isSolid && styles.sectionSubtitleSolid,
              ]}
            >
              {sectionSubtitle}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 120, // Reducido de 200px a 120px
    width: "100%",
  },
  headerContainerSolid: {
    height: 88,
  },
  headerBackground: {
    flex: 1,
    position: "relative",
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
  headerOverlay: {
    flex: 1,
    backgroundColor: COLORS.heroOverlay,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
  },
  headerOverlaySolid: {
    backgroundColor: COLORS.primary,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  logoCircleSolid: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  sectionContainer: {
    alignItems: "flex-end",
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.heroText,
    ...(Platform.OS === "web"
      ? {
          textShadow: "-1px 1px 10px rgba(0, 0, 0, 0.75)",
        }
      : {
          textShadowColor: "rgba(0, 0, 0, 0.75)",
          textShadowOffset: { width: -1, height: 1 },
          textShadowRadius: 10,
        }),
  },
  sectionTitleSolid: {
    color: COLORS.ink,
    ...(Platform.OS === "web"
      ? { textShadow: "none" }
      : { textShadowColor: "transparent", textShadowRadius: 0 }),
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.heroTextMuted,
    marginTop: 4,
    ...(Platform.OS === "web"
      ? {
          textShadow: "-1px 1px 10px rgba(0, 0, 0, 0.75)",
        }
      : {
          textShadowColor: "rgba(0, 0, 0, 0.75)",
          textShadowOffset: { width: -1, height: 1 },
          textShadowRadius: 10,
        }),
  },
  sectionSubtitleSolid: {
    color: COLORS.text,
    ...(Platform.OS === "web"
      ? { textShadow: "none" }
      : { textShadowColor: "transparent", textShadowRadius: 0 }),
  },
});
