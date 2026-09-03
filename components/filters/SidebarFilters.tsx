import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
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
  resultCount: number;
  loading?: boolean;
}

const ESSEN_CATEGORY_PREFIX = "Essen · ";

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
  resultCount,
  loading = false,
}) => {
  const [categoriasCollapsed, setCategoriasCollapsed] = useState(false);
  const [essenCollapsed, setEssenCollapsed] = useState(false);
  const [marcasCollapsed, setMarcasCollapsed] = useState(false);
  const [stockCollapsed, setStockCollapsed] = useState(false);

  const stockOptions = [
    { label: "Disponible", value: "disponible" },
    { label: "Agotado", value: "agotado" },
  ];

  const essenCategories = categorias
    .filter((category) => category.label.startsWith(ESSEN_CATEGORY_PREFIX))
    .map((category) => ({
      ...category,
      label: category.label.slice(ESSEN_CATEGORY_PREFIX.length),
    }));
  const generalCategories = categorias.filter(
    (category) => !category.label.startsWith(ESSEN_CATEGORY_PREFIX)
  );

  const renderFilterSection = (
    title: string,
    icon: React.ComponentProps<typeof MaterialIcons>["name"],
    options: FilterOption[],
    selectedValue: string,
    onSelect: (value: string) => void,
    showAllOption = true,
    isCollapsed = false,
    toggleCollapse?: () => void
  ) => (
    <View style={styles.filterSection}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={toggleCollapse}
        accessibilityRole="button"
        accessibilityLabel={`${isCollapsed ? "Mostrar" : "Ocultar"} ${title}`}
        accessibilityState={{ expanded: !isCollapsed }}
      >
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIcon}>
            <MaterialIcons name={icon} size={17} color={COLORS.primaryDark} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <MaterialIcons
          name={isCollapsed ? "expand-more" : "expand-less"}
          size={20}
          color={COLORS.textSecondary}
        />
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
              accessibilityRole="button"
              accessibilityLabel={`Mostrar todas las opciones de ${title}`}
              accessibilityState={{ selected: selectedValue === "" }}
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
              accessibilityRole="button"
              accessibilityLabel={`${option.label}${option.count !== undefined ? `, ${option.count} productos` : ""}`}
              accessibilityState={{ selected: selectedValue === option.value }}
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
    selectedCategoria !== "" ||
    selectedMarca !== "" ||
    selectedStock !== "" ||
    searchText.trim() !== "";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de búsqueda */}
        <View style={styles.searchSection}>
          <View style={styles.searchLabelRow}>
            <MaterialIcons name="search" size={18} color={COLORS.primaryDark} />
            <ThemedText style={styles.searchLabel}>Buscar productos</ThemedText>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por marca, modelo, categoría..."
            value={searchText}
            onChangeText={onSearchChange}
            placeholderTextColor={COLORS.textLight}
            accessibilityLabel="Buscar productos por marca, modelo o categoría"
          />
        </View>

        <View style={styles.resultsSummary} accessibilityLiveRegion="polite">
          <ThemedText style={styles.resultsText}>
            {loading
              ? "Actualizando resultados…"
              : `${resultCount} ${resultCount === 1 ? "producto" : "productos"}`}
          </ThemedText>
          {hasActiveFilters && (
            <ThemedText style={styles.activeFiltersText}>
              Filtros activos
            </ThemedText>
          )}
        </View>

        <View style={styles.divider} />

        {/* Header de filtros */}
        <View style={styles.filtersHeader}>
          <ThemedText style={styles.filtersTitle}>Filtrar Productos</ThemedText>
          {hasActiveFilters && (
            <TouchableOpacity
              onPress={onClearFilters}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda y filtros"
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categorías */}
        {renderFilterSection(
          "Categorías",
          "category",
          generalCategories,
          selectedCategoria,
          onCategoriaChange,
          true,
          categoriasCollapsed,
          () => setCategoriasCollapsed(!categoriasCollapsed)
        )}

        {essenCategories.length > 0 && (
          <>
            <View style={styles.divider} />
            {renderFilterSection(
              "Essen",
              "restaurant-menu",
              essenCategories,
              selectedCategoria,
              onCategoriaChange,
              true,
              essenCollapsed,
              () => setEssenCollapsed(!essenCollapsed)
            )}
          </>
        )}

        <View style={styles.divider} />

        {/* Marcas */}
        {renderFilterSection(
          "Marcas",
          "business",
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
          "Disponibilidad",
          "inventory-2",
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
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
  },
  clearButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  resultsSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xs,
  },
  resultsText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  activeFiltersText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "700",
  },
  filterSection: {
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 44,
    paddingVertical: SPACING.xs,
  },
  sectionTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary + "20",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
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
    color: COLORS.text,
    fontWeight: "700",
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
  searchLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
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
