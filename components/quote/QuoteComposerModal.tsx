import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { useQuoteDraft } from "@/contexts/QuoteDraftContext";
import { cotizacionesService } from "@/services";
import {
  getDraftItemSubtotal,
  getDraftInstallmentCount,
  getDraftTotal,
  getDraftUnitPrice,
  hasDraftPaymentMode,
  type QuotePaymentMode,
} from "@/utils/quoteDraft";

interface QuoteComposerModalProps {
  visible: boolean;
  onClose: () => void;
}

type ComposerStep = "form" | "preview" | "success";

const paymentModes: {
  value: QuotePaymentMode;
  label: string;
  shortLabel: string;
}[] = [
  { value: "contado", label: "Contado", shortLabel: "Contado" },
  { value: "facturado", label: "Facturado", shortLabel: "Facturado" },
  { value: "3-cuotas", label: "3 cuotas", shortLabel: "3 cuotas" },
  { value: "6-cuotas", label: "6 cuotas", shortLabel: "6 cuotas" },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);

export function QuoteComposerModal({ visible, onClose }: QuoteComposerModalProps) {
  const { items, unitCount, setQuantity, removeProduct, clear } = useQuoteDraft();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 900;
  const [step, setStep] = useState<ComposerStep>("form");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState<QuotePaymentMode>("contado");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const total = useMemo(
    () => getDraftTotal(items, paymentMode),
    [items, paymentMode]
  );
  const paymentLabel = paymentModes.find((mode) => mode.value === paymentMode)?.label;
  const installmentCount = getDraftInstallmentCount(paymentMode);
  const installmentAmount = installmentCount ? total / installmentCount : null;

  const resetComposer = () => {
    setStep("form");
    setClientName("");
    setClientPhone("");
    setNotes("");
    setPaymentMode("contado");
    setError("");
    setSaving(false);
    setSavedId(null);
  };

  const closeComposer = () => {
    if (step === "success") clear();
    resetComposer();
    onClose();
  };

  const showPreview = () => {
    if (!clientName.trim()) {
      setError("Ingresá el nombre del cliente.");
      return;
    }
    if (clientPhone.trim().replace(/\D/g, "").length < 8) {
      setError("Ingresá un teléfono de contacto válido.");
      return;
    }
    if (items.length === 0) {
      setError("Agregá al menos un producto.");
      return;
    }
    setError("");
    setStep("preview");
  };

  const saveQuote = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const quote = await cotizacionesService.crearCotizacion({
        datosContacto: {
          nombre: clientName.trim(),
          telefono: clientPhone.trim(),
        },
        productos: items.map((item) => ({
          producto: item.producto._id,
          cantidad: item.cantidad,
          porcentajeAplicado: item.porcentajeAplicado,
        })),
        modalidadPago: paymentMode,
        observaciones: notes.trim() || undefined,
      });
      setSavedId(quote._id);
      setStep("success");
    } catch (saveError) {
      console.error("Error guardando cotización multiproducto:", saveError);
      setError("No pudimos guardar la cotización. Revisá la conexión e intentá nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      animationType={isDesktop ? "fade" : "slide"}
      transparent
      visible={visible}
      onRequestClose={closeComposer}
    >
      <View style={styles.backdrop}>
        <Pressable onPress={closeComposer} style={StyleSheet.absoluteFill} />
        <View style={[styles.panel, isDesktop ? styles.panelDesktop : styles.panelMobile]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <ThemedText style={styles.eyebrow}>
                {step === "preview" ? "VISTA PREVIA" : step === "success" ? "LISTA PARA ENVIAR" : "NUEVA COTIZACIÓN"}
              </ThemedText>
              <ThemedText style={styles.title}>
                {step === "preview" ? "Revisá antes de guardar" : step === "success" ? "Cotización guardada" : "Prepará la propuesta"}
              </ThemedText>
              {step !== "success" && (
                <ThemedText style={styles.subtitle}>
                  {items.length} {items.length === 1 ? "producto" : "productos"} · {unitCount} {unitCount === 1 ? "unidad" : "unidades"}
                </ThemedText>
              )}
            </View>
            <Pressable accessibilityLabel="Cerrar cotización" onPress={closeComposer} style={styles.closeButton}>
              <MaterialIcons name="close" size={22} color={COLORS.text} />
            </Pressable>
          </View>

          {step === "form" && (
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <View style={[styles.formGrid, isDesktop && styles.formGridDesktop]}>
                <View style={styles.fieldGroup}>
                  <ThemedText style={styles.label}>Cliente</ThemedText>
                  <TextInput
                    accessibilityLabel="Nombre del cliente"
                    onChangeText={setClientName}
                    placeholder="Nombre y apellido"
                    placeholderTextColor={COLORS.textLight}
                    style={styles.input}
                    value={clientName}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <ThemedText style={styles.label}>Teléfono</ThemedText>
                  <TextInput
                    accessibilityLabel="Teléfono del cliente"
                    keyboardType="phone-pad"
                    onChangeText={setClientPhone}
                    placeholder="Ej. 11 5555 5555"
                    placeholderTextColor={COLORS.textLight}
                    style={styles.input}
                    value={clientPhone}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Modalidad para toda la cotización</ThemedText>
                <View style={styles.modeRow}>
                  {paymentModes.map((mode) => {
                    const selected = paymentMode === mode.value;
                    const available = hasDraftPaymentMode(items, mode.value);
                    return (
                      <Pressable
                        key={mode.value}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected, disabled: !available }}
                        disabled={!available}
                        onPress={() => setPaymentMode(mode.value)}
                        style={[styles.modeButton, !isDesktop && styles.modeButtonMobile, selected && styles.modeButtonSelected, !available && styles.disabled]}
                      >
                        <ThemedText style={[styles.modeText, selected && styles.modeTextSelected]}>
                          {mode.shortLabel}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.paymentSummary}>
                  {installmentCount && installmentAmount !== null ? (
                    <>
                      <View>
                        <ThemedText style={styles.paymentSummaryLabel}>{installmentCount} cuotas de</ThemedText>
                        <ThemedText style={styles.paymentSummaryValue}>{formatPrice(installmentAmount)}</ThemedText>
                      </View>
                      <View style={styles.paymentSummaryAside}>
                        <ThemedText style={styles.paymentSummaryLabel}>Total financiado</ThemedText>
                        <ThemedText style={styles.paymentSummaryTotal}>{formatPrice(total)}</ThemedText>
                      </View>
                    </>
                  ) : (
                    <>
                      <ThemedText style={styles.paymentSummaryLabel}>
                        {paymentMode === "facturado" ? "Valor facturado en 1 cuota con ganancia" : "Total contado"}
                      </ThemedText>
                      <ThemedText style={styles.paymentSummaryTotal}>{formatPrice(total)}</ThemedText>
                    </>
                  )}
                </View>
                {!hasDraftPaymentMode(items, "facturado") && (
                  <ThemedText style={styles.modeHint}>Quitá y volvé a agregar estos productos para obtener el costo facturado.</ThemedText>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <ThemedText style={styles.sectionTitle}>Productos</ThemedText>
                  <ThemedText style={styles.sectionMeta}>{formatPrice(total)}</ThemedText>
                </View>
                <View style={styles.productsList}>
                  {items.map((item) => (
                    <View key={item.producto._id} style={styles.productRow}>
                      <View style={styles.thumbnail}>
                        {item.producto.imagenes?.[0] ? (
                          <Image source={{ uri: item.producto.imagenes[0] }} style={styles.image} contentFit="contain" />
                        ) : (
                          <MaterialIcons name="inventory-2" size={22} color={COLORS.textSecondary} />
                        )}
                      </View>
                      <View style={styles.productCopy}>
                        <ThemedText style={styles.productName} numberOfLines={1}>
                          {item.producto.marca} {item.producto.modelo}
                        </ThemedText>
                        <ThemedText style={styles.unitPrice}>
                          {formatPrice(getDraftUnitPrice(item, paymentMode))} c/u
                          {installmentCount ? ` · ${installmentCount} × ${formatPrice(getDraftUnitPrice(item, paymentMode) / installmentCount)}` : ""}
                        </ThemedText>
                        <View style={styles.quantityRow}>
                          <Pressable disabled={item.cantidad <= 1} onPress={() => setQuantity(item.producto._id, item.cantidad - 1)} style={[styles.quantityButton, item.cantidad <= 1 && styles.disabled]}>
                            <MaterialIcons name="remove" size={17} color={COLORS.text} />
                          </Pressable>
                          <ThemedText style={styles.quantity}>{item.cantidad}</ThemedText>
                          <Pressable onPress={() => setQuantity(item.producto._id, item.cantidad + 1)} style={styles.quantityButton}>
                            <MaterialIcons name="add" size={17} color={COLORS.text} />
                          </Pressable>
                        </View>
                      </View>
                      <View style={styles.productAside}>
                        <Pressable accessibilityLabel="Quitar producto" onPress={() => removeProduct(item.producto._id)} style={styles.removeButton}>
                          <MaterialIcons name="close" size={18} color={COLORS.errorStrong} />
                        </Pressable>
                        <ThemedText style={styles.subtotal}>{formatPrice(getDraftItemSubtotal(item, paymentMode))}</ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={styles.label}>Observaciones (opcional)</ThemedText>
                <TextInput
                  multiline
                  onChangeText={setNotes}
                  placeholder="Entrega, vigencia u otra aclaración"
                  placeholderTextColor={COLORS.textLight}
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                />
              </View>
              {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
            </ScrollView>
          )}

          {step === "preview" && (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View>
                    <ThemedText style={styles.previewBrand}>HOGAR CONECTADO</ThemedText>
                    <ThemedText style={styles.previewClient}>Cotización para {clientName.trim()}</ThemedText>
                    <ThemedText style={styles.previewPhone}>{clientPhone.trim()}</ThemedText>
                  </View>
                  <View style={styles.modeBadge}>
                    <ThemedText style={styles.modeBadgeText}>{paymentLabel}</ThemedText>
                  </View>
                </View>
                <View style={styles.previewProducts}>
                  {items.map((item) => (
                    <View key={item.producto._id} style={styles.previewRow}>
                      <View style={styles.previewRowCopy}>
                        <ThemedText style={styles.previewProductName}>{item.producto.marca} {item.producto.modelo}</ThemedText>
                        <ThemedText style={styles.previewDetail}>{item.cantidad} × {formatPrice(getDraftUnitPrice(item, paymentMode))}</ThemedText>
                        {installmentCount && (
                          <ThemedText style={styles.previewDetail}>
                            Por unidad: {installmentCount} cuotas de {formatPrice(getDraftUnitPrice(item, paymentMode) / installmentCount)}
                          </ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.previewSubtotal}>{formatPrice(getDraftItemSubtotal(item, paymentMode))}</ThemedText>
                    </View>
                  ))}
                </View>
                {!!notes.trim() && <ThemedText style={styles.previewNotes}>{notes.trim()}</ThemedText>}
                <View style={styles.previewTotalRow}>
                  <View>
                    <ThemedText style={styles.previewTotalLabel}>{installmentCount ? "TOTAL FINANCIADO" : paymentMode === "facturado" ? "FACTURADO EN 1 CUOTA CON GANANCIA" : "TOTAL"}</ThemedText>
                    {installmentCount && installmentAmount !== null && (
                      <ThemedText style={styles.previewInstallment}>{installmentCount} cuotas de {formatPrice(installmentAmount)}</ThemedText>
                    )}
                  </View>
                  <ThemedText style={styles.previewTotal}>{formatPrice(total)}</ThemedText>
                </View>
              </View>
              {!!error && <ThemedText style={styles.error}>{error}</ThemedText>}
            </ScrollView>
          )}

          {step === "success" && (
            <View style={styles.successContent}>
              <View style={styles.successIcon}>
                <MaterialIcons name="check" size={42} color={COLORS.ink} />
              </View>
              <ThemedText style={styles.successTitle}>Cotización guardada</ThemedText>
              <ThemedText style={styles.successText}>
                La propuesta de {formatPrice(total)} quedó registrada y lista para compartir.
              </ThemedText>
              {!!savedId && <ThemedText style={styles.successId}>Referencia {savedId.slice(-8).toUpperCase()}</ThemedText>}
            </View>
          )}

          <View style={styles.actions}>
            {step === "form" && (
              <>
                <Pressable onPress={closeComposer} style={styles.secondaryButton}>
                  <ThemedText style={styles.secondaryButtonText}>Seguir luego</ThemedText>
                </Pressable>
                <Pressable disabled={items.length === 0} onPress={showPreview} style={[styles.primaryButton, items.length === 0 && styles.disabled]}>
                  <ThemedText style={styles.primaryButtonText}>Ver vista previa</ThemedText>
                </Pressable>
              </>
            )}
            {step === "preview" && (
              <>
                <Pressable disabled={saving} onPress={() => setStep("form")} style={styles.secondaryButton}>
                  <ThemedText style={styles.secondaryButtonText}>Editar</ThemedText>
                </Pressable>
                <Pressable disabled={saving} onPress={saveQuote} style={[styles.primaryButton, saving && styles.disabled]}>
                  {saving ? <ActivityIndicator color={COLORS.ink} /> : <ThemedText style={styles.primaryButtonText}>Guardar cotización</ThemedText>}
                </Pressable>
              </>
            )}
            {step === "success" && (
              <Pressable onPress={closeComposer} style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>Finalizar</ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.md, backgroundColor: "rgba(24,34,53,0.55)" },
  panel: { maxHeight: "94%", overflow: "hidden", borderRadius: RADIUS.xl, backgroundColor: COLORS.surface, ...SHADOWS.lg },
  panelDesktop: { width: 820 },
  panelMobile: { width: "100%", maxWidth: 540 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerCopy: { flex: 1 },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  title: { marginTop: 4, color: COLORS.text, fontSize: 24, fontWeight: "800" },
  subtitle: { marginTop: 3, color: COLORS.textSecondary, fontSize: 13 },
  closeButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.full, backgroundColor: COLORS.cardBackground },
  scrollContent: { padding: SPACING.lg, gap: SPACING.lg },
  formGrid: { gap: SPACING.md },
  formGridDesktop: { flexDirection: "row" },
  fieldGroup: { flex: 1, gap: 6 },
  label: { color: COLORS.text, fontSize: 12, fontWeight: "800" },
  input: { minHeight: 46, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground, color: COLORS.text, fontSize: 14, outlineStyle: "none" } as never,
  notesInput: { minHeight: 70, paddingTop: 13, textAlignVertical: "top" },
  section: { gap: SPACING.sm },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionMeta: { color: COLORS.primaryDark, fontSize: 15, fontWeight: "800" },
  modeRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  modeButton: { minHeight: 42, flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full, backgroundColor: COLORS.surface },
  modeButtonMobile: { flexBasis: "46%" },
  modeButtonSelected: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.primary },
  modeText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "700" },
  modeTextSelected: { color: COLORS.ink },
  paymentSummary: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  paymentSummaryAside: { alignItems: "flex-end" },
  paymentSummaryLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "700" },
  paymentSummaryValue: { marginTop: 2, color: COLORS.primaryDark, fontSize: 18, fontWeight: "900" },
  paymentSummaryTotal: { color: COLORS.primaryDark, fontSize: 16, fontWeight: "900" },
  modeHint: { color: COLORS.textSecondary, fontSize: 11 },
  productsList: { gap: SPACING.sm },
  productRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  thumbnail: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.sm, backgroundColor: COLORS.surface },
  image: { width: "100%", height: "100%" },
  productCopy: { flex: 1, minWidth: 0 },
  productName: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  unitPrice: { marginTop: 2, color: COLORS.textSecondary, fontSize: 11 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.sm },
  quantityButton: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.borderFocus, borderRadius: RADIUS.full, backgroundColor: COLORS.surface },
  quantity: { minWidth: 18, textAlign: "center", color: COLORS.text, fontWeight: "800" },
  productAside: { minWidth: 105, alignSelf: "stretch", alignItems: "flex-end", justifyContent: "space-between" },
  removeButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.full, backgroundColor: COLORS.error + "20" },
  subtotal: { color: COLORS.primaryDark, fontSize: 13, fontWeight: "800" },
  error: { color: COLORS.errorStrong, fontSize: 13, fontWeight: "700" },
  previewCard: { overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", gap: SPACING.md, padding: SPACING.lg, backgroundColor: COLORS.cardBackground },
  previewBrand: { color: COLORS.primaryDark, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  previewClient: { marginTop: 5, color: COLORS.text, fontSize: 18, fontWeight: "800" },
  previewPhone: { marginTop: 2, color: COLORS.textSecondary, fontSize: 12 },
  modeBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.accent },
  modeBadgeText: { color: COLORS.ink, fontSize: 11, fontWeight: "800" },
  previewProducts: { paddingHorizontal: SPACING.lg },
  previewRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  previewRowCopy: { flex: 1 },
  previewProductName: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  previewDetail: { marginTop: 3, color: COLORS.textSecondary, fontSize: 11 },
  previewSubtotal: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  previewNotes: { marginHorizontal: SPACING.lg, marginTop: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.accent + "40", color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  previewTotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: SPACING.md, padding: SPACING.lg, backgroundColor: COLORS.ink },
  previewTotalLabel: { color: COLORS.heroTextMuted, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  previewInstallment: { marginTop: 4, color: COLORS.heroTextMuted, fontSize: 12, fontWeight: "700" },
  previewTotal: { color: COLORS.surface, fontSize: 24, fontWeight: "900" },
  successContent: { alignItems: "center", padding: SPACING.xl, gap: SPACING.sm },
  successIcon: { width: 76, height: 76, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.full, backgroundColor: COLORS.secondary },
  successTitle: { marginTop: SPACING.sm, color: COLORS.text, fontSize: 24, fontWeight: "900" },
  successText: { maxWidth: 440, color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, textAlign: "center" },
  successId: { marginTop: SPACING.sm, color: COLORS.primaryDark, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  actions: { flexDirection: "row", gap: SPACING.sm, padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  primaryButton: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  primaryButtonText: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
  secondaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  secondaryButtonText: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  disabled: { opacity: 0.4 },
});
