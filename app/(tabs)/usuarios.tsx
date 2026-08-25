import { useAuth } from '@/contexts/AuthContext';
import { UserRole, Usuario } from '@/services/types';
import { usuariosService } from '@/services/usuariosService';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DataStatePanel } from '@/components/ui/DataStatePanel';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

const roles: UserRole[] = ['consulta', 'editor', 'admin'];

export default function UsuariosScreen() {
  const { user, logout } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setUsuarios(await usuariosService.listar()); }
    catch { setError('No pudimos cargar la lista de usuarios.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (action: () => Promise<Usuario>) => {
    try { await action(); await load(); }
    catch (error: any) { Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el usuario.'); }
  };

  if (user?.rol !== 'admin') return (
    <View style={styles.center}>
      <DataStatePanel
        status="error"
        title="Acceso restringido"
        message="Esta sección está disponible únicamente para administradores."
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <View><Text style={styles.title}>Usuarios</Text><Text style={styles.subtitle}>Aprobá accesos y asigná permisos.</Text></View>
        <Pressable style={styles.secondaryButton} onPress={logout}><Text>Cerrar sesión</Text></Pressable>
      </View>
      {loading ? (
        <DataStatePanel
          status="loading"
          title="Cargando usuarios…"
          message="Estamos consultando accesos y permisos."
        />
      ) : error ? (
        <DataStatePanel
          status="error"
          title="No pudimos cargar los usuarios"
          message="Revisá tu conexión e intentá nuevamente."
          actionLabel="Reintentar"
          onAction={load}
        />
      ) : usuarios.length === 0 ? (
        <DataStatePanel
          status="empty"
          title="No hay usuarios para mostrar"
          message="Las nuevas solicitudes de acceso aparecerán en esta sección."
        />
      ) : usuarios.map(item => (
        <View key={item._id} style={styles.card}>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{item.nombre}</Text><Text>{item.email}</Text>
            <Text style={styles.status}>{item.estado} · {item.rol}</Text>
          </View>
          <View style={styles.actions}>
            {item.estado === 'pendiente' && roles.map(rol => (
              <Pressable key={rol} style={styles.button} onPress={() => update(() => usuariosService.aprobar(item._id, rol))}><Text style={styles.buttonText}>Aprobar {rol}</Text></Pressable>
            ))}
            {item.estado === 'activo' && item._id !== user._id && (
              <>
                {roles.filter(rol => rol !== item.rol).map(rol => (
                  <Pressable key={rol} style={styles.roleButton} onPress={() => update(() => usuariosService.cambiarRol(item._id, rol))}><Text style={styles.buttonText}>Hacer {rol}</Text></Pressable>
                ))}
                <Pressable style={styles.dangerButton} onPress={() => update(() => usuariosService.bloquear(item._id))}><Text style={styles.buttonText}>Bloquear</Text></Pressable>
              </>
            )}
            {item.estado === 'bloqueado' && (
              <Pressable style={styles.button} onPress={() => update(() => usuariosService.reactivar(item._id))}><Text style={styles.buttonText}>Reactivar</Text></Pressable>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: SPACING.lg, gap: SPACING.md, backgroundColor: COLORS.background, minHeight: '100%' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  title: { fontSize: 30, fontWeight: '700' }, subtitle: { color: '#52606d' },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 18, gap: 14 }, userInfo: { gap: 4 },
  name: { fontSize: 18, fontWeight: '700' }, status: { color: '#52606d', textTransform: 'capitalize' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { backgroundColor: '#146c43', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  roleButton: { backgroundColor: '#175cd3', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  dangerButton: { backgroundColor: '#b42318', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  buttonText: { color: '#fff', fontWeight: '600' }, secondaryButton: { borderWidth: 1, borderColor: '#9aa5b1', borderRadius: 8, padding: 10 }
});
