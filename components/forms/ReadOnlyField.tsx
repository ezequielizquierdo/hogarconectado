import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  icon?: string;
  style?: any;
}

export default function ReadOnlyField({
  label,
  value,
  placeholder = "Sin información disponible",
  icon,
  style,
}: ReadOnlyFieldProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>
          {icon && <ThemedText style={styles.icon}>{icon} </ThemedText>}
          {label}
        </ThemedText>
      </View>

      <ThemedView style={styles.field}>
        <ThemedText style={[styles.text, !value && styles.placeholderText]}>
          {value || placeholder}
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  labelContainer: {
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  icon: {
    fontSize: 16,
  },
  field: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 50,
    justifyContent: "center",
    opacity: 0.8,
    ...SHADOWS.sm,
  },
  text: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 20,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
});
