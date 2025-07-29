import React, { useState, useRef } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Animated,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

interface AnimatedInputProps extends TextInputProps {
  label: string;
  icon?: string;
  required?: boolean;
  error?: string;
}

export default function AnimatedInput({
  label,
  icon,
  required = false,
  error,
  value,
  onFocus,
  onBlur,
  ...props
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedBorder = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);

    // Animaciones al enfocar
    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(animatedBorder, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);

    // Animaciones al desenfocar
    Animated.parallel([
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(animatedBorder, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    onBlur?.(e);
  };

  const borderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.borderFocus],
  });

  const labelColor = isFocused ? COLORS.primary : COLORS.text;

  return (
    <View style={styles.container}>
      {/* Label siempre visible arriba */}
      <Animated.View style={styles.labelContainer}>
        <Animated.Text
          style={[
            styles.label,
            {
              color: labelColor,
            },
          ]}
        >
          {label}{" "}
          {required && <ThemedText style={styles.required}>*</ThemedText>}
        </Animated.Text>
      </Animated.View>

      {/* Container con animación de escala */}
      <Animated.View
        style={[
          {
            transform: [{ scale: animatedScale }],
          },
        ]}
      >
        {/* Container con animación de borde */}
        <Animated.View
          style={[
            styles.inputContainer,
            {
              borderColor: borderColor,
            },
            error && styles.errorBorder,
          ]}
        >
          {icon && (
            <View style={styles.iconContainer}>
              <ThemedText style={styles.icon}>{icon}</ThemedText>
            </View>
          )}

          <TextInput
            style={[styles.textInput, icon && styles.textInputWithIcon]}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={COLORS.textLight}
            {...props}
          />
        </Animated.View>
      </Animated.View>

      {error && (
        <Animated.View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  labelContainer: {
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  iconContainer: {
    marginRight: SPACING.sm,
    width: 24,
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    minHeight: 24,
  },
  textInputWithIcon: {
    paddingLeft: 0,
  },
  required: {
    color: COLORS.error,
    fontSize: 14,
  },
  errorContainer: {
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "500",
  },
});
