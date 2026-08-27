import { COLORS } from "@/constants/theme";

// El modo oscuro todavía no forma parte del sistema visual aprobado. Ambos
// esquemas usan por ahora la misma paleta para evitar una mezcla accidental con
// los colores heredados del proyecto inicial de Expo.
const brandTheme = {
  text: COLORS.text,
  background: COLORS.background,
  tint: COLORS.primaryDark,
  icon: COLORS.textSecondary,
  tabIconDefault: COLORS.textSecondary,
  tabIconSelected: COLORS.primaryDark,
};

export const Colors = {
  light: brandTheme,
  dark: brandTheme,
};
