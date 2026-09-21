import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

interface ProductConsultationDraftBarProps {
  productCount: number;
  onClear: () => void;
  onContinue: () => void;
}

export function ProductConsultationDraftBar({
  productCount,
  onClear,
  onContinue,
}: ProductConsultationDraftBarProps) {
  if (productCount === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <ThemedText style={styles.title}>
          {productCount} {productCount === 1 ? "producto elegido" : "productos elegidos"}
        </ThemedText>
        <TouchableOpacity onPress={onClear} accessibilityRole="button">
          <ThemedText style={styles.clear}>Vaciar selección</ThemedText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.continueButton}
        onPress={onContinue}
        accessibilityRole="button"
      >
        <MaterialIcons name="favorite" size={20} color={COLORS.ink} />
        <ThemedText style={styles.continueText}>Consultar lista</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: SPACING.md,
    right: SPACING.md,
    bottom: Platform.OS === "web" ? SPACING.md : 78,
    maxWidth: 680,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    ...SHADOWS.lg,
  },
  copy: { flex: 1 },
  title: { color: COLORS.text, fontSize: 15, fontWeight: "800" },
  clear: { marginTop: 3, color: COLORS.errorStrong, fontSize: 12, fontWeight: "700" },
  continueButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondary,
  },
  continueText: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
});
