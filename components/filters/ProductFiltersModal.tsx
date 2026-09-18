import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Modal, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import LabeledDropdown from "@/components/forms/LabeledDropdown";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

interface FilterOption {
  label: string;
  value: string;
}

interface ProductFiltersModalProps {
  visible: boolean;
  generalCategories: FilterOption[];
  essenCategories: FilterOption[];
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
  selectedStock: string;
  hasActiveFilters: boolean;
  loading: boolean;
  totalProducts: number;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onStockChange: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function ProductFiltersModal({
  visible,
  generalCategories,
  essenCategories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedStock,
  hasActiveFilters,
  loading,
  totalProducts,
  onCategoryChange,
  onBrandChange,
  onStockChange,
  onClear,
  onClose,
}: ProductFiltersModalProps) {
  const generalCategory = generalCategories.some(({ value }) => value === selectedCategory)
    ? selectedCategory
    : "";
  const essenCategory = essenCategories.some(({ value }) => value === selectedCategory)
    ? selectedCategory
    : "";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <ThemedText style={styles.eyebrow}>EXPLORAR CATÁLOGO</ThemedText>
            <ThemedText style={styles.title}>Filtrar productos</ThemedText>
            <ThemedText style={styles.subtitle}>
              Combiná categoría, marca y disponibilidad.
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar filtros"
          >
            <MaterialIcons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <FilterSection
            label="Categoría"
            options={[{ label: "Todas las categorías", value: "" }, ...generalCategories]}
            selectedValue={generalCategory}
            onSelect={onCategoryChange}
            placeholder="Filtrar por categoría"
            searchPlaceholder="Buscar categoría"
          />

          {essenCategories.length > 0 ? (
            <FilterSection
              label="Línea Essen"
              options={[{ label: "Todas las líneas Essen", value: "" }, ...essenCategories]}
              selectedValue={essenCategory}
              onSelect={onCategoryChange}
              placeholder="Filtrar por línea Essen"
              searchPlaceholder="Buscar línea Essen"
            />
          ) : null}

          <FilterSection
            label="Marca"
            options={[
              { label: "Todas las marcas", value: "" },
              ...brands.map((brand) => ({ label: brand, value: brand })),
            ]}
            selectedValue={selectedBrand}
            onSelect={onBrandChange}
            placeholder="Filtrar por marca"
            searchPlaceholder="Buscar marca"
          />

          <View style={styles.section}>
            <LabeledDropdown
              label="Stock"
              options={[
                { label: "Todo el stock", value: "" },
                { label: "Disponible", value: "disponible" },
                { label: "Agotado", value: "agotado" },
              ]}
              selectedValue={selectedStock}
              onSelect={onStockChange}
              placeholder="Filtrar por stock"
            />
          </View>
        </ScrollView>

        <View style={styles.actions}>
          {hasActiveFilters ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClear}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda y filtros"
            >
              <ThemedText style={styles.clearText}>Limpiar filtros</ThemedText>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <ThemedText style={styles.applyText}>
              {loading
                ? "Actualizando…"
                : `Ver ${totalProducts} ${totalProducts === 1 ? "producto" : "productos"}`}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function FilterSection({
  label,
  options,
  selectedValue,
  onSelect,
  placeholder,
  searchPlaceholder,
}: {
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
}) {
  return (
    <View style={styles.section}>
      <LabeledDropdown
        label={label}
        options={options}
        selectedValue={selectedValue}
        onSelect={onSelect}
        placeholder={placeholder}
        searchable
        searchPlaceholder={searchPlaceholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCopy: { minWidth: 0, flex: 1 },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  title: { marginTop: 2, color: COLORS.text, fontSize: 24, fontWeight: "800" },
  subtitle: { marginTop: 3, color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  content: { flex: 1 },
  contentContainer: { padding: SPACING.lg },
  section: { marginBottom: SPACING.lg },
  actions: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  clearButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
  },
  clearText: { color: COLORS.textSecondary, fontWeight: "700" },
  applyButton: {
    minHeight: 48,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  applyText: { color: COLORS.ink, fontWeight: "800" },
});
