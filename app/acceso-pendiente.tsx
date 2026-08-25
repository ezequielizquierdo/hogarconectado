import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';

export default function PendingAccessScreen() {
  const { state, user, loginWithGoogle, logout } = useAuth();
  const blocked = state === 'blocked';
  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.icon}>{blocked ? '⛔' : '⏳'}</Text>
        <Text style={styles.title}>{blocked ? 'Acceso bloqueado' : 'Acceso pendiente'}</Text>
        <Text style={styles.text}>{user?.email}</Text>
        <Text style={styles.text}>
          {blocked
            ? 'Tu cuenta no puede ingresar en este momento. Contactá a un administrador para solicitar la reactivación.'
            : 'Tu solicitud fue registrada. Un administrador debe aprobarla y asignarte un rol antes de que puedas ingresar.'}
        </Text>
        {!blocked && (
          <Text style={styles.hint}>
            Si ya te confirmaron la aprobación, volvé a ingresar para actualizar tu acceso.
          </Text>
        )}
        {!blocked && <GoogleSignInButton onCredential={loginWithGoogle} onError={() => undefined} />}
        <Pressable style={styles.button} onPress={logout}><Text style={styles.buttonText}>Cerrar sesión</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, backgroundColor: COLORS.background },
  card: { maxWidth: 480, width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', gap: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.md },
  icon: { fontSize: 48 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  text: { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21 },
  hint: { color: COLORS.primaryDark, textAlign: 'center', lineHeight: 20, fontWeight: '600' },
  button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, minHeight: 48, justifyContent: 'center' },
  buttonText: { color: COLORS.text, fontWeight: '700' }
});
