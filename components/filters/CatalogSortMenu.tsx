import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

export const PRODUCT_SORT_OPTIONS = [
  { label: "Más recientes", value: "recientes" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
];

interface CatalogSortMenuProps {
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function CatalogSortMenu({ selectedValue, onSelect }: CatalogSortMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<View>(null);
  const selected = PRODUCT_SORT_OPTIONS.find(option => option.value === selectedValue)
    || PRODUCT_SORT_OPTIONS[0];

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
      <Text style={styles.label}>Ordenar por</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Ordenar por ${selected.label}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(value => !value)}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>{selected.label}</Text>
        <MaterialIcons name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={18} color={COLORS.primaryDark} />
      </TouchableOpacity>
      {open && (
        <View style={styles.menu} accessibilityRole="menu">
          {PRODUCT_SORT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedValue === option.value }}
              onPress={() => { onSelect(option.value); setOpen(false); }}
              style={[styles.option, selectedValue === option.value && styles.optionSelected]}
            >
              <Text style={[styles.optionText, selectedValue === option.value && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: SPACING.xs, zIndex: 20 },
  label: { color: COLORS.textSecondary, fontSize: 13 },
  trigger: { flexDirection: "row", alignItems: "center", gap: 3, minHeight: 34, paddingHorizontal: 4 },
  triggerText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: "600" },
  menu: {
    position: "absolute", right: 0, top: 35, width: 165,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface, ...SHADOWS.md, overflow: "hidden", zIndex: 21,
  },
  option: { minHeight: 42, justifyContent: "center", paddingHorizontal: SPACING.md, borderLeftWidth: 3, borderLeftColor: "transparent" },
  optionSelected: { borderLeftColor: COLORS.primaryDark, backgroundColor: COLORS.cardBackground },
  optionText: { color: COLORS.text, fontSize: 13 },
  optionTextSelected: { color: COLORS.primaryDark, fontWeight: "700" },
});
