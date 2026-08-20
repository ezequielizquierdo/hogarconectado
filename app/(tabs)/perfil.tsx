import { useAuth } from '@/contexts/AuthContext';
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
        <Pressable style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f3f5f7' },
  card: { width: '100%', maxWidth: 440, alignItems: 'center', gap: 10, padding: 28, borderRadius: 16, backgroundColor: '#fff' },
  avatar: { width: 76, height: 76, borderRadius: 38 },
  title: { fontSize: 24, fontWeight: '700' },
  email: { color: '#52606d' },
  role: { marginTop: 8, textTransform: 'capitalize', fontWeight: '600' },
  button: { marginTop: 18, borderRadius: 8, backgroundColor: '#b42318', paddingHorizontal: 18, paddingVertical: 11 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
