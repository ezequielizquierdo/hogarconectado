import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  actionVariant?: "primary" | "secondary";
};

/** Encabezado contextual común para todas las superficies operativas. */
export function ScreenHeader({ eyebrow, title, subtitle, actionLabel, actionIcon, onAction, actionVariant = "primary" }: ScreenHeaderProps) {
  const { width } = useWindowDimensions();
  const compact = width < 720;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>{subtitle}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.action, actionVariant === "secondary" && styles.actionSecondary, compact && styles.actionCompact, pressed && styles.actionPressed]}
        >
          {actionIcon}
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", minHeight: 88, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: SPACING.lg },
  containerCompact: { minHeight: 0, alignItems: "stretch", flexDirection: "column", gap: SPACING.md },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 1.1 },
  title: { marginTop: 2, color: COLORS.text, fontSize: 34, lineHeight: 40, fontWeight: "800" },
  titleCompact: { fontSize: 28, lineHeight: 34 },
  subtitle: { maxWidth: 720, marginTop: 2, color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 },
  subtitleCompact: { fontSize: 14, lineHeight: 20 },
  action: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  actionCompact: { width: "100%" },
  actionSecondary: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  actionPressed: { opacity: 0.76 },
  actionText: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
});
