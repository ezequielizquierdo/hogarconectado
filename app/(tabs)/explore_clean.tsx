import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HelloWave } from "@/components/HelloWave";
import FadeInView from "@/components/ui/FadeInView";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

export default function ContactoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundImage={require("@/assets/images/background-hogar.jpeg")}
      headerImage={
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require("@/assets/images/logo-transparent.png")}
              style={styles.logoHeader}
              contentFit="contain"
            />
          </View>
        </View>
      }
    >
      <FadeInView delay={0}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">📞 Contacto</ThemedText>
          <HelloWave />
        </ThemedView>
      </FadeInView>

      <FadeInView delay={200}>
        <ThemedView style={styles.contentContainer}>
          <FadeInView delay={400}>
            <ThemedView style={styles.contactCard}>
              <ThemedText style={styles.contactTitle}>📱 WhatsApp</ThemedText>
              <ThemedText style={styles.contactInfo}>
                +54 9 11 XXXX-XXXX
              </ThemedText>
            </ThemedView>
          </FadeInView>

          <FadeInView delay={500}>
            <ThemedView style={styles.contactCard}>
              <ThemedText style={styles.contactTitle}>📧 Email</ThemedText>
              <ThemedText style={styles.contactInfo}>
                contacto@hogarconectado.com
              </ThemedText>
            </ThemedView>
          </FadeInView>

          <FadeInView delay={600}>
            <ThemedView style={styles.contactCard}>
              <ThemedText style={styles.contactTitle}>📍 Dirección</ThemedText>
              <ThemedText style={styles.contactInfo}>
                Buenos Aires, Argentina
              </ThemedText>
            </ThemedView>
          </FadeInView>

          <FadeInView delay={700}>
            <ThemedView style={styles.contactCard}>
              <ThemedText style={styles.contactTitle}>🕒 Horarios</ThemedText>
              <ThemedText style={styles.contactInfo}>
                Lun a Vie: 9:00 - 18:00
              </ThemedText>
              <ThemedText style={styles.contactInfo}>
                Sáb: 9:00 - 13:00
              </ThemedText>
            </ThemedView>
          </FadeInView>
        </ThemedView>
      </FadeInView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  contentContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  contactCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    ...SHADOWS.sm,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  contactInfo: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.lg,
  },
  logoHeader: {
    width: 60,
    height: 38,
  },
});
