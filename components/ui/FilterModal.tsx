import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    categories: FilterOption[];
    brands: FilterOption[];
    priceRanges: FilterOption[];
    availability: FilterOption[];
  };
  selectedFilters: {
    categories: string[];
    brands: string[];
    priceRanges: string[];
    availability: string[];
  };
  onApplyFilters: (filters: any) => void;
}

export default function FilterModal({
  visible,
  onClose,
  filters,
  selectedFilters,
  onApplyFilters,
}: FilterModalProps) {
  const [tempFilters, setTempFilters] = useState(selectedFilters);

  const toggleFilter = (category: keyof typeof tempFilters, value: string) => {
    const currentCategory = tempFilters[category];
    const newCategory = currentCategory.includes(value)
      ? currentCategory.filter((item) => item !== value)
      : [...currentCategory, value];

    setTempFilters({
      ...tempFilters,
      [category]: newCategory,
    });
  };

  const clearAllFilters = () => {
    setTempFilters({
      categories: [],
      brands: [],
      priceRanges: [],
      availability: [],
    });
  };

  const applyFilters = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const renderFilterSection = (
    title: string,
    options: FilterOption[],
    category: keyof typeof tempFilters
  ) => (
    <View style={styles.filterSection}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {options.map((option) => {
        const isSelected = tempFilters[category].includes(option.id);
        return (
          <TouchableOpacity
            key={option.id}
            style={styles.filterOption}
            onPress={() => toggleFilter(category, option.id)}
          >
            <View
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            >
              {isSelected && (
                <ThemedText style={styles.checkmark}>✓</ThemedText>
              )}
            </View>
            <ThemedText
              style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </ThemedText>
            {option.count !== undefined && (
              <ThemedText style={styles.optionCount}>
                ({option.count})
              </ThemedText>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Filtros</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {renderFilterSection(
              "Categorías",
              filters.categories,
              "categories"
            )}
            {renderFilterSection("Marcas", filters.brands, "brands")}
            {renderFilterSection("Precio", filters.priceRanges, "priceRanges")}
            {renderFilterSection(
              "Disponibilidad",
              filters.availability,
              "availability"
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={clearAllFilters}
              style={styles.clearButton}
            >
              <ThemedText style={styles.clearButtonText}>
                Limpiar todo
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
              <ThemedText style={styles.applyButtonText}>
                Aplicar filtros
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: "80%",
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  filterSection: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "bold",
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  optionLabelSelected: {
    fontWeight: "600",
  },
  optionCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  clearButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: COLORS.surface,
    fontWeight: "600",
  },
});
