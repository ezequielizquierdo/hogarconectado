import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PendingAccessScreen() {
  const { state, user, loginWithGoogle, logout } = useAuth();
  const blocked = state === 'blocked';
  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.icon}>{blocked ? '⛔' : '⏳'}</Text>
        <Text style={styles.title}>{blocked ? 'Acceso bloqueado' : 'Acceso pendiente'}</Text>
        <Text style={styles.text}>{user?.email}</Text>
        <Text style={styles.text}>{blocked ? 'Contactá a un administrador.' : 'Un administrador debe aprobar tu cuenta y asignarte un rol.'}</Text>
        {!blocked && <GoogleSignInButton onCredential={loginWithGoogle} onError={() => undefined} />}
        <Pressable style={styles.button} onPress={logout}><Text style={styles.buttonText}>Cerrar sesión</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f3f5f7' },
  card: { maxWidth: 480, width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', gap: 16 },
  icon: { fontSize: 48 }, title: { fontSize: 26, fontWeight: '700' }, text: { color: '#52606d', textAlign: 'center' },
  button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, backgroundColor: '#243b53' }, buttonText: { color: '#fff', fontWeight: '600' }
});
