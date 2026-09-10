import { Link, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página no encontrada' }} />
      <ThemedView style={styles.container}>
        <View style={styles.card}>
          <Image source={require('@/assets/images/logo-transparent-circle.png')} style={styles.logo} contentFit="contain" accessibilityLabel="Logo de Hogar Conectado" />
          <Text style={styles.eyebrow}>HOGAR CONECTADO</Text>
          <Text style={styles.title}>No encontramos esta página</Text>
          <Text style={styles.message}>Es posible que el enlace haya vencido o que la dirección no sea correcta.</Text>
          <Link href="/productos" style={styles.link}>Volver a Productos</Link>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  card: { width: '100%', maxWidth: 480, alignItems: 'center', padding: SPACING.xl, gap: SPACING.sm, borderWidth: 1, borderTopWidth: 4, borderColor: COLORS.border, borderTopColor: COLORS.primary, borderRadius: RADIUS.xl, backgroundColor: COLORS.surface, ...SHADOWS.md },
  logo: { width: 72, height: 72, marginBottom: SPACING.sm },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: COLORS.text, fontSize: 25, lineHeight: 32, fontWeight: '800', textAlign: 'center' },
  message: { maxWidth: 360, color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  link: {
    width: '100%',
    minHeight: 48,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    color: COLORS.ink,
    fontWeight: '800',
    textAlign: 'center',
  },
});
