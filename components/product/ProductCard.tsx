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
import { IconActionButton } from "@/components/ui/IconActionButton";
import { IconSymbol } from "@/components/ui/IconSymbol";

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
  onConsult?: () => void;
  showAdminButtons?: boolean;
  showConsultButton?: boolean;
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
  onConsult,
  showAdminButtons = false,
  showConsultButton = false,
}: ProductCardProps) {
  const { width } = useWindowDimensions();
  const isCompact = Platform.OS !== "web" || width <= 768;
  const isNarrow = width <= 480;
  const hasStock = producto.stock.disponible && producto.stock.cantidad > 0;
  const hasImage = Boolean(producto.imagenes?.length);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <ThemedView
        style={[
          styles.card,
          !isCompact && styles.cardDesktop,
          !isCompact && !hasImage && styles.cardDesktopWithoutImage,
        ]}
      >
        <View style={styles.cardAccent} />
        {/* Zona de información del producto - clickeable para ver detalle */}
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle de ${producto.marca} ${producto.modelo}`}
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
              isNarrow && styles.mainContentNarrow,
            ]}
          >
            <View
              style={[
                styles.imageContainer,
                isCompact
                  ? styles.imageContainerCompact
                  : styles.imageContainerDesktop,
                isNarrow && styles.imageContainerNarrow,
                !isCompact && !hasImage && styles.imageContainerDesktopEmpty,
              ]}
            >
              {producto.imagenes && producto.imagenes.length > 0 ? (
                <Image
                  source={{ uri: producto.imagenes[0] }}
                  style={styles.productImage}
                  contentFit="contain"
                  accessibilityLabel={`Imagen de ${producto.marca} ${producto.modelo}`}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <View style={styles.placeholderIcon}>
                    <IconSymbol
                      name="cube.box.fill"
                      size={30}
                      color={COLORS.textSecondary}
                    />
                  </View>
                  <ThemedText style={styles.placeholderTitle}>
                    Sin imagen
                  </ThemedText>
                  {showAdminButtons && (
                    <ThemedText style={styles.placeholderHelp}>
                      Podés agregarla al editar
                    </ThemedText>
                  )}
                </View>
              )}
            </View>

            <View
              style={[
                styles.detailsColumn,
                isCompact
                  ? styles.detailsColumnCompact
                  : styles.detailsColumnDesktop,
                isNarrow && styles.detailsColumnNarrow,
              ]}
            >
              <View>
              <View
                style={[
                  styles.stockBadge,
                  {
                    backgroundColor: hasStock
                      ? COLORS.success
                      : COLORS.accent,
                  },
                ]}
              >
                <ThemedText style={styles.stockText}>
                  {hasStock
                    ? `Disponible · ${producto.stock.cantidad}`
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
                {producto.descripcion && (
                  <ThemedText style={styles.descriptionText} numberOfLines={2}>
                    {producto.descripcion}
                  </ThemedText>
                )}
              </View>
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
                <IconActionButton
                  label={`Crear historia de Instagram de ${producto.marca} ${producto.modelo}`}
                  visibleLabel={isNarrow ? undefined : "Historia"}
                  icon="photo-camera"
                  onPress={onInstagramStory}
                  color={COLORS.instagram}
                  style={[styles.actionButton, styles.instagramButton]}
                />
              )}

              {onEdit && (
                <IconActionButton
                  label={`Editar ${producto.marca} ${producto.modelo}`}
                  visibleLabel={isNarrow ? undefined : "Editar"}
                  icon="edit"
                  onPress={onEdit}
                  color={COLORS.text}
                  style={styles.actionButton}
                />
              )}

              {onDelete && (
                <IconActionButton
                  label={`Eliminar ${producto.marca} ${producto.modelo}`}
                  visibleLabel={isNarrow ? undefined : "Eliminar"}
                  icon="delete-outline"
                  onPress={onDelete}
                  color={COLORS.errorStrong}
                  style={[styles.actionButton, styles.deleteButton]}
                />
              )}
            </View>
          </>
        )}
        {showConsultButton && onConsult && (
          <>
            <View style={styles.separator} />
            <View style={styles.actionsSection}>
              <IconActionButton
                label={`Consultar por ${producto.marca} ${producto.modelo}`}
                visibleLabel="Consultar"
                icon="chat-bubble-outline"
                onPress={onConsult}
                color={COLORS.primaryDark}
                style={[styles.actionButton, styles.consultButton]}
              />
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardAccent: {
    height: 4,
    backgroundColor: COLORS.primary,
  },
  consultButton: {
    backgroundColor: COLORS.cardBackground,
  },
  cardDesktop: {
    minHeight: 360,
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardDesktopWithoutImage: {
    minHeight: 0,
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
  mainContentNarrow: {
    flexDirection: "column",
    gap: SPACING.md,
  },
  mainContentDesktop: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: SPACING.md,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xs, // Padding para separar la imagen de los bordes
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainerCompact: {
    width: 132,
    height: 150,
    flexShrink: 0,
    marginBottom: 0,
  },
  imageContainerNarrow: {
    width: "100%",
    height: 220,
    marginBottom: 0,
    padding: SPACING.md,
  },
  imageContainerDesktop: {
    width: "100%",
    height: 260,
    flexShrink: 0,
    marginBottom: 0,
    padding: SPACING.lg,
    borderWidth: 0,
  },
  imageContainerDesktopEmpty: {
    height: 150,
    padding: SPACING.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.borderFocus,
    backgroundColor: COLORS.cardBackground,
  },
  detailsColumn: {
    flex: 1,
  },
  detailsColumnCompact: {
    minWidth: 0,
    justifyContent: "center",
  },
  detailsColumnNarrow: {
    width: "100%",
    justifyContent: "flex-start",
  },
  detailsColumnDesktop: {
    minWidth: 0,
    justifyContent: "space-between",
    paddingVertical: 0,
    minHeight: 170,
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
    backgroundColor: "#f3f4ff",
    borderRadius: RADIUS.sm,
    padding: SPACING.lg,
  },
  placeholderIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  placeholderTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  placeholderHelp: {
    marginTop: SPACING.xs,
    color: COLORS.textLight,
    fontSize: 12,
    textAlign: "center",
  },
  stockBadge: {
    alignSelf: "flex-start",
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "700",
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
    marginTop: SPACING.xs,
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
    color: COLORS.primaryDark,
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
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
  },
  deleteButton: {
    backgroundColor: COLORS.error + "15", // Color rojizo muy suave
  },
  instagramButton: {
    backgroundColor: COLORS.instagram + "15",
  },
});
