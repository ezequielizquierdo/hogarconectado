import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredential = async (credential: string) => {
    setLoading(true); setError('');
    try { await loginWithGoogle(credential); }
    catch { setError('No pudimos iniciar sesión. Verificá que tu cuenta esté autorizada.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.page}>
      <View style={[styles.ambientShape, styles.ambientLavender]} />
      <View style={[styles.ambientShape, styles.ambientMint]} />
      <View style={styles.card}>
        <View style={styles.logoFrame}>
          <Image
            source={require('@/assets/images/logo-transparent-circle.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Logo de Hogar Conectado"
          />
        </View>
        <Text style={styles.eyebrow}>TU VIDRIERA OPERATIVA</Text>
        <Text style={styles.title}>Hogar Conectado</Text>
        <Text style={styles.subtitle}>
          Ingresá para gestionar productos, preparar cotizaciones y compartir tu catálogo.
        </Text>
        <View style={styles.signInArea}>
          {loading ? (
            <View style={styles.loadingState} accessibilityLiveRegion="polite">
              <ActivityIndicator size="small" color={COLORS.primaryDark} />
              <Text style={styles.loadingText}>Iniciando sesión…</Text>
            </View>
          ) : (
            <GoogleSignInButton
              onCredential={handleCredential}
              onError={() => setError('Google no pudo iniciar la sesión.')}
            />
          )}
        </View>
        {!!error && (
          <View style={styles.errorPanel} accessibilityLiveRegion="polite">
            <Text style={styles.error}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  ambientShape: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: RADIUS.full,
    opacity: 0.36,
  },
  ambientLavender: {
    top: -150,
    right: -100,
    backgroundColor: COLORS.primary,
  },
  ambientMint: {
    bottom: -190,
    left: -110,
    backgroundColor: COLORS.secondary,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    ...SHADOWS.lg,
  },
  logoFrame: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logo: { width: 68, height: 68 },
  eyebrow: {
    ...TYPOGRAPHY.label,
    color: COLORS.primaryDark,
    letterSpacing: 1.1,
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    maxWidth: 350,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  signInArea: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  loadingState: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyStrong,
    color: COLORS.textSecondary,
  },
  errorPanel: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '18',
  },
  error: {
    ...TYPOGRAPHY.label,
    color: COLORS.errorStrong,
    textAlign: 'center',
  },
});
