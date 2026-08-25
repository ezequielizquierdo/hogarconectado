import { useAuth } from '@/contexts/AuthContext';
import { UserRole, Usuario } from '@/services/types';
import { usuariosService } from '@/services/usuariosService';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DataStatePanel } from '@/components/ui/DataStatePanel';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

const roles: UserRole[] = ['consulta', 'editor', 'admin'];
const roleInfo: Record<UserRole, { label: string; description: string }> = {
  consulta: { label: 'Consulta', description: 'Puede consultar información y gestionar únicamente sus propias cotizaciones.' },
  editor: { label: 'Editor', description: 'Puede cargar y modificar productos, imágenes y cotizaciones.' },
  admin: { label: 'Administrador', description: 'Puede administrar usuarios, permisos y toda la operación.' },
};
const statusInfo: Record<Usuario['estado'], { label: string; description: string }> = {
  pendiente: { label: 'Pendiente', description: 'Todavía no puede ingresar. Requiere aprobación y un rol.' },
  activo: { label: 'Activo', description: 'Puede ingresar y operar según el rol asignado.' },
  bloqueado: { label: 'Bloqueado', description: 'No puede ingresar hasta que un administrador lo reactive.' },
};

export default function UsuariosScreen() {
  const { user, logout } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setUsuarios(await usuariosService.listar()); }
    catch { setError('No pudimos cargar la lista de usuarios.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (id: string, action: () => Promise<Usuario>) => {
    if (processingId) return;
    setProcessingId(id);
    try { await action(); await load(); }
    catch (error: any) { Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el usuario.'); }
    finally { setProcessingId(null); }
  };

  const confirmAction = (
    item: Usuario,
    title: string,
    message: string,
    confirmLabel: string,
    action: () => Promise<Usuario>,
    destructive = false,
  ) => {
    const execute = () => update(item._id, action);
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) void execute();
      return;
    }
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: execute },
    ]);
  };

  const approve = (item: Usuario, rol: UserRole) => confirmAction(
    item,
    `Aprobar a ${item.nombre}`,
    `La cuenta quedará activa con el rol ${roleInfo[rol].label}. ${roleInfo[rol].description}`,
    'Aprobar acceso',
    () => usuariosService.aprobar(item._id, rol),
    rol === 'admin',
  );

  const changeRole = (item: Usuario, rol: UserRole) => confirmAction(
    item,
    'Confirmar cambio de rol',
    `${item.nombre} pasará de ${roleInfo[item.rol].label} a ${roleInfo[rol].label}. ${roleInfo[rol].description}`,
    'Cambiar rol',
    () => usuariosService.cambiarRol(item._id, rol),
    rol === 'admin',
  );

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
      <View style={styles.roleGuide}>
        <Text style={styles.guideTitle}>Qué permite cada rol</Text>
        {roles.map((rol) => (
          <View key={rol} style={styles.guideItem}>
            <Text style={styles.guideRole}>{roleInfo[rol].label}</Text>
            <Text style={styles.guideDescription}>{roleInfo[rol].description}</Text>
          </View>
        ))}
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
            <View style={styles.userHeading}>
              <Text style={styles.name}>{item.nombre}</Text>
              {item._id === user._id && <Text style={styles.youBadge}>Tu cuenta</Text>}
            </View>
            <Text style={styles.email}>{item.email}</Text>
            <View style={[styles.statusBadge, styles[`status_${item.estado}`]]}>
              <Text style={styles.statusText}>{statusInfo[item.estado].label}</Text>
            </View>
            <Text style={styles.statusDescription}>{statusInfo[item.estado].description}</Text>
            <Text style={styles.currentRole}>Rol actual: {roleInfo[item.rol].label}</Text>
          </View>
          <View style={styles.actions}>
            {item.estado === 'pendiente' && roles.map(rol => (
              <Pressable
                key={rol}
                accessibilityRole="button"
                accessibilityLabel={`Aprobar a ${item.nombre} como ${roleInfo[rol].label}`}
                disabled={Boolean(processingId)}
                style={({ pressed }) => [styles.button, (pressed || processingId === item._id) && styles.buttonPressed]}
                onPress={() => approve(item, rol)}
              ><Text style={styles.buttonText}>Aprobar como {roleInfo[rol].label}</Text></Pressable>
            ))}
            {item.estado === 'activo' && item._id !== user._id && (
              <>
                {roles.filter(rol => rol !== item.rol).map(rol => (
                  <Pressable key={rol} disabled={Boolean(processingId)} style={styles.roleButton} onPress={() => changeRole(item, rol)}><Text style={styles.buttonText}>Cambiar a {roleInfo[rol].label}</Text></Pressable>
                ))}
                <Pressable
                  disabled={Boolean(processingId)}
                  style={styles.dangerButton}
                  onPress={() => confirmAction(item, 'Bloquear acceso', `${item.nombre} perderá el acceso inmediatamente hasta que lo reactives.`, 'Bloquear', () => usuariosService.bloquear(item._id), true)}
                ><Text style={styles.buttonText}>Bloquear acceso</Text></Pressable>
              </>
            )}
            {item.estado === 'bloqueado' && (
              <Pressable
                disabled={Boolean(processingId)}
                style={styles.button}
                onPress={() => confirmAction(item, 'Reactivar acceso', `${item.nombre} podrá volver a ingresar con el rol ${roleInfo[item.rol].label}.`, 'Reactivar', () => usuariosService.reactivar(item._id))}
              ><Text style={styles.buttonText}>Reactivar acceso</Text></Pressable>
            )}
            {processingId === item._id && <Text style={styles.processingText}>Guardando cambio…</Text>}
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
  title: { fontSize: 30, fontWeight: '700', color: COLORS.text }, subtitle: { color: COLORS.textSecondary },
  roleGuide: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  guideTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  guideItem: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  guideRole: { color: COLORS.primaryDark, fontWeight: '700', minWidth: 110 },
  guideDescription: { color: COLORS.textSecondary, flex: 1, minWidth: 220 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 18, gap: 14, borderWidth: 1, borderColor: COLORS.border }, userInfo: { gap: SPACING.xs },
  userHeading: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.sm },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  email: { color: COLORS.textSecondary },
  youBadge: { color: COLORS.primaryDark, backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm, fontSize: 12, fontWeight: '700' },
  statusBadge: { alignSelf: 'flex-start', borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, marginTop: SPACING.xs },
  status_pendiente: { backgroundColor: COLORS.warning },
  status_activo: { backgroundColor: COLORS.success },
  status_bloqueado: { backgroundColor: COLORS.error },
  statusText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  statusDescription: { color: COLORS.textSecondary, fontSize: 13 },
  currentRole: { color: COLORS.text, fontWeight: '600', marginTop: SPACING.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { backgroundColor: COLORS.secondaryDark, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  roleButton: { backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  dangerButton: { backgroundColor: COLORS.error, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  buttonPressed: { opacity: 0.65 },
  buttonText: { color: COLORS.text, fontWeight: '700' },
  processingText: { color: COLORS.textSecondary, alignSelf: 'center' },
  secondaryButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: 10, minHeight: 44, justifyContent: 'center' }
});
