import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Dropdown from "./Dropdown";
import { COLORS, SPACING } from "@/constants/theme";

interface DropdownOption {
  label: string;
  value: string;
}

interface LabeledDropdownProps {
  label: string;
  required?: boolean;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  style?: any;
  loading?: boolean;
  error?: string | null;
}

export default function LabeledDropdown({
  label,
  required = false,
  options,
  selectedValue,
  onSelect,
  placeholder = "Seleccionar...",
  style,
  loading = false,
  error = null,
}: LabeledDropdownProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>
          {label}{" "}
          {required && <ThemedText style={styles.required}>*</ThemedText>}
        </ThemedText>
      </View>
      <Dropdown
        options={options}
        selectedValue={selectedValue}
        onSelect={onSelect}
        placeholder={placeholder}
        style={style}
        loading={loading}
        error={error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  labelContainer: {
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  required: {
    color: COLORS.error,
    fontSize: 14,
  },
});
