import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

export interface InventoryStats {
  total: number;
  disponibles: number;
  agotados: number;
  valorTotal: number;
}

interface InventoryStatsModalProps {
  visible: boolean;
  stats: InventoryStats;
  onClose: () => void;
}

export function InventoryStatsModal({
  visible,
  stats,
  onClose,
}: InventoryStatsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>📊 Resumen del Inventario</ThemedText>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cerrar resumen del inventario"
              style={styles.closeButton}
              onPress={onClose}
            >
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            <StatItem value={stats.total} label="Total de Productos" />
            <StatItem value={stats.disponibles} label="Disponibles" tone="available" />
            <StatItem value={stats.agotados} label="Agotados" tone="unavailable" />
            <StatItem
              value={`$${stats.valorTotal.toLocaleString()}`}
              label="Valor Total del Inventario"
              tone="value"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function StatItem({
  value,
  label,
  tone,
}: {
  value: number | string;
  label: string;
  tone?: "available" | "unavailable" | "value";
}) {
  return (
    <View style={styles.item}>
      <ThemedText
        style={[
          styles.number,
          tone === "available" && styles.available,
          tone === "unavailable" && styles.unavailable,
          tone === "value" && styles.value,
        ]}
      >
        {value}
      </ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  container: {
    width: "100%",
    maxWidth: 520,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  closeButtonText: { color: COLORS.textSecondary, fontSize: 18, fontWeight: "700" },
  grid: { gap: SPACING.lg },
  item: {
    alignItems: "center",
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  number: { color: COLORS.primaryDark, fontSize: 24, fontWeight: "800" },
  label: { marginTop: SPACING.xs, color: COLORS.textSecondary, textAlign: "center" },
  available: { color: COLORS.success },
  unavailable: { color: COLORS.error },
  value: { color: COLORS.warning },
});
