import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { COLORS, RADIUS, SEMANTIC_TONES } from "@/constants/theme";
import type { SemanticTone } from "@/constants/theme";

export type SectionIconTone = SemanticTone;
export type SectionIconSize = "sm" | "md" | "lg";

type SectionIconProps = {
  name: keyof typeof MaterialIcons.glyphMap;
  tone?: SectionIconTone;
  size?: SectionIconSize;
};

const ICON_COLORS: Record<SectionIconTone, string> = {
  purchase: COLORS.ink,
  sales: COLORS.ink,
  finance: COLORS.ink,
  insights: COLORS.ink,
  danger: COLORS.errorStrong,
  neutral: COLORS.text,
};

const SIZE_STYLES: Record<SectionIconSize, { container: number; icon: number }> = {
  sm: { container: 40, icon: 20 },
  md: { container: 48, icon: 24 },
  lg: { container: 56, icon: 28 },
};

/** Ícono contextual compartido para encabezados, secciones y estados de la interfaz. */
export function SectionIcon({ name, tone = "neutral", size = "md" }: SectionIconProps) {
  const toneStyle = SEMANTIC_TONES[tone];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      accessible={false}
      style={[
        styles.container,
        {
          width: sizeStyle.container,
          height: sizeStyle.container,
          backgroundColor: toneStyle.surface,
        },
      ]}
    >
      <MaterialIcons name={name} size={sizeStyle.icon} color={ICON_COLORS[tone]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
  },
});
