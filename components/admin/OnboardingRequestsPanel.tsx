import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { SolicitudEstado, SolicitudIncorporacion, solicitudesIncorporacionService } from '@/services/solicitudesIncorporacionService';

const typeLabel = { productos: 'Aporta productos', vendedor: 'Quiere vender', ambos: 'Productos y ventas' };
const stateLabel = { nueva: 'Nueva', contactada: 'Contactada', aprobada: 'Aprobada', rechazada: 'Rechazada' };

export function OnboardingRequestsPanel() {
  const [items, setItems] = useState<SolicitudIncorporacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await solicitudesIncorporacionService.listar()); }
    catch { Alert.alert('Solicitudes', 'No pudimos cargar las solicitudes para sumarse.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const update = async (item: SolicitudIncorporacion, estado: SolicitudEstado) => {
    if (processing) return;
    setProcessing(item._id);
    try { await solicitudesIncorporacionService.actualizar(item._id, estado, item.notasAdmin); await load(); }
    catch (error: any) { Alert.alert('No se pudo actualizar', error.response?.data?.message || 'Intentá nuevamente.'); }
    finally { setProcessing(null); }
  };

  return <View style={styles.panel}>
    <View style={styles.heading}><View style={styles.headingCopy}><Text style={styles.eyebrow}>INCORPORACIÓN</Text><Text style={styles.title}>Personas que quieren sumarse</Text><Text style={styles.subtitle}>Contactá y evaluá cada solicitud antes de habilitar accesos o publicar productos.</Text></View><Pressable onPress={load} style={styles.refresh}><MaterialIcons name="refresh" size={20} color={COLORS.primaryDark} /></Pressable></View>
    {loading && items.length === 0 ? <Text style={styles.empty}>Cargando solicitudes…</Text> : items.length === 0 ? <Text style={styles.empty}>Todavía no recibimos solicitudes.</Text> : <View style={styles.grid}>{items.map(item => <View key={item._id} style={styles.card}>
      <View style={styles.cardTop}><Text style={styles.name}>{item.contacto.nombre}</Text><View style={[styles.badge, styles[`state_${item.estado}`]]}><Text style={styles.badgeText}>{stateLabel[item.estado]}</Text></View></View>
      <Text style={styles.type}>{typeLabel[item.tipo]}</Text>
      <Text style={styles.contact}>{item.contacto.telefono}{item.contacto.email ? ` · ${item.contacto.email}` : ''}</Text>
      {item.contacto.localidad ? <Text style={styles.contact}>{item.contacto.localidad}</Text> : null}
      {item.productos?.descripcion ? <Text style={styles.detail}><Text style={styles.detailStrong}>Productos: </Text>{item.productos.descripcion}</Text> : null}
      {item.vendedor?.experiencia ? <Text style={styles.detail}><Text style={styles.detailStrong}>Experiencia: </Text>{item.vendedor.experiencia}</Text> : null}
      {item.vendedor?.canales?.length ? <Text style={styles.detail}><Text style={styles.detailStrong}>Canales: </Text>{item.vendedor.canales.join(', ')}</Text> : null}
      {item.mensaje ? <Text style={styles.detail}>{item.mensaje}</Text> : null}
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('es-AR')}</Text>
      <View style={styles.actions}>
        {item.estado === 'nueva' ? <Action label="Marcar contactada" onPress={() => update(item, 'contactada')} /> : null}
        {item.estado !== 'aprobada' ? <Action label="Aprobar" onPress={() => update(item, 'aprobada')} accent /> : null}
        {item.estado !== 'rechazada' ? <Action label="Rechazar" onPress={() => update(item, 'rechazada')} danger /> : null}
      </View>
      {processing === item._id ? <Text style={styles.processing}>Guardando…</Text> : null}
    </View>)}</View>}
  </View>;
}

function Action({ label, onPress, accent, danger }: { label: string; onPress: () => void; accent?: boolean; danger?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.action, accent && styles.actionAccent, danger && styles.actionDanger]}><Text style={styles.actionText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  panel: { gap: SPACING.md, marginBottom: SPACING.md }, heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.md }, headingCopy: { flex: 1, minWidth: 0 }, eyebrow: { color: COLORS.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 1 }, title: { color: COLORS.ink, fontSize: 20, fontWeight: '800', marginTop: 2 }, subtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 3 }, refresh: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface }, empty: { color: COLORS.textSecondary, paddingVertical: SPACING.md }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }, card: { flexGrow: 1, flexBasis: 360, maxWidth: 620, gap: 5, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderTopWidth: 4, borderColor: COLORS.border, borderTopColor: COLORS.secondaryDark, backgroundColor: COLORS.surface }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.sm }, name: { color: COLORS.ink, fontSize: 17, fontWeight: '800', flex: 1 }, type: { color: COLORS.primaryDark, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' }, contact: { color: COLORS.textSecondary, fontSize: 13 }, detail: { color: COLORS.text, fontSize: 13, lineHeight: 18, marginTop: 3 }, detailStrong: { fontWeight: '800' }, date: { color: COLORS.textLight, fontSize: 11, marginTop: 4 }, badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: RADIUS.full }, badgeText: { color: COLORS.ink, fontSize: 11, fontWeight: '800' }, state_nueva: { backgroundColor: COLORS.warning }, state_contactada: { backgroundColor: COLORS.info }, state_aprobada: { backgroundColor: COLORS.success }, state_rechazada: { backgroundColor: COLORS.error }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border }, action: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 11, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border }, actionAccent: { backgroundColor: COLORS.secondary }, actionDanger: { backgroundColor: COLORS.error }, actionText: { color: COLORS.text, fontSize: 12, fontWeight: '800' }, processing: { color: COLORS.textSecondary, fontSize: 12 },
});
