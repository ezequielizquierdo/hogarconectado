import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { Producto } from "@/services/types";

interface ProductConsultationDraftBarProps {
  products: Producto[];
  onClear: () => void;
  onRemove: (productId: string) => void;
  onContinue: () => void;
}

export function ProductConsultationDraftBar({ products, onClear, onRemove, onContinue }: ProductConsultationDraftBarProps) {
  const [visible, setVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const productCount = products.length;

  if (productCount === 0) return null;

  const clearSelection = () => {
    onClear();
    setVisible(false);
  };

  const continueConsultation = () => {
    setVisible(false);
    onContinue();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver selección para consultar: ${productCount} productos`}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.floatingBar, isDesktop ? styles.floatingBarDesktop : styles.floatingBarMobile, pressed && styles.pressed]}
      >
        <View style={styles.barBadge}>
          <MaterialIcons name="favorite" size={20} color={COLORS.ink} />
          <ThemedText style={styles.barBadgeText}>{productCount}</ThemedText>
        </View>
        <View style={styles.barCopy}>
          <ThemedText style={styles.barTitle} numberOfLines={1}>Consulta en preparación</ThemedText>
          <ThemedText style={styles.barSubtitle} numberOfLines={1}>
            {productCount} {productCount === 1 ? "producto elegido" : "productos elegidos"}
          </ThemedText>
        </View>
        <ThemedText style={styles.barAction}>Ver selección</ThemedText>
        <MaterialIcons name="chevron-right" size={22} color={COLORS.ink} />
      </Pressable>

      <Modal animationType={isDesktop ? "fade" : "slide"} transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar selección" onPress={() => setVisible(false)} style={StyleSheet.absoluteFill} />
          <View style={[styles.panel, isDesktop ? styles.panelDesktop : styles.panelMobile]}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHeaderCopy}>
                <ThemedText style={styles.eyebrow}>CONSULTA EN PREPARACIÓN</ThemedText>
                <ThemedText style={styles.panelTitle}>
                  {productCount} {productCount === 1 ? "producto elegido" : "productos elegidos"}
                </ThemedText>
                <ThemedText style={styles.panelHint}>Revisá la lista antes de completar tus datos y enviarla.</ThemedText>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => setVisible(false)} style={styles.closeButton}>
                <MaterialIcons name="close" size={22} color={COLORS.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.itemsScroll} contentContainerStyle={styles.itemsContent} showsVerticalScrollIndicator={false}>
              {products.map((product) => (
                <View key={product._id} style={styles.itemRow}>
                  <View style={styles.thumbnail}>
                    {product.imagenes?.[0] ? (
                      <Image source={{ uri: product.imagenes[0] }} style={styles.thumbnailImage} contentFit="contain" />
                    ) : (
                      <MaterialIcons name="inventory-2" size={24} color={COLORS.textSecondary} />
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <ThemedText style={styles.itemName} numberOfLines={2}>{product.marca} {product.modelo}</ThemedText>
                    <ThemedText style={styles.itemCategory} numberOfLines={1}>
                      {typeof product.categoria === "string" ? product.categoria : product.categoria?.nombre || "Producto"}
                    </ThemedText>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar ${product.marca} ${product.modelo}`}
                    onPress={() => onRemove(product._id)}
                    style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                  >
                    <MaterialIcons name="delete-outline" size={21} color={COLORS.errorStrong} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            <View style={styles.panelActions}>
              <Pressable accessibilityRole="button" onPress={clearSelection} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
                <ThemedText style={styles.clearButtonText}>Vaciar selección</ThemedText>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setVisible(false)} style={({ pressed }) => [styles.keepButton, pressed && styles.pressed]}>
                <ThemedText style={styles.keepButtonText}>Seguir viendo</ThemedText>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={continueConsultation} style={({ pressed }) => [styles.prepareButton, pressed && styles.pressed]}>
                <MaterialIcons name="favorite" size={19} color={COLORS.ink} />
                <ThemedText style={styles.prepareButtonText}>Preparar consulta</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingBar: { position: "absolute", zIndex: 50, minHeight: 64, flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: RADIUS.lg, backgroundColor: COLORS.secondary, ...SHADOWS.lg },
  floatingBarDesktop: { right: SPACING.lg, bottom: SPACING.lg, width: 410 },
  floatingBarMobile: { left: SPACING.sm, right: SPACING.sm, bottom: 76 },
  barBadge: { minWidth: 44, height: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, borderRadius: RADIUS.full, backgroundColor: COLORS.surface },
  barBadgeText: { color: COLORS.text, fontSize: 12, fontWeight: "800" },
  barCopy: { flex: 1, minWidth: 0 },
  barTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
  barSubtitle: { marginTop: 2, color: COLORS.text, fontSize: 12, fontWeight: "600" },
  barAction: { color: COLORS.ink, fontSize: 12, fontWeight: "800" },
  pressed: { opacity: 0.76 },
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.md, backgroundColor: "rgba(24, 34, 53, 0.48)" },
  panel: { maxHeight: "88%", overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, backgroundColor: COLORS.surface, ...SHADOWS.lg },
  panelDesktop: { width: 680 },
  panelMobile: { width: "100%", maxWidth: 520 },
  panelHeader: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  panelHeaderCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: COLORS.primaryDark, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  panelTitle: { marginTop: 4, color: COLORS.text, fontSize: 24, fontWeight: "900" },
  panelHint: { marginTop: 4, color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.full, backgroundColor: COLORS.cardBackground },
  itemsScroll: { flexGrow: 0 },
  itemsContent: { gap: SPACING.sm, padding: SPACING.lg },
  itemRow: { minHeight: 82, flexDirection: "row", alignItems: "center", gap: SPACING.md, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  thumbnail: { width: 64, height: 64, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: RADIUS.sm, backgroundColor: COLORS.surface },
  thumbnailImage: { width: "100%", height: "100%" },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { color: COLORS.text, fontSize: 14, lineHeight: 19, fontWeight: "800" },
  itemCategory: { marginTop: 4, color: COLORS.textSecondary, fontSize: 12 },
  removeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.full, backgroundColor: COLORS.surface },
  panelActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: SPACING.sm, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  clearButton: { minHeight: 46, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.error + "18" },
  clearButtonText: { color: COLORS.errorStrong, fontSize: 13, fontWeight: "800" },
  keepButton: { minHeight: 46, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  keepButtonText: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  prepareButton: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, backgroundColor: COLORS.secondary },
  prepareButtonText: { color: COLORS.ink, fontSize: 13, fontWeight: "900" },
});
