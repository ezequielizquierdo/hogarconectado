import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { useQuoteDraft } from "@/contexts/QuoteDraftContext";
import { QuoteComposerModal } from "@/components/quote/QuoteComposerModal";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);

export function QuoteDraftBar() {
  const {
    items,
    productCount,
    unitCount,
    cashTotal,
    setQuantity,
    removeProduct,
    clear,
  } = useQuoteDraft();
  const [visible, setVisible] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  if (productCount === 0) return null;

  const confirmClear = () => {
    const clearSelection = () => {
      clear();
      setVisible(false);
    };

    if (Platform.OS === "web") {
      if (window.confirm("¿Querés quitar todos los productos de esta cotización?")) {
        clearSelection();
      }
      return;
    }

    Alert.alert(
      "Vaciar selección",
      "¿Querés quitar todos los productos de esta cotización?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Vaciar",
          style: "destructive",
          onPress: clearSelection,
        },
      ]
    );
  };

  return (
    <>
      <QuoteComposerModal
        visible={composerVisible}
        onClose={() => setComposerVisible(false)}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver selección para cotizar: ${productCount} productos`}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.floatingBar,
          isDesktop ? styles.floatingBarDesktop : styles.floatingBarMobile,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.barBadge}>
          <MaterialIcons name="request-quote" size={22} color={COLORS.ink} />
          <ThemedText style={styles.barBadgeText}>{unitCount}</ThemedText>
        </View>
        <View style={styles.barCopy}>
          <ThemedText style={styles.barTitle} numberOfLines={1}>
            Cotización en preparación
          </ThemedText>
          <ThemedText style={styles.barSubtitle} numberOfLines={1}>
            {productCount} {productCount === 1 ? "producto" : "productos"} · {formatPrice(cashTotal)}
          </ThemedText>
        </View>
        <ThemedText style={styles.barAction}>Ver selección</ThemedText>
        <MaterialIcons name="chevron-right" size={22} color={COLORS.ink} />
      </Pressable>

      <Modal
        animationType={isDesktop ? "fade" : "slide"}
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar selección"
            onPress={() => setVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.panel, isDesktop ? styles.panelDesktop : styles.panelMobile]}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHeaderCopy}>
                <ThemedText style={styles.eyebrow}>COTIZACIÓN EN PREPARACIÓN</ThemedText>
                <ThemedText style={styles.panelTitle}>
                  {productCount} {productCount === 1 ? "producto" : "productos"}
                </ThemedText>
                <ThemedText style={styles.panelHint}>
                  La selección se conserva aunque cierres o recargues la aplicación.
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={22} color={COLORS.text} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.itemsScroll}
              contentContainerStyle={styles.itemsContent}
              showsVerticalScrollIndicator={false}
            >
              {items.map((item) => (
                <View key={item.producto._id} style={styles.itemRow}>
                  <View style={styles.thumbnail}>
                    {item.producto.imagenes?.[0] ? (
                      <Image
                        source={{ uri: item.producto.imagenes[0] }}
                        style={styles.thumbnailImage}
                        contentFit="contain"
                      />
                    ) : (
                      <MaterialIcons name="inventory-2" size={24} color={COLORS.textSecondary} />
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <ThemedText style={styles.itemName} numberOfLines={1}>
                      {item.producto.marca} {item.producto.modelo}
                    </ThemedText>
                    <ThemedText style={styles.itemPrice}>
                      {formatPrice(item.producto.precios.contado)} c/u
                    </ThemedText>
                    <View style={styles.quantityRow}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Reducir cantidad de ${item.producto.marca} ${item.producto.modelo}`}
                        disabled={item.cantidad <= 1}
                        onPress={() => setQuantity(item.producto._id, item.cantidad - 1)}
                        style={[styles.quantityButton, item.cantidad <= 1 && styles.quantityButtonDisabled]}
                      >
                        <MaterialIcons name="remove" size={18} color={COLORS.text} />
                      </Pressable>
                      <ThemedText style={styles.quantityValue}>{item.cantidad}</ThemedText>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Aumentar cantidad de ${item.producto.marca} ${item.producto.modelo}`}
                        onPress={() => setQuantity(item.producto._id, item.cantidad + 1)}
                        style={styles.quantityButton}
                      >
                        <MaterialIcons name="add" size={18} color={COLORS.text} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.itemAside}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar ${item.producto.marca} ${item.producto.modelo}`}
                      onPress={() => removeProduct(item.producto._id)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={COLORS.errorStrong} />
                    </Pressable>
                    <ThemedText style={styles.itemSubtotal} numberOfLines={1}>
                      {formatPrice(item.producto.precios.contado * item.cantidad)}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.summary}>
              <View>
                <ThemedText style={styles.summaryLabel}>Total contado estimado</ThemedText>
                <ThemedText style={styles.summaryHelp}>
                  Se recalculará al preparar la cotización.
                </ThemedText>
              </View>
              <ThemedText style={styles.summaryTotal}>{formatPrice(cashTotal)}</ThemedText>
            </View>

            <View style={styles.panelActions}>
              <Pressable
                accessibilityRole="button"
                onPress={confirmClear}
                style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
              >
                <ThemedText style={styles.clearButtonText}>Vaciar selección</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(false)}
                style={({ pressed }) => [styles.keepButton, styles.keepButtonSecondary, pressed && styles.pressed]}
              >
                <ThemedText style={styles.keepButtonText}>Seguir agregando</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setVisible(false);
                  setComposerVisible(true);
                }}
                style={({ pressed }) => [styles.prepareButton, pressed && styles.pressed]}
              >
                <ThemedText style={styles.prepareButtonText}>Preparar cotización</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingBar: {
    position: "absolute",
    zIndex: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    minHeight: 64,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.primary,
    ...SHADOWS.lg,
  },
  floatingBarDesktop: { right: SPACING.lg, bottom: SPACING.lg, width: 410 },
  floatingBarMobile: { left: SPACING.sm, right: SPACING.sm, bottom: 76 },
  barBadge: {
    minWidth: 44,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  barBadgeText: { color: COLORS.text, fontSize: 12, fontWeight: "800" },
  barCopy: { flex: 1, minWidth: 0 },
  barTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
  barSubtitle: { marginTop: 2, color: COLORS.text, fontSize: 12, fontWeight: "600" },
  barAction: { color: COLORS.ink, fontSize: 12, fontWeight: "800" },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: "rgba(24, 34, 53, 0.48)",
  },
  panel: {
    maxHeight: "88%",
    overflow: "hidden",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    ...SHADOWS.lg,
  },
  panelDesktop: { width: 720 },
  panelMobile: { width: "100%", maxWidth: 520 },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  panelHeaderCopy: { flex: 1 },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  panelTitle: { marginTop: 4, color: COLORS.text, fontSize: 24, fontWeight: "800" },
  panelHint: { marginTop: 4, color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
  },
  itemsScroll: { flexGrow: 0 },
  itemsContent: { padding: SPACING.md, gap: SPACING.sm },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  thumbnail: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  thumbnailImage: { width: "100%", height: "100%" },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  itemPrice: { marginTop: 2, color: COLORS.textSecondary, fontSize: 12 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.sm },
  quantityButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderFocus,
    backgroundColor: COLORS.surface,
  },
  quantityButtonDisabled: { opacity: 0.35 },
  quantityValue: { minWidth: 20, textAlign: "center", color: COLORS.text, fontWeight: "800" },
  itemAside: { minWidth: 105, alignItems: "flex-end", alignSelf: "stretch", justifyContent: "space-between" },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error + "14",
  },
  itemSubtotal: { color: COLORS.primaryDark, fontSize: 14, fontWeight: "800" },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  summaryLabel: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  summaryHelp: { marginTop: 2, color: COLORS.textSecondary, fontSize: 11 },
  summaryTotal: { color: COLORS.primaryDark, fontSize: 22, fontWeight: "800" },
  panelActions: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, padding: SPACING.md },
  clearButton: {
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.error + "14",
  },
  clearButtonText: { color: COLORS.errorStrong, fontSize: 13, fontWeight: "700" },
  keepButton: {
    flex: 1,
    minWidth: 150,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardBackground,
  },
  keepButtonText: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
  keepButtonSecondary: { borderWidth: 1, borderColor: COLORS.border },
  prepareButton: {
    flex: 1.3,
    minWidth: 190,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  prepareButtonText: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.78 },
});
