import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import React from "react";
import { Modal, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { getProductImageUrl } from "@/utils/productImageUrl";

interface ProductImageViewerModalProps {
  visible: boolean;
  imageUrl?: string;
  productLabel?: string;
  onClose: () => void;
}

export function ProductImageViewerModal({
  visible,
  imageUrl,
  productLabel,
  onClose,
}: ProductImageViewerModalProps) {
  return (
    <Modal
      visible={visible && Boolean(imageUrl)}
      animationType="fade"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView
        style={styles.overlay}
        accessibilityViewIsModal
        accessibilityLabel={`Imagen ampliada${productLabel ? ` de ${productLabel}` : ""}`}
      >
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <MaterialIcons name="zoom-in" size={20} color={COLORS.surface} />
            <ThemedText style={styles.title} numberOfLines={1}>
              {productLabel || "Imagen del producto"}
            </ThemedText>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cerrar imagen ampliada"
            onPress={onClose}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={26} color={COLORS.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.imageStage}>
          {imageUrl ? (
            <Image
              source={{ uri: getProductImageUrl(imageUrl, { width: 1600 }) }}
              style={styles.image}
              contentFit="contain"
              cachePolicy="memory-disk"
              priority="high"
              accessibilityLabel={`Imagen ampliada${productLabel ? ` de ${productLabel}` : " del producto"}`}
            />
          ) : null}
        </View>

        <ThemedText style={styles.helpText}>
          {Platform.OS === "web"
            ? "Usá el botón cerrar o la tecla Escape para volver."
            : "Usá el botón cerrar para volver."}
        </ThemedText>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 38, 0.96)",
    padding: SPACING.md,
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  title: {
    flex: 1,
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  imageStage: {
    flex: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  helpText: {
    marginTop: SPACING.sm,
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    textAlign: "center",
  },
});
