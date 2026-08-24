import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { COLORS, RADIUS } from "@/constants/theme";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

interface IconActionButtonProps {
  label: string;
  icon: MaterialIconName;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Acción iconográfica con semántica y área táctil consistentes. */
export function IconActionButton({
  label,
  icon,
  onPress,
  color = COLORS.text,
  disabled = false,
  style,
}: IconActionButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      activeOpacity={0.7}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={[styles.button, style, disabled && styles.disabled]}
    >
      <MaterialIcons accessibilityElementsHidden name={icon} size={22} color={color} />
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
  },
  disabled: {
    opacity: 0.45,
  },
});
