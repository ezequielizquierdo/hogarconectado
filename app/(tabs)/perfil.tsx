import { useAuth } from '@/contexts/AuthContext';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function PerfilScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        {user?.foto ? <Image source={{ uri: user.foto }} style={styles.avatar} /> : null}
        <Text style={styles.title}>{user?.nombre}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Permiso: {user?.rol}</Text>
        <View style={styles.actions}>
          {user?.rol === 'admin' ? (
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => router.push('/(tabs)/usuarios')}
              accessibilityRole="button"
              accessibilityLabel="Administrar usuarios"
            >
              <Text style={styles.secondaryButtonText}>Administrar usuarios</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/(tabs)/explore_clean')}
            accessibilityRole="button"
            accessibilityLabel="Ver información de contacto"
          >
            <Text style={styles.secondaryButtonText}>Contacto</Text>
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, backgroundColor: COLORS.background },
  card: { width: '100%', maxWidth: 440, alignItems: 'center', gap: 10, padding: 28, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface },
  avatar: { width: 76, height: 76, borderRadius: 38 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '700' },
  email: { color: COLORS.textSecondary },
  role: { marginTop: SPACING.sm, color: COLORS.text, textTransform: 'capitalize', fontWeight: '600' },
  actions: { width: '100%', marginTop: SPACING.md, gap: SPACING.sm },
  secondaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  secondaryButtonText: { color: COLORS.text, fontWeight: '700' },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xs, borderRadius: RADIUS.md, backgroundColor: '#b42318', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  buttonPressed: { opacity: 0.78 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
