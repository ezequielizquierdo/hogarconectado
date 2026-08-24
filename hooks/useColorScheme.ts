import type { ColorSchemeName } from 'react-native';

/**
 * Hogar Conectado usa un tema claro único hasta que todas las superficies
 * tengan tokens oscuros equivalentes. Evita anunciar soporte parcial y
 * contrastes inválidos cuando el dispositivo está en modo oscuro.
 */
export function useColorScheme(): ColorSchemeName {
  return 'light';
}
