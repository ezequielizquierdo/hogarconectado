import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  style?: any;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  accessibilityLabel?: string;
}

export default function Dropdown({
  options,
  selectedValue,
  onSelect,
  placeholder = "Seleccionar...",
  style,
  loading = false,
  error = null,
  onRetry,
  accessibilityLabel = "Seleccionar una opción",
}: DropdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsVisible(false);
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => handleSelect(item.value)}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: item.value === selectedValue }}
    >
      <ThemedText style={styles.optionText}>{item.label}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdown,
          style,
          error && styles.dropdownError,
          loading && styles.dropdownDisabled,
          isFocused && styles.dropdownFocused,
        ]}
        onPress={() => !loading && setIsVisible(true)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={error || placeholder}
        accessibilityState={{ disabled: loading, expanded: isVisible }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <>
            <ThemedText
              style={[
                styles.dropdownText,
                !selectedOption && styles.placeholderText,
              ]}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </ThemedText>
            <ThemedText style={styles.arrow}>▼</ThemedText>
          </>
        )}
      </TouchableOpacity>

      {error ? (
        <ThemedView style={styles.errorRow}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          {onRetry ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Reintentar carga de opciones"
              onPress={onRetry}
              style={styles.retryButton}
            >
              <ThemedText style={styles.retryText}>Reintentar</ThemedText>
            </TouchableOpacity>
          ) : null}
        </ThemedView>
      ) : null}

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={renderOption}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 56,
    ...SHADOWS.sm,
  },
  dropdownError: {
    borderColor: COLORS.error,
  },
  dropdownFocused: {
    borderColor: COLORS.primaryDark,
  },
  dropdownDisabled: {
    backgroundColor: COLORS.cardBackground,
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    flex: 1,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    marginHorizontal: SPACING.sm,
    backgroundColor: "transparent",
  },
  retryButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
  },
  retryText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
  arrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    width: "100%",
    maxHeight: "60%",
    ...SHADOWS.lg,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
});
