import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/IconSymbol";

type DataStatePanelProps = {
  status: "loading" | "error" | "empty";
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function DataStatePanel({
  status,
  title,
  message,
  actionLabel,
  onAction,
}: DataStatePanelProps) {
  const isError = status === "error";

  return (
    <View
      style={[styles.container, isError && styles.errorContainer]}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.iconContainer, isError && styles.errorIconContainer]}>
        {status === "loading" ? (
          <ActivityIndicator color={COLORS.primaryDark} size="small" />
        ) : (
          <IconSymbol
            name={isError ? "exclamationmark.triangle.fill" : "tray.fill"}
            size={26}
            color={isError ? COLORS.text : COLORS.textSecondary}
          />
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [
            styles.action,
            isError && styles.errorAction,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  errorContainer: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "12",
  },
  iconContainer: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
  },
  errorIconContainer: {
    backgroundColor: COLORS.error,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    maxWidth: 520,
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  action: {
    minHeight: 44,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  errorAction: {
    backgroundColor: COLORS.accent,
  },
  actionPressed: {
    opacity: 0.78,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
