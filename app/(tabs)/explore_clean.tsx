import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Dimensions,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HelloWave } from "@/components/HelloWave";
import Header from "@/components/layout/Header";
import AnimatedButton from "@/components/ui/AnimatedButton";
import FadeInView from "@/components/ui/FadeInView";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

export default function ContactoScreen() {
  // Constantes para layout responsivo
  const isWeb = Platform.OS === "web";
  const { width: screenWidth } = Dimensions.get("window");
  const isWideScreen = screenWidth >= 1024;

  // Datos de contacto
  const contactData = [
    {
      icon: "📱",
      title: "WhatsApp",
      info: "+54 9 11 2345-6789",
      action: "Enviar mensaje",
      actionType: "whatsapp" as const,
    },
    {
      icon: "📧",
      title: "Email",
      info: "contacto@hogarconectado.com",
      action: "Enviar email",
      actionType: "email" as const,
    },
    {
      icon: "📍",
      title: "Dirección",
      info: "Av. Corrientes 1234, CABA\nBuenos Aires, Argentina",
      action: "Ver en mapa",
      actionType: "location" as const,
    },
    {
      icon: "🕒",
      title: "Horarios de Atención",
      info: "Lunes a Viernes: 9:00 - 18:00\nSábados: 9:00 - 13:00\nDomingos: Cerrado",
      action: "",
      actionType: "info" as const,
    },
  ];

  // Datos bancarios
  const bankingData = {
    icon: "🏦",
    title: "Datos Bancarios",
    info: "Banco Galicia\nCBU: 0070999530000012345678\nAlias: HOGAR.CONECTADO.MP",
    action: "Copiar CBU",
    actionType: "banking" as const,
  };

  const handleContactAction = async (actionType: string, info: string) => {
    switch (actionType) {
      case "whatsapp":
        const phoneNumber = info.replace(/\s/g, "").replace(/[-()]/g, "");
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        if (Platform.OS === "web") {
          window.open(whatsappUrl, "_blank");
        }
        break;

      case "email":
        const emailUrl = `mailto:${info}`;
        if (Platform.OS === "web") {
          window.open(emailUrl, "_blank");
        }
        break;

      case "location":
        const locationUrl = `https://maps.google.com/?q=Av. Corrientes 1234, CABA, Buenos Aires, Argentina`;
        if (Platform.OS === "web") {
          window.open(locationUrl, "_blank");
        }
        break;

      case "banking":
        const cbu = "0070999530000012345678";
        await Clipboard.setStringAsync(cbu);
        Alert.alert("CBU Copiado", "El CBU ha sido copiado al portapapeles");
        break;
    }
  };

  return (
    <>
      {isWeb && isWideScreen ? (
        // Layout para web
        <SafeAreaView style={styles.webLayoutFullHeight}>
          {/* Header reutilizable */}
          <Header
            sectionTitle="Contacto"
            sectionSubtitle="Información de contacto y medios de pago"
          />

          {/* Contenido principal */}
          <View style={styles.webMainContent}>
            <ScrollView
              style={styles.webContentScroll}
              contentContainerStyle={styles.webContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Grid de contactos compacto */}
              <FadeInView delay={0}>
                <ThemedView style={styles.webCompactGrid}>
                  {/* Sección de contactos en grilla 2x2 */}
                  <ThemedView style={styles.webMainSection}>
                    <ThemedText
                      type="subtitle"
                      style={styles.webSectionTitle}
                      data-testid="contact-grid"
                    >
                      📞 Información de Contacto
                    </ThemedText>

                    <ThemedView style={styles.webContactGridContainer}>
                      {contactData.map((contact, index) => (
                        <FadeInView key={index} delay={200 + index * 50}>
                          <ThemedView style={styles.webProductCard}>
                            <ThemedView style={styles.webProductCardHeader}>
                              <ThemedText style={styles.webProductIcon}>
                                {contact.icon}
                              </ThemedText>
                            </ThemedView>

                            <ThemedView style={styles.webProductCardContent}>
                              <ThemedText style={styles.webProductTitle}>
                                {contact.title}
                              </ThemedText>

                              <ThemedText style={styles.webProductInfo}>
                                {contact.info}
                              </ThemedText>

                              {contact.action && (
                                <ThemedView style={styles.webProductCardAction}>
                                  <AnimatedButton
                                    title={contact.action}
                                    onPress={() =>
                                      handleContactAction(
                                        contact.actionType,
                                        contact.info
                                      )
                                    }
                                    variant="secondary"
                                    size="small"
                                  />
                                </ThemedView>
                              )}
                            </ThemedView>
                          </ThemedView>
                        </FadeInView>
                      ))}
                    </ThemedView>
                  </ThemedView>

                  {/* Información bancaria compacta */}
                  <ThemedView style={styles.webBankingCompactSection}>
                    <ThemedText type="subtitle" style={styles.webSectionTitle}>
                      💳 Información de Pago
                    </ThemedText>

                    <FadeInView delay={600}>
                      <ThemedView style={styles.webBankingCompactCard}>
                        <ThemedView style={styles.webProductCardHeader}>
                          <ThemedText style={styles.webProductIcon}>
                            {bankingData.icon}
                          </ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.webBankingContent}>
                          <ThemedText style={styles.webProductTitle}>
                            {bankingData.title}
                          </ThemedText>

                          <ThemedText style={styles.webBankingCompactInfo}>
                            {bankingData.info}
                          </ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.webBankingActions}>
                          <AnimatedButton
                            title={bankingData.action}
                            icon="📋"
                            onPress={() =>
                              handleContactAction(
                                bankingData.actionType,
                                bankingData.info
                              )
                            }
                            variant="accent"
                            size="small"
                          />
                        </ThemedView>

                        {/* Nota informativa compacta */}
                        <ThemedView style={styles.webBankingCompactNote}>
                          <ThemedText style={styles.webBankingCompactNoteText}>
                            💡 También aceptamos MercadoPago
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </FadeInView>
                  </ThemedView>
                </ThemedView>
              </FadeInView>
            </ScrollView>
          </View>
        </SafeAreaView>
      ) : (
        // Layout móvil original
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
              {contactData.map((contact, index) => (
                <FadeInView key={index} delay={400 + index * 100}>
                  <ThemedView style={styles.contactCard}>
                    <ThemedText style={styles.contactTitle}>
                      {contact.icon} {contact.title}
                    </ThemedText>
                    <ThemedText style={styles.contactInfo}>
                      {contact.info}
                    </ThemedText>
                    {contact.action && (
                      <TouchableOpacity
                        style={styles.contactAction}
                        onPress={() =>
                          handleContactAction(contact.actionType, contact.info)
                        }
                      >
                        <ThemedText style={styles.contactActionText}>
                          {contact.action}
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  </ThemedView>
                </FadeInView>
              ))}

              {/* Información bancaria en móvil */}
              <FadeInView delay={800}>
                <ThemedView style={styles.bankingCard}>
                  <ThemedText style={styles.contactTitle}>
                    {bankingData.icon} {bankingData.title}
                  </ThemedText>
                  <ThemedText style={styles.contactInfo}>
                    {bankingData.info}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.bankingAction}
                    onPress={() =>
                      handleContactAction(
                        bankingData.actionType,
                        bankingData.info
                      )
                    }
                  >
                    <ThemedText style={styles.bankingActionText}>
                      📋 {bankingData.action}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </FadeInView>
            </ThemedView>
          </FadeInView>
        </ParallaxScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Estilos para layout web compacto
  webLayoutFullHeight: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webMainContent: {
    flex: 1,
    height: "100%",
  },
  webContentScroll: {
    flex: 1,
  },
  webContentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  webCompactGrid: {
    flexDirection: "row",
    gap: SPACING.lg,
    height: "100%",
  },
  webMainSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    flex: 2,
    minHeight: 0,
  },
  webContactGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: SPACING.md,
    width: "100%",
  },
  webProductCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    // width: "48%", // Exactamente 2 por fila
    minHeight: 180,
    justifyContent: "space-between",
  },
  webProductCardHeader: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    height: 60,
    backgroundColor: COLORS.primary + "15",
    borderRadius: RADIUS.md,
  },
  webProductIcon: {
    fontSize: 32,
  },
  webProductCardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  webProductTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  webProductInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    textAlign: "center",
    marginBottom: SPACING.md,
    flex: 1,
  },
  webProductCardAction: {
    alignItems: "center",
  },
  webBankingCompactSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    flex: 1,
    minWidth: 300,
  },
  webBankingCompactCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  webBankingContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  webBankingCompactInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    fontFamily: Platform.OS === "web" ? "monospace" : "Courier",
    marginBottom: SPACING.sm,
  },
  webBankingActions: {
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  webBankingCompactNote: {
    backgroundColor: COLORS.primary + "10",
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
  },
  webBankingCompactNoteText: {
    fontSize: 11,
    color: COLORS.primary,
    fontStyle: "italic",
  },

  // Estilos para layout web originales (mantenidos para compatibilidad)
  webContactGrid: {
    gap: SPACING.xl,
  },
  webContactSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  webBankingSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  webSectionTitle: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  webBankingCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  webBankingCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  webBankingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.accent + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  webBankingIcon: {
    fontSize: 24,
  },
  webBankingCardContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  webBankingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  webBankingInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: Platform.OS === "web" ? "monospace" : "Courier",
  },
  webBankingCardAction: {
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  webBankingNote: {
    backgroundColor: COLORS.primary + "10",
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  webBankingNoteText: {
    fontSize: 13,
    color: COLORS.primary,
    fontStyle: "italic",
  },

  // Estilos existentes para móvil
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
    marginBottom: SPACING.xs,
  },
  contactAction: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
    marginTop: SPACING.sm,
  },
  contactActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  bankingCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    ...SHADOWS.sm,
  },
  bankingAction: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
    marginTop: SPACING.sm,
  },
  bankingActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
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
