import React, { useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent" | "danger";
  size?: "small" | "medium" | "large";
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function AnimatedButton({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  icon,
  disabled = false,
  loading = false,
  style,
}: AnimatedButtonProps) {
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 150,
        friction: 6,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 6,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return COLORS.primary;
      case "secondary":
        return COLORS.secondary;
      case "accent":
        return COLORS.accent;
      case "danger":
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  };

  const getButtonStyles = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];

    switch (size) {
      case "small":
        baseStyle.push({ minHeight: 40 });
        break;
      case "large":
        baseStyle.push({ minHeight: 56 });
        break;
      default:
        baseStyle.push({ minHeight: 48 });
    }

    baseStyle.push({
      backgroundColor: getBackgroundColor(),
      opacity: disabled ? 0.5 : 1,
    });

    return baseStyle;
  };

  const getTextStyles = (): TextStyle => {
    let fontSize = 16;

    switch (size) {
      case "small":
        fontSize = 14;
        break;
      case "large":
        fontSize = 18;
        break;
      default:
        fontSize = 16;
    }

    return {
      ...styles.buttonText,
      fontSize,
      color: disabled ? COLORS.textLight : COLORS.text,
    };
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: animatedScale }],
          opacity: animatedOpacity,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={getButtonStyles()}
      >
        <View style={styles.content}>
          {icon && (
            <ThemedText style={[styles.icon, getTextStyles()]}>
              {icon}
            </ThemedText>
          )}
          <ThemedText style={getTextStyles()}>
            {loading ? "⏳ Procesando..." : title}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  buttonText: {
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  icon: {
    marginRight: SPACING.sm,
    fontSize: 18,
  },
});
