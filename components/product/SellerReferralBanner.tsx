import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

export function SellerReferralBanner({ sellerName }: { sellerName: string }) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="support-agent" size={18} color={COLORS.primaryDark} />
      <ThemedText style={styles.text}>Te atiende {sellerName}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardBackground,
  },
  text: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
});
