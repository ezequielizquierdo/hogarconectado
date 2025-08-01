import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

interface DropdownOption {
  label: string;
  value: string;
}

interface EditableDropdownProps {
  label: string;
  required?: boolean;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  style?: any;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

export default function EditableDropdown({
  label,
  required = false,
  options,
  selectedValue,
  onSelect,
  placeholder = "Seleccionar o escribir...",
  style,
  loading = false,
  error = null,
  disabled = false,
}: EditableDropdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const dropdownOptions: DropdownOption[] = [
    ...options.map((option) => ({ label: option, value: option })),
    { label: "Escribir nueva marca...", value: "__custom__" },
  ];

  const handleSelect = (value: string) => {
    if (value === "__custom__") {
      setShowCustomInput(true);
      setCustomValue("");
    } else {
      onSelect(value);
      setIsVisible(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onSelect(customValue.trim());
      setShowCustomInput(false);
      setIsVisible(false);
      setCustomValue("");
    }
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        item.value === "__custom__" && styles.customOption,
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <ThemedText
        style={[
          styles.optionText,
          item.value === "__custom__" && styles.customOptionText,
        ]}
      >
        {item.label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>
          {label}{" "}
          {required && <ThemedText style={styles.required}>*</ThemedText>}
        </ThemedText>
      </View>

      <TouchableOpacity
        style={[
          styles.dropdown,
          style,
          error && styles.dropdownError,
          (loading || disabled) && styles.dropdownDisabled,
        ]}
        onPress={() => !loading && !disabled && setIsVisible(true)}
        disabled={loading || disabled}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <>
            <ThemedText
              style={[
                styles.dropdownText,
                !selectedValue && styles.placeholderText,
              ]}
            >
              {selectedValue || placeholder}
            </ThemedText>
            <ThemedText style={styles.arrow}>▼</ThemedText>
          </>
        )}
      </TouchableOpacity>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setIsVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            {showCustomInput ? (
              <View style={styles.customInputContainer}>
                <ThemedText style={styles.customInputTitle}>
                  Escribir nueva marca:
                </ThemedText>
                <TextInput
                  style={styles.customInput}
                  value={customValue}
                  onChangeText={setCustomValue}
                  placeholder="Nombre de la marca"
                  autoFocus
                  onSubmitEditing={handleCustomSubmit}
                />
                <View style={styles.customInputActions}>
                  <TouchableOpacity
                    style={[styles.customButton, styles.cancelButton]}
                    onPress={() => setShowCustomInput(false)}
                  >
                    <ThemedText style={styles.cancelButtonText}>
                      Cancelar
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.customButton, styles.confirmButton]}
                    onPress={handleCustomSubmit}
                  >
                    <ThemedText style={styles.confirmButtonText}>
                      Agregar
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FlatList
                data={dropdownOptions}
                keyExtractor={(item) => item.value}
                renderItem={renderOption}
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </ThemedView>
        </TouchableOpacity>
      </Modal>
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
  },
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
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
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
  customOption: {
    backgroundColor: COLORS.cardBackground,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  customOptionText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  customInputContainer: {
    padding: SPACING.lg,
  },
  customInputTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  customInput: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.lg,
  },
  customInputActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.sm,
  },
  customButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.cardBackground,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: COLORS.surface,
    fontWeight: "600",
  },
});
