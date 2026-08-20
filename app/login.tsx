import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';
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
      <View style={styles.card}>
        <Text style={styles.logo}>🏠</Text>
        <Text style={styles.title}>Hogar Conectado</Text>
        <Text style={styles.subtitle}>Ingresá para administrar productos y cotizaciones.</Text>
        {loading ? <ActivityIndicator size="large" /> : <GoogleSignInButton onCredential={handleCredential} onError={() => setError('Google no pudo iniciar la sesión.')} />}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f5f7', padding: 24 },
  card: { width: '100%', maxWidth: 420, padding: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', gap: 18 },
  logo: { fontSize: 54 }, title: { fontSize: 28, fontWeight: '700', color: '#15202b' },
  subtitle: { fontSize: 16, color: '#52606d', textAlign: 'center' }, error: { color: '#b42318', textAlign: 'center' }
});
