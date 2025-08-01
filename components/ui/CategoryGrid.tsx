import React from "react";
import { View, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
  count?: number;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  onCategoryPress: (category: CategoryItem) => void;
  selectedCategory?: string;
  horizontal?: boolean;
}

// Iconos por categoría para un look más ecommerce
const getCategoryIcon = (categoryName: string): string => {
  const icons: { [key: string]: string } = {
    "AIRE ACONDICIONADO": "❄️",
    ANAFE: "🔥",
    ASPIRADORA: "🧹",
    BATIDORA: "🥄",
    CAFETERA: "☕",
    CAMPANA: "💨",
    COCINA: "👩‍🍳",
    FREEZER: "🧊",
    FREIDORA: "🍟",
    HELADERA: "🧊",
    HORNO: "🔥",
    LAVARROPAS: "👕",
    LAVAVAJILLAS: "🍽️",
    LICUADORA: "🥤",
    MICROONDAS: "📡",
    MULTIPROCESADORA: "⚙️",
    NOTEBOOK: "💻",
    "PARRILLA ELÉCTRICA": "🥩",
    PLANCHA: "👔",
    PROCESADORA: "🔄",
    PURIFICADOR: "💨",
    SECARROPAS: "🌪️",
    SMARTPHONE: "📱",
    TABLET: "📱",
    TELEVISOR: "📺",
    TOSTADORA: "🍞",
    VENTILADOR: "🌀",
  };
  return icons[categoryName] || "📦";
};

export default function CategoryGrid({
  categories,
  onCategoryPress,
  selectedCategory,
  horizontal = false,
}: CategoryGridProps) {
  const categoriesWithIcons = categories.map((cat) => ({
    ...cat,
    icon: getCategoryIcon(cat.name),
  }));

  const renderCategoryCard = ({ item }: { item: CategoryItem }) => {
    const isSelected = selectedCategory === item.id;

    return (
      <TouchableOpacity
        onPress={() => onCategoryPress(item)}
        style={styles.categoryCard}
      >
        <ThemedView
          style={[styles.cardContent, isSelected && styles.selectedCardContent]}
        >
          <View
            style={[
              styles.iconContainer,
              isSelected && styles.selectedIconContainer,
            ]}
          >
            <ThemedText style={styles.categoryIcon}>{item.icon}</ThemedText>
          </View>

          <ThemedText
            style={[
              styles.categoryName,
              isSelected && styles.selectedCategoryName,
            ]}
            numberOfLines={horizontal ? 1 : 2}
          >
            {item.name}
          </ThemedText>

          {item.count !== undefined && (
            <ThemedText
              style={[
                styles.categoryCount,
                isSelected && styles.selectedCategoryCount,
              ]}
            >
              {item.count} productos
            </ThemedText>
          )}
        </ThemedView>
      </TouchableOpacity>
    );
  };

  if (horizontal) {
    return (
      <View style={styles.horizontalContainer}>
        <FlatList
          data={categoriesWithIcons}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContent}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categoriesWithIcons}
        renderItem={renderCategoryCard}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
  },
  content: {
    paddingBottom: SPACING.lg,
  },
  horizontalContainer: {
    paddingVertical: SPACING.sm,
  },
  horizontalContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryCard: {
    flex: 1,
    margin: SPACING.xs,
    aspectRatio: 1,
  },
  cardContent: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  selectedCardContent: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  selectedIconContainer: {
    backgroundColor: COLORS.surface,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 14,
  },
  selectedCategoryName: {
    color: COLORS.surface,
  },
  categoryCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  selectedCategoryCount: {
    color: COLORS.surface,
    opacity: 0.8,
  },
});
