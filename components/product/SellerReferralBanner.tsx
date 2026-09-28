import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { ActiveSeller } from "@/services/sellerReferralService";

interface Props {
  sellerName?: string;
  selectedCode?: string;
  sellers: ActiveSeller[];
  loading?: boolean;
  onSelect: (seller: ActiveSeller) => void;
}

export function SellerReferralBanner({ sellerName, selectedCode, sellers, loading = false, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const dismissOutside = (event: PointerEvent) => {
      const container = containerRef.current as unknown as HTMLElement | null;
      if (container && !container.contains(event.target as Node)) setOpen(false);
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissEscape);
    };
  }, [open]);

  return (
    <View ref={containerRef} style={styles.container}>
      <View style={styles.currentSeller}>
        <MaterialIcons name="support-agent" size={18} color={COLORS.primaryDark} />
        <ThemedText style={styles.text}>{sellerName ? `Te atiende ${sellerName}` : "Conozco un vendedor"}</ThemedText>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={sellerName ? "Cambiar vendedor" : "Elegir un vendedor conocido"}
        accessibilityState={{ expanded: open }}
        style={styles.trigger}
        onPress={() => setOpen(value => !value)}
      >
        <ThemedText style={styles.triggerText}>{sellerName ? "Cambiar" : "Elegir vendedor"}</ThemedText>
        <MaterialIcons name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={18} color={COLORS.primaryDark} />
      </TouchableOpacity>
      {open ? (
        <View style={styles.menu} accessibilityRole="menu">
          {loading ? <ThemedText style={styles.empty}>Cargando vendedores…</ThemedText> : sellers.length === 0 ? (
            <ThemedText style={styles.empty}>No hay vendedores disponibles.</ThemedText>
          ) : <ScrollView style={styles.menuScroll} nestedScrollEnabled>{sellers.map(seller => (
            <TouchableOpacity
              key={seller.codigo}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCode === seller.codigo }}
              style={[styles.option, selectedCode === seller.codigo && styles.optionSelected]}
              onPress={() => { onSelect(seller); setOpen(false); }}
            >
              <ThemedText style={[styles.optionText, selectedCode === seller.codigo && styles.optionTextSelected]}>{seller.nombre}</ThemedText>
            </TouchableOpacity>
          ))}</ScrollView>}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardBackground,
    zIndex: 30,
  },
  currentSeller: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, flexShrink: 1 },
  text: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  trigger: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: SPACING.xs },
  triggerText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: "800" },
  menu: { position: "absolute", right: SPACING.sm, top: 48, width: 240, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, overflow: "hidden", zIndex: 31, ...SHADOWS.md },
  menuScroll: { maxHeight: 280 },
  option: { minHeight: 44, justifyContent: "center", paddingHorizontal: SPACING.md, borderLeftWidth: 3, borderLeftColor: "transparent" },
  optionSelected: { borderLeftColor: COLORS.primaryDark, backgroundColor: COLORS.cardBackground },
  optionText: { color: COLORS.text, fontSize: 13 },
  optionTextSelected: { color: COLORS.primaryDark, fontWeight: "800" },
  empty: { color: COLORS.textSecondary, fontSize: 13, padding: SPACING.md },
});
