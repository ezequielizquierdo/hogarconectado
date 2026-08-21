import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";
import { ProductoConPrecios } from "@/services/types";

interface ProductCardProps {
  producto: ProductoConPrecios;
  onPress?: () => void;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  // Props para administración
  onEdit?: () => void;
  onDelete?: () => void;
  onInstagramStory?: () => void;
  showAdminButtons?: boolean;
}

export default function ProductCard({
  producto,
  onPress,
  onAddToCart,
  onFavorite,
  isFavorite = false,
  onEdit,
  onDelete,
  onInstagramStory,
  showAdminButtons = false,
}: ProductCardProps) {
  const { width } = useWindowDimensions();
  const isCompact = Platform.OS !== "web" || width <= 768;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <ThemedView style={[styles.card, !isCompact && styles.cardDesktop]}>
        {/* Zona de información del producto - clickeable para ver detalle */}
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles.productInfoSection,
            !isCompact && styles.productInfoSectionDesktop,
          ]}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.mainContent,
              isCompact ? styles.mainContentCompact : styles.mainContentDesktop,
            ]}
          >
            <View
              style={[
                styles.imageContainer,
                isCompact
                  ? styles.imageContainerCompact
                  : styles.imageContainerDesktop,
              ]}
            >
              {producto.imagenes && producto.imagenes.length > 0 ? (
                <Image
                  source={{ uri: producto.imagenes[0] }}
                  style={styles.productImage}
                  contentFit="contain"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <ThemedText style={styles.placeholderText}>📱</ThemedText>
                </View>
              )}
            </View>

            <View style={[styles.detailsColumn, isCompact && styles.detailsColumnCompact]}>
              <View
                style={[
                  styles.stockBadge,
                  {
                    backgroundColor: producto.stock.disponible
                      ? COLORS.success
                      : COLORS.warning,
                  },
                ]}
              >
                <ThemedText style={styles.stockText}>
                  {producto.stock.disponible
                    ? `Stock: ${producto.stock.cantidad}`
                    : "Sin stock"}
                </ThemedText>
              </View>

              <View style={styles.productInfo}>
                <ThemedText style={styles.brandText} numberOfLines={1}>
                  {typeof producto.categoria === "string"
                    ? producto.categoria
                    : producto.categoria.nombre}
                </ThemedText>
                <ThemedText style={styles.marcaText} numberOfLines={1}>
                  {producto.marca}
                </ThemedText>
                <ThemedText style={styles.modeloText} numberOfLines={2}>
                  {producto.modelo}
                </ThemedText>
                {isCompact && producto.descripcion && (
                  <ThemedText style={styles.descriptionText} numberOfLines={2}>
                    {producto.descripcion}
                  </ThemedText>
                )}
              </View>

              <View style={styles.priceContainer}>
                {!isCompact && (
                  <ThemedText style={styles.priceLabel}>PRECIO CONTADO</ThemedText>
                )}
                <ThemedText style={[styles.price, isCompact && styles.priceCompact]}>
                  {formatPrice(producto.precios.contado)}
                </ThemedText>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Línea separatoria y zona de acciones */}
        {showAdminButtons && (onEdit || onDelete || onInstagramStory) && (
          <>
            <View style={styles.separator} />
            <View style={styles.actionsSection}>
              {onInstagramStory && (
                <TouchableOpacity
                  onPress={onInstagramStory}
                  style={[styles.actionButton, styles.instagramButton]}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.actionIcon}>📸</ThemedText>
                </TouchableOpacity>
              )}

              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.actionIcon}>✏️</ThemedText>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  style={[styles.actionButton, styles.deleteButton]}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.actionIcon}>🗑️</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
    overflow: "hidden",
    height: Platform.OS === "web" ? "auto" : "auto", // Altura automática para web
  },
  cardDesktop: {
    minHeight: 360,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  productInfoSection: {
    padding: SPACING.md,
  },
  productInfoSectionDesktop: {
    flex: 1,
  },
  mainContent: {
    flexDirection: "column",
  },
  mainContentCompact: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: SPACING.md,
  },
  mainContentDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: SPACING.lg,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.sm,
    backgroundColor: "#FFFFFF", // Fondo blanco
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xs, // Padding para separar la imagen de los bordes
    ...SHADOWS.md, // Sombra más pronunciada
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainerCompact: {
    width: 132,
    height: 150,
    flexShrink: 0,
    marginBottom: 0,
  },
  imageContainerDesktop: {
    width: "44%",
    height: 290,
    flexShrink: 0,
    marginBottom: 0,
    padding: SPACING.md,
  },
  detailsColumn: {
    flex: 1,
  },
  detailsColumnCompact: {
    minWidth: 0,
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: RADIUS.sm,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA", // Fondo gris muy claro para el placeholder
    borderRadius: RADIUS.sm,
  },
  placeholderText: {
    fontSize: 40,
    opacity: 0.5,
  },
  stockBadge: {
    alignSelf: "flex-start",
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    marginBottom: SPACING.xs,
  },
  stockText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.text,
  },
  productInfo: {
    marginBottom: SPACING.sm,
  },
  brandText: {
    fontSize: Platform.OS === "web" ? 13 : 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  marcaText: {
    fontSize: Platform.OS === "web" ? 17 : 16,
    fontWeight: "bold",
    color: COLORS.text,
    lineHeight: Platform.OS === "web" ? 22 : 20,
    marginBottom: 4,
  },
  modeloText: {
    fontSize: Platform.OS === "web" ? 15 : 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    lineHeight: Platform.OS === "web" ? 20 : 18,
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: Platform.OS === "web" ? 13 : 12,
    color: COLORS.textLight,
    lineHeight: Platform.OS === "web" ? 18 : 16,
  },
  priceContainer: {
    marginBottom: 0,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  price: {
    fontSize: Platform.OS === "web" ? 18 : 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  priceCompact: {
    fontSize: 20,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  actionsSection: {
    flexDirection: "row",
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
  },
  deleteButton: {
    backgroundColor: COLORS.error + "15", // Color rojizo muy suave
  },
  instagramButton: {
    backgroundColor: "#E4405F" + "15", // Color de Instagram muy suave
  },
  actionIcon: {
    fontSize: 20,
  },
});
