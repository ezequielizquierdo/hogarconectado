import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import MobileHeader from "@/components/MobileHeader";
import { ProductCatalogSkeleton } from "@/components/ui/LoadingStates";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

export default function CatalogRouteSkeleton() {
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width > 768;

  if (desktop) {
    return (
      <View style={styles.desktop} accessibilityLabel="Cargando catálogo">
        <View style={styles.sidebar}>
          <View style={styles.sidebarTitle} />
          <View style={styles.search} />
          <View style={styles.counter} />
          {[0, 1, 2].map(section => (
            <View key={section} style={styles.filterSection}>
              <View style={styles.filterHeading} />
              <View style={styles.filterOptionWide} />
              <View style={styles.filterOption} />
              <View style={styles.filterOption} />
            </View>
          ))}
        </View>
        <View style={styles.desktopMain}>
          <Text style={styles.eyebrow}>CATÁLOGO</Text>
          <Text style={styles.title}>Encontrá lo que necesitás</Text>
          <Text style={styles.subtitle}>Explorá el catálogo y elegí los productos que te interesan.</Text>
          <View style={styles.desktopGrid}><ProductCatalogSkeleton /></View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobile} accessibilityLabel="Cargando catálogo">
      <MobileHeader title="Productos" subtitle="Explorá el catálogo" variant="solid" />
      <View style={styles.mobileBody}>
        <Text style={styles.eyebrow}>TU VIDRIERA, EN UN SOLO LUGAR</Text>
        <Text style={styles.mobileTitle}>Encontrá lo que necesitás</Text>
        <Text style={styles.subtitle}>Elegí uno o varios productos y consultanos sin compromiso.</Text>
        <View style={styles.mobileSearchRow}>
          <View style={styles.mobileSearch}><MaterialIcons name="search" size={20} color={COLORS.textLight} /><View style={styles.searchLine} /></View>
          <View style={styles.filterButton}><MaterialIcons name="tune" size={20} color={COLORS.primaryDark} /></View>
        </View>
        <View style={styles.chips}><View style={styles.chip} /><View style={styles.chipSecondary} /></View>
        <Text style={styles.loadingLabel}>Cargando productos…</Text>
        <ProductCatalogSkeleton />
      </View>
    </View>
  );
}

const skeleton = { backgroundColor: "#e9edff", borderRadius: RADIUS.sm } as const;

const styles = StyleSheet.create({
  desktop: { flex: 1, flexDirection: "row", backgroundColor: COLORS.background },
  sidebar: { width: 280, padding: SPACING.lg, gap: SPACING.md, borderRightWidth: 1, borderRightColor: COLORS.border, backgroundColor: COLORS.surface },
  sidebarTitle: { ...skeleton, width: 140, height: 16 },
  search: { ...skeleton, width: "100%", height: 42, borderRadius: RADIUS.md },
  counter: { ...skeleton, width: 80, height: 12 },
  filterSection: { gap: SPACING.sm, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  filterHeading: { ...skeleton, width: 110, height: 18 },
  filterOptionWide: { ...skeleton, width: "100%", height: 34 },
  filterOption: { ...skeleton, width: "68%", height: 12 },
  desktopMain: { flex: 1, padding: SPACING.xl, overflow: "hidden" },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  title: { marginTop: SPACING.xs, color: COLORS.text, fontSize: 32, fontWeight: "800" },
  subtitle: { marginTop: SPACING.xs, color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  desktopGrid: { marginTop: SPACING.xl },
  mobile: { flex: 1, backgroundColor: COLORS.background },
  mobileBody: { flex: 1, padding: SPACING.lg, overflow: "hidden" },
  mobileTitle: { marginTop: SPACING.xs, color: COLORS.text, fontSize: 25, lineHeight: 31, fontWeight: "800" },
  mobileSearchRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.xl },
  mobileSearch: { flex: 1, height: 46, flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  searchLine: { ...skeleton, width: 130, height: 11 },
  filterButton: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  chips: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.sm },
  chip: { ...skeleton, width: 70, height: 34, borderRadius: RADIUS.full, backgroundColor: COLORS.primary },
  chipSecondary: { ...skeleton, width: 100, height: 34, borderRadius: RADIUS.full },
  loadingLabel: { marginVertical: SPACING.lg, color: COLORS.textSecondary, fontSize: 13, fontWeight: "700" },
});
