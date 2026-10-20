import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { ProductoConPrecios } from "@/services/types";
import { getProductImageUrl } from "@/utils/productImageUrl";
import { hasAvailableStock } from "@/utils/productAvailability";

interface CatalogProductCardProps {
  producto: ProductoConPrecios;
  imagePriority?: "low" | "normal" | "high";
  selected?: boolean;
  onPress?: () => void;
  onImagePress?: () => void;
  onSelect?: () => void;
}

export default function CatalogProductCard({
  producto,
  imagePriority = "normal",
  selected = false,
  onPress,
  onImagePress,
  onSelect,
}: CatalogProductCardProps) {
  const category = typeof producto.categoria === "string"
    ? producto.categoria
    : producto.categoria.nombre;
  const discount = Number(producto.precios.descuentoPorcentaje ?? producto.descuento?.porcentaje ?? 0);
  const previousPrice = Number(producto.precios.contadoSinDescuento ?? producto.descuento?.precioAnterior ?? 0);
  const isAvailable = hasAvailableStock(producto.stock);
  const currencyCode = /^[A-Z]{3}$/.test(producto.moneda || '') ? producto.moneda! : 'ARS';
  const currency = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  });

  return (
    <View style={[styles.card, selected && styles.cardSelected]}>
      <View>
        {producto.imagenes?.[0] && onImagePress ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Ampliar imagen de ${producto.marca} ${producto.modelo}`}
            accessibilityHint="Abre la imagen en pantalla completa"
            activeOpacity={0.86}
            onPress={onImagePress}
            style={styles.imageShell}
          >
            <Image
              source={{ uri: getProductImageUrl(producto.imagenes[0]) }}
              style={styles.image}
              contentFit="contain"
              cachePolicy="memory-disk"
              priority={imagePriority}
              transition={160}
            />
            <View style={styles.imageZoomBadge}>
              <MaterialIcons name="zoom-in" size={18} color={COLORS.text} />
            </View>
            {discount > 0 ? (
              <View style={styles.discountBadge}>
                <ThemedText style={styles.discountText}>-{discount}%</ThemedText>
              </View>
            ) : null}
            <View style={[styles.availabilityBadge, !isAvailable && styles.orderBadge]}>
              <View style={[styles.availabilityDot, !isAvailable && styles.orderDot]} />
              <ThemedText style={styles.availabilityText}>{isAvailable ? "Disponible" : "Sin stock"}</ThemedText>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.imageShell}>
            {producto.imagenes?.[0] ? (
              <Image
                source={{ uri: getProductImageUrl(producto.imagenes[0]) }}
                style={styles.image}
                contentFit="contain"
                cachePolicy="memory-disk"
                priority={imagePriority}
                transition={160}
              />
            ) : (
              <View style={styles.placeholder}>
              <MaterialIcons name="inventory-2" size={30} color={COLORS.textLight} />
              <ThemedText style={styles.placeholderText}>Sin imagen</ThemedText>
              </View>
            )}
            {discount > 0 ? (
              <View style={styles.discountBadge}>
                <ThemedText style={styles.discountText}>-{discount}%</ThemedText>
              </View>
            ) : null}
            <View style={[styles.availabilityBadge, !isAvailable && styles.orderBadge]}>
              <View style={[styles.availabilityDot, !isAvailable && styles.orderDot]} />
              <ThemedText style={styles.availabilityText}>{isAvailable ? "Disponible" : "Sin stock"}</ThemedText>
            </View>
          </View>
        )}

        <View style={styles.copy}>
          <ThemedText numberOfLines={1} style={styles.category}>{category}</ThemedText>
          <ThemedText numberOfLines={1} style={styles.brand}>{producto.marca}</ThemedText>
          <ThemedText numberOfLines={2} style={styles.model}>{producto.modelo}</ThemedText>
          {producto.descripcion ? (
            <ThemedText numberOfLines={2} style={styles.description}>{producto.descripcion}</ThemedText>
          ) : null}
          {onPress ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Ver más información de ${producto.marca} ${producto.modelo}`}
              onPress={onPress}
              style={styles.viewMoreButton}
            >
              <ThemedText style={styles.viewMoreText}>Ver más</ThemedText>
              <MaterialIcons name="arrow-forward" size={15} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
          {discount > 0 && previousPrice > producto.precios.contado ? (
            <ThemedText style={styles.previousPrice}>{currency.format(previousPrice)}</ThemedText>
          ) : null}
          <ThemedText style={styles.price}>{currency.format(producto.precios.contado)}</ThemedText>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={selected ? `Quitar ${producto.marca} ${producto.modelo} de la consulta` : `Agregar ${producto.marca} ${producto.modelo} a la consulta`}
        accessibilityState={{ selected }}
        onPress={onSelect}
        activeOpacity={0.8}
        style={[styles.action, selected && styles.actionSelected]}
      >
        <MaterialIcons name={selected ? "check-circle" : "favorite-border"} size={18} color={COLORS.ink} />
        <ThemedText numberOfLines={1} style={styles.actionText}>{selected ? "Agregado" : "¡Lo quiero!"}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardSelected: { borderColor: COLORS.primaryDark, borderWidth: 2 },
  imageShell: { height: 178, backgroundColor: COLORS.cardBackground, position: "relative", padding: SPACING.sm },
  image: { width: "100%", height: "100%" },
  imageZoomBadge: { position: "absolute", right: SPACING.sm, top: SPACING.sm, width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "rgba(255,255,255,0.94)", ...SHADOWS.sm },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: SPACING.xs },
  placeholderText: { color: COLORS.textSecondary, fontSize: 12 },
  discountBadge: { position: "absolute", top: SPACING.sm, left: SPACING.sm, backgroundColor: COLORS.errorStrong, borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 5 },
  discountText: { color: COLORS.surface, fontSize: 12, fontWeight: "800" },
  availabilityBadge: { position: "absolute", left: SPACING.sm, bottom: SPACING.sm, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 5 },
  orderBadge: { backgroundColor: "rgba(255,234,168,0.96)" },
  availabilityDot: { width: 7, height: 7, borderRadius: RADIUS.full, backgroundColor: "#2f9e65" },
  orderDot: { backgroundColor: "#b7791f" },
  availabilityText: { color: COLORS.text, fontSize: 11, fontWeight: "700" },
  copy: { padding: SPACING.md, paddingBottom: SPACING.sm, minHeight: 145 },
  category: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },
  brand: { color: COLORS.text, fontSize: 15, fontWeight: "800", marginTop: 5 },
  model: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 17, minHeight: 34, marginTop: 2 },
  description: { color: COLORS.textLight, fontSize: 11, lineHeight: 15, marginTop: 4 },
  viewMoreButton: { alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4, paddingVertical: 2 },
  viewMoreText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "700" },
  previousPrice: { color: COLORS.textLight, fontSize: 12, textDecorationLine: "line-through", marginTop: SPACING.sm },
  price: { color: COLORS.primaryDark, fontSize: 19, fontWeight: "900", marginTop: 2 },
  action: { minHeight: 46, margin: SPACING.sm, marginTop: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: COLORS.secondary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm },
  actionSelected: { borderWidth: 1, borderColor: COLORS.secondaryStrong, backgroundColor: COLORS.secondaryDark },
  actionText: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
});
