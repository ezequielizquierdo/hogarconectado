import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";

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
          {/* Logo y marca a la izquierda */}
          {/* <View style={styles.brandContainer}> */}
          <View style={styles.logoContainer}>
            {/* <View style={styles.logoCircle}> */}
            <Image
              source={require("@/assets/images/logotipo.png")}
              style={styles.logoImage}
              contentFit="contain"
            />
            {/* </View> */}
          </View>
          {/* <Text style={styles.brandText}>hogar conectado</Text> */}
          {/* </View> */}

          {/* Información de la sección a la derecha */}
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    marginRight: SPACING.md,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
        }
      : {
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }),
    elevation: 5,
  },
  logoImage: {
    width: 30,
    height: 40,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
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
  sectionContainer: {
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
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
    color: "#E0E0E0",
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
