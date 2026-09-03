import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import consultasService from '@/services/consultasService';
import { Producto } from '@/services/types';

type Step = 'form' | 'confirm' | 'success';

interface ConsultaProductoModalProps {
  visible: boolean;
  productos: Producto[];
  initialName?: string;
  onRemoveProduct: (id: string) => void;
  onSuccessClose: () => void;
  onClose: () => void;
}

const PHONE_PREFIXES = [
  { label: 'Argentina (+54)', value: '+54' },
  { label: 'Uruguay (+598)', value: '+598' },
  { label: 'Paraguay (+595)', value: '+595' },
  { label: 'Chile (+56)', value: '+56' },
  { label: 'Bolivia (+591)', value: '+591' },
  { label: 'Brasil (+55)', value: '+55' },
  { label: 'Perú (+51)', value: '+51' },
];

export function ConsultaProductoModal({ visible, productos, initialName = '', onRemoveProduct, onSuccessClose, onClose }: ConsultaProductoModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [prefix, setPrefix] = useState('+54');
  const [prefixOpen, setPrefixOpen] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const idempotencyKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;
    setStep('form');
    setNombre(initialName);
    setTelefono('');
    setPrefix('+54');
    setPrefixOpen(false);
    setError('');
    setSending(false);
    idempotencyKey.current = undefined;
  }, [visible, initialName]);

  const validate = () => {
    const normalizedName = nombre.trim().replace(/\s+/g, ' ');
    const digits = `${prefix}${telefono}`.replace(/\D/g, '');
    if (normalizedName.length < 2) {
      setError('Ingresá tu nombre para que podamos contactarte.');
      return false;
    }
    if (digits.length < 8 || digits.length > 15) {
      setError('Ingresá un teléfono válido, con código de área.');
      return false;
    }
    setError('');
    return true;
  };

  const continueToConfirmation = () => {
    if (validate()) setStep('confirm');
  };

  const submit = async () => {
    if (!productos.length || sending) return;
    setSending(true);
    setError('');
    try {
      const result = await consultasService.crear({
        productoIds: productos.map(producto => producto._id),
        nombre: nombre.trim().replace(/\s+/g, ' '),
        telefono: `${prefix}${telefono.replace(/\D/g, '')}`,
      }, idempotencyKey.current);
      idempotencyKey.current = result.idempotencyKey;
      setStep('success');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'No pudimos enviar la consulta. Intentá nuevamente.');
    } finally {
      setSending(false);
    }
  };

  if (!productos.length) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={sending ? undefined : onClose} />
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>LISTA DE INTERÉS</Text>
              <Text style={styles.title}>
                {step === 'success' ? 'Consulta recibida' : `Tus productos (${productos.length})`}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              disabled={sending}
              accessibilityRole="button"
              accessibilityLabel="Cerrar consulta"
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={22} color={COLORS.text} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {productos.map(producto => (
            <View key={producto._id} style={styles.productSummary}>
              <View style={styles.imageBox}>
                {producto.imagenes?.[0] ? (
                  <Image source={{ uri: producto.imagenes[0] }} style={styles.image} contentFit="contain" />
                ) : (
                  <MaterialIcons name="inventory-2" size={30} color={COLORS.textSecondary} />
                )}
              </View>
              <View style={styles.productCopy}>
                <Text style={styles.productBrand}>{producto.marca}</Text>
                <Text style={styles.productModel}>{producto.modelo}</Text>
                <Text style={styles.productPrice}>
                  ${(producto.precioConGanancia ?? 0).toLocaleString('es-AR')}
                </Text>
              </View>
              {step === 'form' && productos.length > 1 ? (
                <Pressable onPress={() => onRemoveProduct(producto._id)} style={styles.removeButton} accessibilityLabel={`Quitar ${producto.marca} ${producto.modelo}`}>
                  <MaterialIcons name="close" size={20} color={COLORS.errorStrong} />
                </Pressable>
              ) : null}
            </View>
            ))}

            {step === 'form' && (
              <>
                <Text style={styles.help}>Dejanos tus datos únicamente para responder esta consulta.</Text>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Tu nombre"
                  placeholderTextColor={COLORS.textLight}
                  autoComplete="name"
                  style={styles.input}
                  editable={!initialName}
                />
                <Text style={styles.label}>País / prefijo *</Text>
                <Pressable onPress={() => setPrefixOpen(current => !current)} style={styles.inputSelector}>
                  <Text style={styles.selectorText}>{PHONE_PREFIXES.find(option => option.value === prefix)?.label}</Text>
                  <MaterialIcons name={prefixOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color={COLORS.textSecondary} />
                </Pressable>
                {prefixOpen ? <View style={styles.prefixMenu}>{PHONE_PREFIXES.map(option => (
                  <Pressable key={option.value} onPress={() => { setPrefix(option.value); setPrefixOpen(false); }} style={styles.prefixOption}>
                    <Text style={styles.selectorText}>{option.label}</Text>
                  </Pressable>
                ))}</View> : null}
                <Text style={styles.label}>Número de teléfono *</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.prefixBadge}><Text style={styles.prefixText}>{prefix}</Text></View>
                  <TextInput
                    value={telefono}
                    onChangeText={setTelefono}
                    placeholder="11 5555 1234"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    style={[styles.input, styles.phoneInput]}
                  />
                </View>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable onPress={continueToConfirmation} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Continuar</Text>
                </Pressable>
              </>
            )}

            {step === 'confirm' && (
              <>
                <View style={styles.confirmBox}>
                  <MaterialIcons name="help-outline" size={28} color={COLORS.primaryDark} />
                  <Text style={styles.confirmTitle}>¿Querés consultar por {productos.length === 1 ? 'este producto' : `estos ${productos.length} productos`}?</Text>
                  <Text style={styles.confirmText}>Te contactaremos al {prefix} {telefono.trim()}.</Text>
                </View>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <View style={styles.buttonRow}>
                  <Pressable disabled={sending} onPress={() => setStep('form')} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>No, volver</Text>
                  </Pressable>
                  <Pressable disabled={sending} onPress={submit} style={styles.primaryButtonInline}>
                    {sending
                      ? <ActivityIndicator color={COLORS.ink} />
                      : <Text style={styles.primaryButtonText}>Sí, enviar</Text>}
                  </Pressable>
                </View>
              </>
            )}

            {step === 'success' && (
              <View style={styles.successBox}>
                <MaterialIcons name="check-circle" size={52} color={COLORS.primaryDark} />
                <Text style={styles.successTitle}>Te contactaremos a la brevedad</Text>
                <Text style={styles.successText}>Tu consulta quedó registrada correctamente.</Text>
                <Pressable onPress={onSuccessClose} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Seguir mirando productos</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg, backgroundColor: 'rgba(20, 27, 45, 0.52)' },
  dialog: { width: '100%', maxWidth: 520, maxHeight: '92%', borderRadius: RADIUS.xl, backgroundColor: COLORS.surface, overflow: 'hidden', ...SHADOWS.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { marginTop: 4, color: COLORS.text, fontSize: 21, fontWeight: '800' },
  closeButton: { width: 40, height: 40, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cardBackground },
  content: { padding: SPACING.lg, gap: SPACING.sm },
  productSummary: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.cardBackground },
  imageBox: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  image: { width: '100%', height: '100%' },
  productCopy: { flex: 1 },
  productBrand: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  productModel: { marginTop: 2, color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  productPrice: { marginTop: SPACING.sm, color: COLORS.primaryDark, fontSize: 19, fontWeight: '800' },
  removeButton: { width: 36, height: 36, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.error },
  help: { marginVertical: SPACING.sm, color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  label: { marginTop: SPACING.xs, color: COLORS.text, fontSize: 14, fontWeight: '700' },
  input: { minHeight: 50, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, color: COLORS.text, fontSize: 16 },
  inputSelector: { minHeight: 50, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  selectorText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  prefixMenu: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: COLORS.surface },
  prefixOption: { minHeight: 42, paddingHorizontal: SPACING.md, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  phoneRow: { flexDirection: 'row', gap: SPACING.sm },
  prefixBadge: { minWidth: 70, minHeight: 50, paddingHorizontal: SPACING.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  prefixText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  phoneInput: { flex: 1 },
  error: { color: COLORS.errorStrong, fontSize: 13, lineHeight: 18 },
  primaryButton: { width: '100%', minHeight: 50, marginTop: SPACING.sm, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  primaryButtonInline: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  primaryButtonText: { color: COLORS.ink, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  secondaryButton: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  secondaryButtonText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  confirmBox: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  confirmTitle: { color: COLORS.text, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  confirmText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
  successBox: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  successTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  successText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
});
