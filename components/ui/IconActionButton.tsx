import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

interface IconActionButtonProps {
  label: string;
  icon: MaterialIconName;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  visibleLabel?: string;
}

/** Acción iconográfica con semántica y área táctil consistentes. */
export function IconActionButton({
  label,
  icon,
  onPress,
  color = COLORS.text,
  disabled = false,
  style,
  visibleLabel,
}: IconActionButtonProps) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      activeOpacity={0.7}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={[styles.button, isFocused && styles.focused, style, disabled && styles.disabled]}
    >
      <MaterialIcons accessibilityElementsHidden name={icon} size={22} color={color} />
      {visibleLabel ? (
        <ThemedText style={[styles.label, { color }]} numberOfLines={1}>
          {visibleLabel}
        </ThemedText>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: Platform.OS === "android" ? 48 : 44,
    minHeight: Platform.OS === "android" ? 48 : 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    flexDirection: "row",
    gap: SPACING.xs,
  },
  disabled: {
    opacity: 0.45,
  },
  focused: {
    outlineColor: COLORS.primaryDark,
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
});
