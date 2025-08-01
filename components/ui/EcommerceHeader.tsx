import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";

interface EcommerceHeaderProps {
  searchValue: string;
  onSearchChange: (text: string) => void;
  onCartPress: () => void;
  onMenuPress: () => void;
  cartItemCount?: number;
}

export default function EcommerceHeader({
  searchValue,
  onSearchChange,
  onCartPress,
  onMenuPress,
  cartItemCount = 0,
}: EcommerceHeaderProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <ThemedText style={styles.menuIcon}>☰</ThemedText>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <ThemedText style={styles.logoText}>🏠 Hogar</ThemedText>
            <ThemedText style={styles.logoSubtext}>Conectado</ThemedText>
          </View>

          <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
            <ThemedText style={styles.cartIcon}>🛒</ThemedText>
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <ThemedText style={styles.cartBadgeText}>
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar electrodomésticos, celulares..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchValue}
              onChangeText={onSearchChange}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <ThemedText style={styles.quickActionIcon}>📍</ThemedText>
            <ThemedText style={styles.quickActionText}>Envío gratis</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <ThemedText style={styles.quickActionIcon}>💳</ThemedText>
            <ThemedText style={styles.quickActionText}>
              Cuotas sin interés
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <ThemedText style={styles.quickActionIcon}>⚡</ThemedText>
            <ThemedText style={styles.quickActionText}>
              Entrega rápida
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.primary,
  },
  container: {
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === "ios" ? 0 : SPACING.md,
    height: 56,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 20,
    color: COLORS.surface,
  },
  logoContainer: {
    alignItems: "center",
    flex: 1,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.surface,
  },
  logoSubtext: {
    fontSize: 12,
    color: COLORS.surface,
    opacity: 0.8,
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartIcon: {
    fontSize: 20,
    color: COLORS.surface,
  },
  cartBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 45,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    color: COLORS.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    fontSize: 16,
    color: COLORS.surface,
    marginBottom: 2,
  },
  quickActionText: {
    fontSize: 11,
    color: COLORS.surface,
    textAlign: "center",
  },
});
