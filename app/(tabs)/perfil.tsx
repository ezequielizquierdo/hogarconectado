import { useAuth } from '@/contexts/AuthContext';
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PerfilScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.screenHeader}>
        <Text style={styles.eyebrow}>CUENTA Y ACCESOS</Text>
        <Text style={styles.screenTitle}>Perfil</Text>
        <Text style={styles.screenSubtitle}>Revisá tu identidad, permisos y accesos disponibles.</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.identity}>
          {user?.foto ? <Image source={{ uri: user.foto }} style={styles.avatar} /> : (
            <View style={styles.avatarFallback}><Text style={styles.avatarInitial}>{user?.nombre?.charAt(0)?.toUpperCase() || 'U'}</Text></View>
          )}
          <View style={styles.identityCopy}>
            <Text style={styles.title}>{user?.nombre}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.roleBadge}><Text style={styles.role}>Rol {user?.rol}</Text></View>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>ACCESOS DE TU CUENTA</Text>
        <View style={styles.actions}>
          {user?.rol === 'admin' ? (
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => router.push('/(tabs)/usuarios')}
              accessibilityRole="button"
              accessibilityLabel="Administrar usuarios"
            >
              <Text style={styles.secondaryButtonText}>Usuarios y permisos</Text>
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
        <View style={styles.divider} />
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, width: '100%', maxWidth: 960, alignSelf: 'center', padding: SPACING.lg, gap: SPACING.lg, backgroundColor: COLORS.background },
  screenHeader: { width: '100%' },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  screenTitle: { color: COLORS.text, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  screenSubtitle: { color: COLORS.textSecondary, lineHeight: 20 },
  card: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderTopWidth: 4, borderColor: COLORS.border, borderTopColor: COLORS.primary, ...SHADOWS.sm },
  identity: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  identityCopy: { flex: 1, minWidth: 0, gap: 2 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: COLORS.secondary },
  avatarFallback: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary },
  avatarInitial: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  email: { color: COLORS.textSecondary },
  roleBadge: { alignSelf: 'flex-start', marginTop: SPACING.xs, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.primary },
  role: { color: COLORS.text, textTransform: 'capitalize', fontSize: 12, fontWeight: '800' },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: COLORS.border },
  actions: { width: '100%', gap: SPACING.sm },
  secondaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  secondaryButtonText: { color: COLORS.text, fontWeight: '700' },
  button: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.error, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  buttonPressed: { opacity: 0.78 },
  buttonText: { color: COLORS.errorStrong, fontWeight: '800' },
});
