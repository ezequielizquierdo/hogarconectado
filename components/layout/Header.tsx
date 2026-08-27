import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/constants/theme";

interface HeaderProps {
  sectionTitle: string;
  sectionSubtitle: string;
}

export default function Header({ sectionTitle, sectionSubtitle }: HeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerBackground} data-testid="header-background">
        <Image
          source={require("@/assets/images/background-hogar.jpeg")}
          style={styles.backgroundImage}
          contentFit="cover"
          data-testid="header-background-image"
        />
        <View style={styles.headerOverlay}>
          <View style={styles.logoCircle}>
            <Image
              source={require("@/assets/images/logo-transparent-circle.png")}
              style={styles.logoImage}
              contentFit="contain"
              accessibilityLabel="Logo de Hogar Conectado"
            />
          </View>
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>{sectionTitle}</ThemedText>
            <Text style={styles.sectionSubtitle}>{sectionSubtitle}</Text>
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
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
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
});
