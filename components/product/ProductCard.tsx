import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Image as RNImage,
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
  showAdminButtons?: boolean;
}

const { width } = Dimensions.get("window");
const cardWidth = Platform.OS === "web" ? "100%" : (width - SPACING.lg * 3) / 2;

export default function ProductCard({
  producto,
  onPress,
  onAddToCart,
  onFavorite,
  isFavorite = false,
  onEdit,
  onDelete,
  showAdminButtons = false,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.card}>
        {/* Zona de información del producto - clickeable para ver detalle */}
        <TouchableOpacity
          onPress={onPress}
          style={styles.productInfoSection}
          activeOpacity={0.7}
        >
          {/* Imagen del producto */}
          <View style={styles.imageContainer}>
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

          {/* Badge de stock */}
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

          {/* Información del producto */}
          <View style={styles.productInfo}>
            <ThemedText style={styles.brandText}>
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

            {producto.descripcion && (
              <ThemedText style={styles.descriptionText} numberOfLines={1}>
                {producto.descripcion}
              </ThemedText>
            )}
          </View>

          {/* Precio único */}
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>
              {formatPrice(producto.precioBase)}
            </ThemedText>
          </View>
        </TouchableOpacity>

        {/* Línea separatoria y zona de acciones */}
        {showAdminButtons && (onEdit || onDelete) && (
          <>
            <View style={styles.separator} />
            <View style={styles.actionsSection}>
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
    width: cardWidth,
    marginBottom: Platform.OS === "web" ? 0 : SPACING.md, // Sin margin en web, usamos gap
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
    overflow: "hidden",
    height: Platform.OS === "web" ? "auto" : "auto", // Altura automática para web
  },
  productInfoSection: {
    padding: SPACING.sm,
  },
  imageContainer: {
    width: "100%",
    height: Platform.OS === "web" ? 140 : 120, // Altura un poco mayor en web
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
  price: {
    fontSize: Platform.OS === "web" ? 18 : 16,
    fontWeight: "bold",
    color: COLORS.primary,
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
  actionIcon: {
    fontSize: 20,
  },
});
