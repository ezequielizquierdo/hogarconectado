import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import { SolicitudTipo, solicitudesIncorporacionService } from '@/services/solicitudesIncorporacionService';

const options: { tipo: SolicitudTipo; icon: keyof typeof MaterialIcons.glyphMap; title: string; description: string }[] = [
  { tipo: 'productos', icon: 'inventory-2', title: 'Quiero sumar productos', description: 'Incorporá tus productos para que más vendedores puedan ofrecerlos.' },
  { tipo: 'vendedor', icon: 'storefront', title: 'Quiero vender', description: 'Ofrecé productos disponibles sin necesidad de comprar stock.' },
  { tipo: 'ambos', icon: 'handshake', title: 'Quiero hacer ambas cosas', description: 'Sumá tus productos y vendé también los de otras personas.' },
];
const channels = ['whatsapp', 'instagram', 'facebook', 'presencial'] as const;
const channelLabels: Record<string, string> = { whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook', presencial: 'Venta presencial' };

export default function SumateScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = Platform.OS === 'web' && width >= 880;
  const [tipo, setTipo] = useState<SolicitudTipo>('productos');
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', localidad: '', productosDescripcion: '', cantidadAproximada: '', experiencia: '', mensaje: '' });
  const [canales, setCanales] = useState<string[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const showsProducts = tipo === 'productos' || tipo === 'ambos';
  const showsSeller = tipo === 'vendedor' || tipo === 'ambos';
  const valid = useMemo(() => form.nombre.trim().length >= 2 && form.telefono.replace(/\D/g, '').length >= 8 && accepted, [accepted, form.nombre, form.telefono]);
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!valid || sending) return;
    setSending(true); setError('');
    try {
      await solicitudesIncorporacionService.crear({ tipo, ...form, canales, aceptaContacto: true });
      setSent(true);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'No pudimos enviar la solicitud. Intentá nuevamente.');
    } finally { setSending(false); }
  };

  if (sent) return (
    <View style={styles.successPage}>
      <View style={styles.successCard}>
        <View style={styles.successIcon}><MaterialIcons name="check" size={38} color={COLORS.ink} /></View>
        <Text style={styles.successTitle}>Recibimos tu solicitud</Text>
        <Text style={styles.successText}>Vamos a revisar la información y contactarte para explicarte los próximos pasos.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/productos')}><Text style={styles.primaryButtonText}>Volver al catálogo</Text></Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topbar}>
        <View style={styles.brand}><Image source={require('../assets/images/logo-transparent-circle.png')} style={styles.logo} /><View><Text style={styles.brandName}>Hogar Conectado</Text><Text style={styles.brandCaption}>Tu vidriera operativa</Text></View></View>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.close}><MaterialIcons name="close" size={24} color={COLORS.text} /></Pressable>
      </View>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>SUMATE A LA RED</Text>
        <Text style={styles.title}>¿Cómo querés participar?</Text>
        <Text style={styles.subtitle}>Contanos qué necesitás. Revisaremos tu solicitud antes de habilitar productos o accesos.</Text>
      </View>
      <View style={[styles.options, wide && styles.optionsWide]}>{options.map(option => (
        <Pressable key={option.tipo} onPress={() => setTipo(option.tipo)} style={[styles.option, wide && styles.optionWide, tipo === option.tipo && styles.optionActive]}>
          <View style={[styles.optionIcon, tipo === option.tipo && styles.optionIconActive]}><MaterialIcons name={option.icon} size={24} color={COLORS.ink} /></View>
          <Text style={styles.optionTitle}>{option.title}</Text><Text style={styles.optionDescription}>{option.description}</Text>
        </Pressable>
      ))}</View>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Tus datos</Text>
        <View style={[styles.fieldGrid, wide && styles.fieldGridWide]}>
          <Field label="Nombre y apellido *" value={form.nombre} onChangeText={value => update('nombre', value)} placeholder="¿Cómo te llamás?" />
          <Field label="Teléfono con prefijo *" value={form.telefono} onChangeText={value => update('telefono', value)} placeholder="Ej. +54 9 11 5555 1234" keyboardType="phone-pad" />
          <Field label="Email" value={form.email} onChangeText={value => update('email', value)} placeholder="nombre@email.com" keyboardType="email-address" />
          <Field label="Localidad" value={form.localidad} onChangeText={value => update('localidad', value)} placeholder="Ciudad o zona" />
        </View>
        {showsProducts ? <View style={styles.section}>
          <Text style={styles.formTitle}>Productos que querés sumar</Text>
          <Field label="¿Qué productos ofrecés?" value={form.productosDescripcion} onChangeText={value => update('productosDescripcion', value)} placeholder="Contanos el tipo, marca o rubro" multiline />
          <Field label="Cantidad aproximada de productos" value={form.cantidadAproximada} onChangeText={value => update('cantidadAproximada', value)} placeholder="Ej. 10" keyboardType="number-pad" />
        </View> : null}
        {showsSeller ? <View style={styles.section}>
          <Text style={styles.formTitle}>Cómo vendés o querés vender</Text>
          <Text style={styles.label}>Canales que usarías</Text>
          <View style={styles.channelList}>{channels.map(channel => <Pressable key={channel} onPress={() => setCanales(current => current.includes(channel) ? current.filter(item => item !== channel) : [...current, channel])} style={[styles.channel, canales.includes(channel) && styles.channelActive]}><MaterialIcons name={canales.includes(channel) ? 'check-circle' : 'radio-button-unchecked'} size={18} color={COLORS.primaryDark} /><Text style={styles.channelText}>{channelLabels[channel]}</Text></Pressable>)}</View>
          <Field label="Experiencia o forma de venta" value={form.experiencia} onChangeText={value => update('experiencia', value)} placeholder="No necesitás experiencia previa" multiline />
        </View> : null}
        <View style={styles.section}><Field label="¿Querés contarnos algo más?" value={form.mensaje} onChangeText={value => update('mensaje', value)} placeholder="Disponibilidad, dudas o información adicional" multiline /></View>
        <Pressable onPress={() => setAccepted(current => !current)} style={styles.consent}><MaterialIcons name={accepted ? 'check-box' : 'check-box-outline-blank'} size={23} color={COLORS.primaryDark} /><Text style={styles.consentText}>Acepto que Hogar Conectado use estos datos para contactarme sobre mi solicitud.</Text></Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable disabled={!valid || sending} onPress={submit} style={[styles.primaryButton, (!valid || sending) && styles.disabledButton]}>{sending ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.primaryButtonText}>Enviar solicitud</Text>}</Pressable>
        <Text style={styles.footerNote}>Enviar la solicitud no publica productos ni habilita accesos automáticamente.</Text>
      </View>
    </ScrollView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, multiline, ...inputProps } = props;
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...inputProps} multiline={multiline} placeholderTextColor={COLORS.textLight} style={[styles.input, multiline && styles.textarea]} /></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background }, content: { width: '100%', maxWidth: 1040, alignSelf: 'center', padding: SPACING.md, paddingBottom: SPACING.xxl },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl }, brand: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, logo: { width: 46, height: 46 }, brandName: { color: COLORS.ink, fontSize: 17, fontWeight: '800' }, brandCaption: { color: COLORS.textSecondary, fontSize: 11 }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  hero: { maxWidth: 700, marginBottom: SPACING.lg }, eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 1 }, title: { color: COLORS.ink, fontSize: 32, lineHeight: 39, fontWeight: '900', marginTop: 4 }, subtitle: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 23, marginTop: 5 },
  options: { gap: SPACING.sm, marginBottom: SPACING.lg }, optionsWide: { flexDirection: 'row' }, option: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, gap: 5 }, optionWide: { flex: 1 }, optionActive: { borderWidth: 2, borderColor: COLORS.primaryDark, backgroundColor: COLORS.cardBackground }, optionIcon: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }, optionIconActive: { backgroundColor: COLORS.primary }, optionTitle: { color: COLORS.ink, fontSize: 16, fontWeight: '800' }, optionDescription: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  formCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, ...SHADOWS.sm }, formTitle: { color: COLORS.ink, fontSize: 19, fontWeight: '800', marginBottom: SPACING.md }, fieldGrid: { gap: SPACING.md }, fieldGridWide: { flexDirection: 'row', flexWrap: 'wrap' }, field: { flex: 1, minWidth: 250, gap: 6 }, label: { color: COLORS.text, fontSize: 13, fontWeight: '700' }, input: { minHeight: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 11, color: COLORS.text, backgroundColor: COLORS.cardBackground, fontSize: 15 }, textarea: { minHeight: 92, textAlignVertical: 'top' }, section: { marginTop: SPACING.lg, gap: SPACING.md, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  channelList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, channel: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface }, channelActive: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.cardBackground }, channelText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  consent: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginTop: SPACING.lg }, consentText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 }, error: { color: COLORS.errorStrong, fontWeight: '700', marginTop: SPACING.md }, primaryButton: { minHeight: 50, marginTop: SPACING.lg, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.secondary, paddingHorizontal: SPACING.lg }, primaryButtonText: { color: COLORS.ink, fontWeight: '900', fontSize: 15 }, disabledButton: { opacity: 0.45 }, footerNote: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 12, marginTop: SPACING.sm },
  successPage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, backgroundColor: COLORS.background }, successCard: { width: '100%', maxWidth: 520, alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.md }, successIcon: { width: 70, height: 70, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.secondary }, successTitle: { color: COLORS.ink, fontSize: 25, fontWeight: '900', marginTop: SPACING.md, textAlign: 'center' }, successText: { color: COLORS.textSecondary, lineHeight: 22, textAlign: 'center', marginTop: SPACING.sm },
});
