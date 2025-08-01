import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface SidebarFiltersProps {
  categorias: FilterOption[];
  marcas: FilterOption[];
  selectedCategoria: string;
  selectedMarca: string;
  selectedStock: string;
  searchText: string;
  onCategoriaChange: (value: string) => void;
  onMarcaChange: (value: string) => void;
  onStockChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onAddProduct: () => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  categorias,
  marcas,
  selectedCategoria,
  selectedMarca,
  selectedStock,
  searchText,
  onCategoriaChange,
  onMarcaChange,
  onStockChange,
  onSearchChange,
  onClearFilters,
  onAddProduct,
}) => {
  const [categoriasCollapsed, setCategoriasCollapsed] = useState(false);
  const [marcasCollapsed, setMarcasCollapsed] = useState(false);
  const [stockCollapsed, setStockCollapsed] = useState(false);

  const stockOptions = [
    { label: "Disponible", value: "disponible" },
    { label: "Agotado", value: "agotado" },
  ];

  const renderFilterSection = (
    title: string,
    options: FilterOption[],
    selectedValue: string,
    onSelect: (value: string) => void,
    showAllOption = true,
    isCollapsed = false,
    toggleCollapse?: () => void
  ) => (
    <View style={styles.filterSection}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggleCollapse}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.collapseIcon}>{isCollapsed ? "▶" : "▼"}</Text>
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.sectionContent}>
          {showAllOption && (
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedValue === "" && styles.filterOptionSelected,
              ]}
              onPress={() => onSelect("")}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedValue === "" && styles.filterOptionTextSelected,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>
          )}

          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterOption,
                selectedValue === option.value && styles.filterOptionSelected,
              ]}
              onPress={() => onSelect(option.value)}
            >
              <View style={styles.filterOptionContent}>
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedValue === option.value &&
                      styles.filterOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {option.count !== undefined && (
                  <Text style={styles.filterCount}>({option.count})</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const hasActiveFilters =
    selectedCategoria !== "" || selectedMarca !== "" || selectedStock !== "";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Botón de agregar producto prominente */}
        <View style={styles.addProductSection}>
          <AnimatedButton
            title="➕ Agregar Producto"
            onPress={onAddProduct}
            variant="primary"
            style={styles.addProductButton}
          />
        </View>

        {/* Sección de búsqueda */}
        <View style={styles.searchSection}>
          <ThemedText style={styles.searchLabel}>
            🔍 Buscar Productos
          </ThemedText>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por marca, modelo, categoría..."
            value={searchText}
            onChangeText={onSearchChange}
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.divider} />

        {/* Header de filtros */}
        <View style={styles.filtersHeader}>
          <ThemedText style={styles.filtersTitle}>Filtrar Productos</ThemedText>
          {hasActiveFilters && (
            <TouchableOpacity
              onPress={onClearFilters}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categorías */}
        {renderFilterSection(
          "🏷️ Categorías",
          categorias,
          selectedCategoria,
          onCategoriaChange,
          true,
          categoriasCollapsed,
          () => setCategoriasCollapsed(!categoriasCollapsed)
        )}

        <View style={styles.divider} />

        {/* Marcas */}
        {renderFilterSection(
          "🏢 Marcas",
          marcas,
          selectedMarca,
          onMarcaChange,
          true,
          marcasCollapsed,
          () => setMarcasCollapsed(!marcasCollapsed)
        )}

        <View style={styles.divider} />

        {/* Stock */}
        {renderFilterSection(
          "📦 Disponibilidad",
          stockOptions,
          selectedStock,
          onStockChange,
          false,
          stockCollapsed,
          () => setStockCollapsed(!stockCollapsed)
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    height: "100%",
  },
  scrollContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  clearButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
  },
  clearButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  filterSection: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  collapseIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  sectionContent: {
    marginTop: SPACING.xs,
  },
  filterOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  filterOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  filterOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  filterOptionTextSelected: {
    color: COLORS.surface,
    fontWeight: "500",
  },
  filterCount: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },

  // Estilos para el diseño mejorado
  titleSection: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  addProductSection: {
    paddingVertical: SPACING.md,
  },
  addProductButton: {
    width: "100%",
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  searchSection: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
    ...SHADOWS.sm,
  },
});

export default SidebarFilters;
