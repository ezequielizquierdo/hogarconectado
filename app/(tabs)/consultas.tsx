import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DataStatePanel } from '@/components/ui/DataStatePanel';
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useConsultasResumen } from '@/contexts/ConsultasContext';
import consultasService from '@/services/consultasService';
import { ConsultaComercial, ConsultaEstado } from '@/services/types';
import webPushService, { WebPushState } from '@/services/webPushService';

const ESTADOS: { value: ConsultaEstado | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'nueva', label: 'Nuevas' },
  { value: 'en-gestion', label: 'En gestión' },
  { value: 'contactada', label: 'Contactadas' },
  { value: 'cerrada', label: 'Cerradas' },
];

const ESTADO_LABEL: Record<ConsultaEstado, string> = {
  nueva: 'Nueva',
  'en-gestion': 'En gestión',
  contactada: 'Contactada',
  cerrada: 'Cerrada',
};

const ESTADO_STYLE: Record<ConsultaEstado, 'status_nueva' | 'status_en_gestion' | 'status_contactada' | 'status_cerrada'> = {
  nueva: 'status_nueva',
  'en-gestion': 'status_en_gestion',
  contactada: 'status_contactada',
  cerrada: 'status_cerrada',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export default function ConsultasScreen() {
  const { user } = useAuth();
  const { refresh: refreshSummary } = useConsultasResumen();
  const [consultas, setConsultas] = useState<ConsultaComercial[]>([]);
  const [filtro, setFiltro] = useState<ConsultaEstado | 'todas'>('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pushState, setPushState] = useState<WebPushState | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushTestLoading, setPushTestLoading] = useState(false);
  const [pushErrorMessage, setPushErrorMessage] = useState('');

  useEffect(() => {
    if (user?.rol !== 'admin') return;
    void webPushService.getState().then(setPushState).catch(() => undefined);
  }, [user?.rol]);

  const load = useCallback(async (silent = false) => {
    if (user?.rol !== 'admin') return;
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      setConsultas(await consultasService.listar(filtro === 'todas' ? undefined : filtro));
      await refreshSummary();
    } catch {
      if (!silent) setError('No pudimos cargar las consultas.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filtro, refreshSummary, user?.rol]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    if (Platform.OS !== 'web' || user?.rol !== 'admin') return;

    const refreshVisible = () => {
      if (document.visibilityState === 'visible') void load(true);
    };
    const handlePushMessage = (event: MessageEvent) => {
      if (event.data?.type === 'HC_CONSULTA_NUEVA') void load(true);
    };
    const intervalId = window.setInterval(refreshVisible, 30_000);

    document.addEventListener('visibilitychange', refreshVisible);
    window.addEventListener('focus', refreshVisible);
    navigator.serviceWorker?.addEventListener('message', handlePushMessage);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshVisible);
      window.removeEventListener('focus', refreshVisible);
      navigator.serviceWorker?.removeEventListener('message', handlePushMessage);
    };
  }, [load, user?.rol]);

  const totals = useMemo(() => ({
    nuevas: consultas.filter(item => item.estado === 'nueva').length,
    abiertas: consultas.filter(item => ['nueva', 'en-gestion'].includes(item.estado)).length,
  }), [consultas]);

  const updateStatus = async (item: ConsultaComercial, estado: ConsultaEstado) => {
    if (processingId || item.estado === estado) return;
    setProcessingId(item._id);
    try {
      const updated = await consultasService.cambiarEstado(item._id, estado);
      setConsultas(current => current.map(value => value._id === updated._id ? updated : value));
      await refreshSummary();
    } catch (requestError: any) {
      Alert.alert('No se pudo actualizar', requestError.response?.data?.message || 'Intentá nuevamente.');
    } finally {
      setProcessingId(null);
    }
  };

  const openWhatsApp = async (item: ConsultaComercial) => {
    const digits = item.contacto.telefono.replace(/\D/g, '');
    const message = `Hola ${item.contacto.nombre}, te contacto de Hogar Conectado por tu consulta sobre ${item.productoSnapshot.marca} ${item.productoSnapshot.modelo}.`;
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    if (Platform.OS === 'web') window.open(url, '_blank', 'noopener,noreferrer');
    else await Linking.openURL(url);
  };

  const copyPhone = async (phone: string) => {
    await Clipboard.setStringAsync(phone);
    Alert.alert('Teléfono copiado', 'Ya podés pegarlo donde lo necesites.');
  };

  const togglePush = async () => {
    if (pushLoading || !pushState?.supported) return;
    setPushLoading(true);
    setPushErrorMessage('');
    try {
      const next = pushState.subscribed
        ? await webPushService.unsubscribe()
        : await webPushService.subscribe();
      setPushState(next);
    } catch (pushError: any) {
      const message = pushError.response?.data?.message || pushError.message || 'Intentá nuevamente.';
      setPushErrorMessage(message);
      Alert.alert('No pudimos activar los avisos', message);
      setPushState(await webPushService.getState().catch(() => pushState));
    } finally {
      setPushLoading(false);
    }
  };

  const testPush = async () => {
    if (pushTestLoading) return;
    setPushTestLoading(true);
    try {
      const result = await webPushService.sendTest();
      Alert.alert(
        'El proveedor aceptó la prueba',
        `Envíos aceptados: ${result.sent}. Si no apareció el aviso, probá la comprobación local.`,
      );
    } catch (pushError: any) {
      Alert.alert('La prueba no llegó al proveedor', pushError.response?.data?.message || 'Intentá desactivar y volver a activar los avisos.');
    } finally {
      setPushTestLoading(false);
    }
  };

  const testLocalNotification = async () => {
    try {
      await webPushService.showLocalTest();
    } catch (notificationError: any) {
      Alert.alert('No pudimos mostrar el aviso local', notificationError.message || 'Revisá los permisos del navegador.');
    }
  };

  if (user?.rol !== 'admin') return (
    <View style={styles.center}>
      <DataStatePanel status="error" title="Acceso restringido" message="Solo los administradores pueden gestionar consultas." />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ATENCIÓN COMERCIAL</Text>
          <Text style={styles.title}>Consultas</Text>
          <Text style={styles.subtitle}>Respondé y seguí cada interés recibido desde el catálogo.</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}><Text style={styles.summaryValue}>{totals.nuevas}</Text><Text style={styles.summaryLabel}>Nuevas visibles</Text></View>
          <View style={styles.summaryCard}><Text style={styles.summaryValue}>{totals.abiertas}</Text><Text style={styles.summaryLabel}>Abiertas visibles</Text></View>
        </View>
      </View>

      {Platform.OS === 'web' && pushState && (
        <View style={styles.pushCard}>
          <View style={styles.pushIcon}><MaterialIcons name="notifications-active" size={23} color={COLORS.primaryDark} /></View>
          <View style={styles.pushCopy}>
            <Text style={styles.pushTitle}>{pushState.subscribed ? 'Avisos activados' : 'Avisos de nuevas consultas'}</Text>
            <Text style={styles.pushDescription}>
              {!pushState.supported
                ? 'En iPhone, agregá Hogar Conectado a la pantalla de inicio y abrilo desde su icono para activar avisos.'
                : pushState.permission === 'denied'
                  ? 'Los avisos están bloqueados en la configuración del navegador o del dispositivo.'
                  : pushState.subscribed
                    ? 'Este dispositivo recibirá un aviso cuando llegue una consulta.'
                    : 'Activá los avisos en este dispositivo. La bandeja seguirá disponible aunque estén desactivados.'}
            </Text>
            {!!pushErrorMessage && <Text style={styles.pushError}>{pushErrorMessage}</Text>}
          </View>
          {pushState.supported && pushState.permission !== 'denied' && (
            <View style={styles.pushActions}>
              {pushState.subscribed && (
                <>
                  <Pressable onPress={() => void testLocalNotification()} style={styles.pushButtonSecondary}>
                    <Text style={styles.pushButtonText}>Prueba local</Text>
                  </Pressable>
                  <Pressable disabled={pushTestLoading} onPress={() => void testPush()} style={styles.pushButton}>
                    <Text style={styles.pushButtonText}>{pushTestLoading ? 'Enviando…' : 'Probar Push'}</Text>
                  </Pressable>
                </>
              )}
              <Pressable
                disabled={pushLoading}
                onPress={() => void togglePush()}
                style={[styles.pushButton, pushState.subscribed && styles.pushButtonSecondary]}
              >
                <Text style={styles.pushButtonText}>
                  {pushLoading ? 'Procesando…' : pushState.subscribed ? 'Desactivar' : 'Activar avisos'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {ESTADOS.map(option => (
          <Pressable
            key={option.value}
            onPress={() => setFiltro(option.value)}
            style={[styles.filterChip, filtro === option.value && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filtro === option.value && styles.filterTextActive]}>{option.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <DataStatePanel status="loading" title="Cargando consultas…" message="Estamos buscando los contactos pendientes." />
      ) : error ? (
        <DataStatePanel status="error" title="No pudimos cargar las consultas" message={error} actionLabel="Reintentar" onAction={() => void load()} />
      ) : consultas.length === 0 ? (
        <DataStatePanel status="empty" title="No hay consultas en este estado" message="Cuando alguien consulte por un producto, aparecerá acá." />
      ) : (
        <View style={styles.list}>
          {consultas.map(item => (
            <View key={item._id} style={[styles.card, item.estado === 'nueva' && styles.cardNew]}>
              <View style={styles.productRow}>
                <View style={styles.imageBox}>
                  {item.productoSnapshot.imagen
                    ? <Image source={{ uri: item.productoSnapshot.imagen }} style={styles.image} contentFit="contain" />
                    : <MaterialIcons name="inventory-2" size={30} color={COLORS.textLight} />}
                </View>
                <View style={styles.productInfo}>
                  <View style={[styles.statusBadge, styles[ESTADO_STYLE[item.estado]]]}>
                    <Text style={styles.statusText}>{ESTADO_LABEL[item.estado]}</Text>
                  </View>
                  <Text style={styles.brand}>{item.productoSnapshot.marca}</Text>
                  <Text style={styles.model}>{item.productoSnapshot.modelo}</Text>
                  {item.productoSnapshot.precioContado != null && (
                    <Text style={styles.price}>${item.productoSnapshot.precioContado.toLocaleString('es-AR')}</Text>
                  )}
                </View>
              </View>

              <View style={styles.contactBox}>
                <View style={styles.contactCopy}>
                  <Text style={styles.contactName}>{item.contacto.nombre}</Text>
                  <Text style={styles.phone}>{item.contacto.telefono}</Text>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                  {item.asignadaA && <Text style={styles.owner}>Responsable: {item.asignadaA.nombre}</Text>}
                </View>
                <View style={styles.contactActions}>
                  <Pressable onPress={() => void copyPhone(item.contacto.telefono)} style={styles.iconButton} accessibilityLabel="Copiar teléfono">
                    <MaterialIcons name="content-copy" size={20} color={COLORS.text} />
                  </Pressable>
                  <Pressable onPress={() => void openWhatsApp(item)} style={styles.whatsappButton} accessibilityLabel="Responder por WhatsApp">
                    <MaterialIcons name="chat" size={20} color={COLORS.ink} />
                    <Text style={styles.whatsappText}>WhatsApp</Text>
                  </Pressable>
                </View>
              </View>

              <Text style={styles.statusTitle}>Actualizar seguimiento</Text>
              <View style={styles.statusActions}>
                {ESTADOS.filter(option => option.value !== 'todas').map(option => (
                  <Pressable
                    key={option.value}
                    disabled={Boolean(processingId)}
                    onPress={() => void updateStatus(item, option.value as ConsultaEstado)}
                    style={[styles.statusButton, item.estado === option.value && styles.statusButtonActive]}
                  >
                    <Text style={[styles.statusButtonText, item.estado === option.value && styles.statusButtonTextActive]}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
              {processingId === item._id && <Text style={styles.processing}>Guardando estado…</Text>}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { minHeight: '100%', padding: SPACING.lg, gap: SPACING.md, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: SPACING.md },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: COLORS.text, fontSize: 30, fontWeight: '800' },
  subtitle: { marginTop: SPACING.xs, color: COLORS.textSecondary, fontSize: 14 },
  summaryRow: { flexDirection: 'row', gap: SPACING.sm },
  summaryCard: { minWidth: 110, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  summaryValue: { color: COLORS.primaryDark, fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 11 },
  pushCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  pushIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.cardBackground },
  pushCopy: { flex: 1, minWidth: 220 },
  pushTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  pushDescription: { marginTop: 3, color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  pushError: { marginTop: SPACING.sm, color: COLORS.errorStrong, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  pushButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  pushActions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pushButtonSecondary: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  pushButtonText: { color: COLORS.ink, fontWeight: '800' },
  filters: { gap: SPACING.sm, paddingVertical: SPACING.xs },
  filterChip: { minHeight: 42, justifyContent: 'center', paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  filterChipActive: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.cardBackground },
  filterText: { color: COLORS.textSecondary, fontWeight: '700' },
  filterTextActive: { color: COLORS.primaryDark },
  list: { gap: SPACING.md },
  card: { padding: SPACING.md, gap: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, ...SHADOWS.sm },
  cardNew: { borderTopWidth: 4, borderTopColor: COLORS.primaryDark },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  imageBox: { width: 104, height: 104, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  image: { width: '100%', height: '100%' },
  productInfo: { flex: 1, alignItems: 'flex-start' },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm, marginBottom: SPACING.sm },
  status_nueva: { backgroundColor: COLORS.primary },
  status_en_gestion: { backgroundColor: COLORS.warning },
  status_contactada: { backgroundColor: COLORS.secondary },
  status_cerrada: { backgroundColor: COLORS.border },
  statusText: { color: COLORS.ink, fontSize: 11, fontWeight: '800' },
  brand: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  model: { marginTop: 2, color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  price: { marginTop: SPACING.sm, color: COLORS.primaryDark, fontSize: 19, fontWeight: '800' },
  contactBox: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  contactCopy: { flex: 1, minWidth: 180 },
  contactName: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  phone: { marginTop: 2, color: COLORS.text, fontSize: 15 },
  date: { marginTop: SPACING.xs, color: COLORS.textSecondary, fontSize: 12 },
  owner: { marginTop: SPACING.xs, color: COLORS.primaryDark, fontSize: 12, fontWeight: '700' },
  contactActions: { flexDirection: 'row', gap: SPACING.sm },
  iconButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  whatsappButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.secondaryDark },
  whatsappText: { color: COLORS.ink, fontWeight: '800' },
  statusTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
  statusActions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statusButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  statusButtonActive: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.primary },
  statusButtonText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  statusButtonTextActive: { color: COLORS.ink },
  processing: { color: COLORS.textSecondary, fontSize: 12 },
});
