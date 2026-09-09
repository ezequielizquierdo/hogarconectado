import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import publicQuotesService, { PublicOrderResult, PublicQuote } from '@/services/publicQuotesService';

const money = (value: number) => `$ ${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
const paymentLabel = { contado: 'Contado', facturado: 'Facturado', '3-cuotas': '3 cuotas', '6-cuotas': '6 cuotas' };

export default function PublicQuoteScreen() {
  const { token: rawToken } = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [order, setOrder] = useState<PublicOrderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [reportingPayment, setReportingPayment] = useState(false);
  const [error, setError] = useState('');
  const acceptanceKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!token) { setError('El enlace de cotización no es válido.'); setLoading(false); return; }
    void publicQuotesService.get(token)
      .then(setQuote)
      .catch((requestError: any) => setError(requestError.response?.data?.message || 'No pudimos cargar la cotización.'))
      .finally(() => setLoading(false));
  }, [token]);

  const accept = async () => {
    if (!token || accepting) return;
    setAccepting(true);
    setError('');
    try {
      acceptanceKey.current ||= `aceptar-${token.slice(0, 12)}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const response = await publicQuotesService.accept(token, acceptanceKey.current);
      setOrder(response.data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'No pudimos reservar los productos. Intentá nuevamente.');
    } finally {
      setAccepting(false);
    }
  };

  const currentOrder = order || quote?.pedido;
  const reservationActive = currentOrder?.estado === 'reserva-pendiente';
  const paymentReported = currentOrder?.estado === 'pago-informado';
  const paymentConfirmed = currentOrder?.estado === 'pago-confirmado';

  const confirmPaymentReport = () => {
    const message = 'Confirmá solo si ya realizaste el pago. Hogar Conectado verificará la operación antes de aprobarla.';
    if (Platform.OS === 'web') return Promise.resolve(window.confirm(message));
    return new Promise<boolean>((resolve) => Alert.alert('¿Ya realizaste el pago?', message, [
      { text: 'Todavía no', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Sí, informar pago', onPress: () => resolve(true) },
    ]));
  };

  const reportPayment = async () => {
    if (!token || reportingPayment || !(await confirmPaymentReport())) return;
    setReportingPayment(true);
    setError('');
    try {
      const response = await publicQuotesService.reportPayment(token);
      setOrder(response.data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'No pudimos informar el pago. Intentá nuevamente.');
    } finally {
      setReportingPayment(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.brand}><View style={styles.logo}><MaterialIcons name="home" size={26} color={COLORS.primaryDark} /></View><View><Text style={styles.brandName}>Hogar Conectado</Text><Text style={styles.brandTagline}>Tu propuesta comercial</Text></View></View>
      {loading ? <View style={styles.state}><ActivityIndicator color={COLORS.primaryDark} /><Text style={styles.muted}>Preparando tu cotización…</Text></View> : null}
      {!loading && error && !quote ? <View style={styles.state}><MaterialIcons name="error-outline" size={42} color={COLORS.errorStrong} /><Text style={styles.title}>No pudimos abrirla</Text><Text style={styles.muted}>{error}</Text></View> : null}
      {quote ? <View style={styles.card}>
        <Text style={styles.eyebrow}>COTIZACIÓN</Text>
        <Text style={styles.title}>Hola, {quote.cliente}</Text>
        <Text style={styles.muted}>{quote.vendedor} preparó esta propuesta para vos.</Text>
        <View style={styles.divider} />
        {quote.productos.map((product, index) => <View key={`${product.marca}-${product.modelo}-${index}`} style={styles.product}>
          <View style={styles.imageBox}>{product.imagen ? <Image source={{ uri: product.imagen }} style={styles.image} contentFit="contain" /> : <MaterialIcons name="inventory-2" size={28} color={COLORS.textSecondary} />}</View>
          <View style={styles.productCopy}><Text style={styles.productName}>{product.marca} {product.modelo}</Text><Text style={styles.muted}>{product.cantidad} {product.cantidad === 1 ? 'unidad' : 'unidades'} · {money(product.precioUnitario)} c/u</Text></View>
          <Text style={styles.productSubtotal}>{money(product.subtotal)}</Text>
        </View>)}
        <View style={styles.totalRow}><View><Text style={styles.totalLabel}>{paymentLabel[quote.modalidadPago]}</Text><Text style={styles.muted}>{quote.cuotas ? `${quote.cuotas.cantidad} cuotas de ${money(quote.cuotas.monto)}` : 'Total de la propuesta'}</Text></View><Text style={styles.total}>{money(quote.total)}</Text></View>
        {quote.observaciones ? <Text style={styles.notes}>{quote.observaciones}</Text> : null}
        {currentOrder ? <>
          <View style={reservationActive || paymentReported || paymentConfirmed ? styles.success : styles.inactive}><MaterialIcons name={paymentConfirmed ? 'verified' : paymentReported ? 'hourglass-top' : reservationActive ? 'check-circle' : 'schedule'} size={34} color={paymentConfirmed || paymentReported || reservationActive ? '#25835b' : COLORS.textSecondary} /><View style={styles.successCopy}><Text style={styles.successTitle}>{paymentConfirmed ? 'Pago confirmado' : paymentReported ? 'Pago informado' : reservationActive ? 'Productos reservados' : 'La reserva ya no está activa'}</Text><Text style={styles.muted}>{paymentConfirmed ? 'La compra fue confirmada por Hogar Conectado.' : paymentReported ? 'Recibimos tu aviso y estamos verificando el pago. No necesitás informarlo nuevamente.' : reservationActive ? 'La reserva dura 24 horas. El pago todavía está pendiente.' : 'Contactá al vendedor para solicitar una nueva cotización.'}</Text>{reservationActive && currentOrder ? <Text style={styles.expiry}>Vence: {new Date(currentOrder.reservaVenceAt).toLocaleString('es-AR')}</Text> : null}</View></View>
          {reservationActive ? <>
            <Text style={styles.paymentHelp}>Cuando hayas realizado el pago, avisá desde este botón para que podamos verificarlo.</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable onPress={() => void reportPayment()} disabled={reportingPayment} style={({ pressed }) => [styles.button, styles.paymentButton, pressed && styles.pressed, reportingPayment && styles.disabled]}>{reportingPayment ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.buttonText}>Ya realicé el pago</Text>}</Pressable>
          </> : null}
        </> : <>
          <Text style={styles.disclaimer}>Al aceptar, reservaremos estas unidades durante 24 horas. Esto no confirma ni cobra el pago.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={accept} disabled={accepting} style={({ pressed }) => [styles.button, pressed && styles.pressed, accepting && styles.disabled]}>{accepting ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.buttonText}>Aceptar y reservar 24 h</Text>}</Pressable>
        </>}
      </View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.background },
  brand: { width: '100%', maxWidth: 680, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  logo: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary },
  brandName: { color: COLORS.text, fontSize: 19, fontWeight: '800' }, brandTagline: { color: COLORS.textSecondary, fontSize: 12 },
  card: { width: '100%', maxWidth: 680, padding: SPACING.lg, gap: SPACING.md, borderWidth: 1, borderTopWidth: 4, borderColor: COLORS.border, borderTopColor: COLORS.primary, borderRadius: RADIUS.xl, backgroundColor: COLORS.surface, ...SHADOWS.md },
  state: { flex: 1, minHeight: 360, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 1 }, title: { color: COLORS.text, fontSize: 26, fontWeight: '800' }, muted: { color: COLORS.textSecondary, lineHeight: 20 },
  divider: { height: 1, backgroundColor: COLORS.border }, product: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  imageBox: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.sm, backgroundColor: COLORS.surface }, image: { width: '100%', height: '100%' }, productCopy: { flex: 1 }, productName: { color: COLORS.text, fontWeight: '800' },
  productSubtotal: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm }, totalLabel: { color: COLORS.text, fontWeight: '800' }, total: { color: COLORS.primaryDark, fontSize: 25, fontWeight: '800' },
  notes: { padding: SPACING.md, color: COLORS.textSecondary, backgroundColor: COLORS.cardBackground, borderRadius: RADIUS.md }, disclaimer: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 }, error: { color: COLORS.errorStrong, fontWeight: '700' },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.primary }, buttonText: { color: COLORS.ink, fontWeight: '800' }, pressed: { opacity: 0.8 }, disabled: { opacity: 0.65 },
  paymentHelp: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 }, paymentButton: { backgroundColor: COLORS.secondaryDark },
  success: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.secondary }, successCopy: { flex: 1 }, successTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' }, expiry: { marginTop: 4, color: COLORS.text, fontSize: 12, fontWeight: '700' },
  inactive: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
});
