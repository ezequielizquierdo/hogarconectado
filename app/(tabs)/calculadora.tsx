import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { useCalculoPrecios } from "@/hooks/useCalculoPrecios";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const parseMoney = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;

type ResultCardProps = {
  title: string;
  subtitle?: string;
  value: number;
  accent?: "primary" | "secondary" | "accent";
  copiedKey: string | null;
  valueKey: string;
  onCopy: (key: string, title: string, value: number) => void;
};

function ResultCard({
  title,
  subtitle,
  value,
  accent = "primary",
  copiedKey,
  valueKey,
  onCopy,
}: ResultCardProps) {
  const accentColors = {
    primary: COLORS.primary,
    secondary: COLORS.secondaryDark,
    accent: COLORS.accentDark,
  };

  return (
    <View style={[styles.resultCard, { borderLeftColor: accentColors[accent] }]}>
      <View style={styles.resultText}>
        <Text style={styles.resultTitle}>{title}</Text>
        {subtitle ? <Text style={styles.resultSubtitle}>{subtitle}</Text> : null}
        <Text style={styles.resultValue}>{formatMoney(value)}</Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Copiar ${title}`}
        style={styles.copyButton}
        onPress={() => onCopy(valueKey, title, value)}
      >
        <Text style={styles.copyIcon}>{copiedKey === valueKey ? "✓" : "⧉"}</Text>
        <Text style={styles.copyText}>
          {copiedKey === valueKey ? "Copiado" : "Copiar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CalculadoraScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const [valorInicial, setValorInicial] = useState("");
  const [porcentaje, setPorcentaje] = useState("10");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyConfirmation, setCopyConfirmation] = useState("");

  const base = valorInicial ? parseMoney(valorInicial) : null;
  const porcentajeNumero = porcentaje
    ? Number(porcentaje.replace(",", "."))
    : null;
  const valorError = valorInicial && (!base || base <= 0)
    ? "Ingresá un valor mayor a 0."
    : "";
  const porcentajeError = porcentajeNumero === null
    ? "Ingresá un porcentaje."
    : !Number.isFinite(porcentajeNumero) || porcentajeNumero < 0 || porcentajeNumero > 100
    ? "El porcentaje debe estar entre 0 y 100."
    : "";
  const { data: resultados, loading, error } = useCalculoPrecios(
    base,
    porcentajeNumero
  );

  const handleInitialValue = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    setValorInicial(
      numericValue
        ? new Intl.NumberFormat("es-AR").format(Number(numericValue))
        : ""
    );
  };

  const confirmCopy = (key: string, message: string) => {
    setCopiedKey(key);
    setCopyConfirmation(message);
    setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
      setCopyConfirmation((current) => (current === message ? "" : current));
    }, 1800);
  };

  const copyValue = async (key: string, title: string, value: number) => {
    await Clipboard.setStringAsync(formatMoney(value));
    confirmCopy(key, `${title}: ${formatMoney(value)} copiado.`);
  };

  const copySummary = async () => {
    if (!resultados || base === null || porcentajeNumero === null) return;
    const summary = [
      "Hogar Conectado · Resumen de precios",
      `Valor inicial: ${formatMoney(base)}`,
      `Ganancia aplicada: ${porcentajeNumero}%`,
      `Efectivo / contado: ${formatMoney(resultados.efectivo)}`,
      `Facturado en un pago: ${formatMoney(resultados.factura.unPago)}`,
      `3 cuotas de ${formatMoney(resultados.tresCuotas.cuota)} · Total ${formatMoney(resultados.tresCuotas.total)}`,
      `6 cuotas de ${formatMoney(resultados.seisCuotas.cuota)} · Total ${formatMoney(resultados.seisCuotas.total)}`,
    ].join("\n");
    await Clipboard.setStringAsync(summary);
    confirmCopy("resumen", "Resumen completo copiado.");
  };

  const clear = () => {
    setValorInicial("");
    setPorcentaje("10");
    setCopiedKey(null);
    setCopyConfirmation("");
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.shell}>
          <View style={styles.screenHeader}>
            <Text style={styles.screenEyebrow}>OPERACIÓN COMERCIAL</Text>
            <Text style={styles.screenTitle}>Calculadora</Text>
            <Text style={styles.screenSubtitle}>
              Calculá precios y copiá cada modalidad en pocos pasos.
            </Text>
          </View>

          <View style={[styles.content, isDesktop && styles.contentDesktop]}>
          <View style={[styles.inputPanel, isDesktop && styles.inputPanelDesktop]}>
            <Text style={styles.eyebrow}>CÁLCULO RÁPIDO</Text>
            <Text style={styles.heading}>Ingresá los datos</Text>
            <Text style={styles.helper}>
              Los importes se actualizan automáticamente mientras escribís.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Valor inicial</Text>
              <View style={styles.moneyInputRow}>
                <Text style={styles.inputPrefix}>$</Text>
                <TextInput
                  value={valorInicial}
                  onChangeText={handleInitialValue}
                  placeholder="0"
                  keyboardType="numeric"
                  style={styles.moneyInput}
                  placeholderTextColor={COLORS.textLight}
                  accessibilityLabel="Valor inicial en pesos"
                  accessibilityHint={valorError || "Ingresá el costo inicial del producto"}
                />
              </View>
              {valorError ? <Text style={styles.fieldError}>{valorError}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Porcentaje aplicado</Text>
              <View style={styles.moneyInputRow}>
                <TextInput
                  value={porcentaje}
                  onChangeText={(value) =>
                    setPorcentaje(value.replace(/[^\d.,]/g, ""))
                  }
                  placeholder="10"
                  keyboardType="decimal-pad"
                  style={styles.moneyInput}
                  placeholderTextColor={COLORS.textLight}
                  accessibilityLabel="Porcentaje aplicado"
                  accessibilityHint={porcentajeError || "Ingresá un porcentaje entre 0 y 100"}
                />
                <Text style={styles.inputSuffix}>%</Text>
              </View>
              {porcentajeError ? <Text style={styles.fieldError}>{porcentajeError}</Text> : null}
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Limpiar valores de la calculadora"
              style={styles.clearButton}
              onPress={clear}
            >
              <Text style={styles.clearText}>Limpiar valores</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.resultsPanel}>
            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.eyebrow}>RESULTADOS</Text>
                <Text style={styles.heading}>Valores calculados</Text>
              </View>
              {valorInicial ? (
                <View style={styles.percentageBadge}>
                  <Text style={styles.percentageBadgeText}>{porcentaje || "0"}%</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.copyConfirmation} accessibilityLiveRegion="polite">
              {copyConfirmation}
            </Text>

            {!valorInicial ? (
              <View style={[styles.emptyState, isDesktop && styles.emptyStateDesktop]}>
                <Text style={styles.emptyIcon}>％</Text>
                <Text style={styles.emptyTitle}>Ingresá un valor inicial</Text>
                <Text style={styles.emptyText}>
                  Acá aparecerán efectivo, factura y cuotas listos para copiar.
                </Text>
              </View>
            ) : valorError || porcentajeError ? (
              <View style={[styles.emptyState, isDesktop && styles.emptyStateDesktop]}>
                <Text style={styles.emptyIcon}>!</Text>
                <Text style={styles.emptyTitle}>Revisá los datos ingresados</Text>
                <Text style={styles.emptyText}>{valorError || porcentajeError}</Text>
              </View>
            ) : loading ? (
              <View style={[styles.emptyState, isDesktop && styles.emptyStateDesktop]}>
                <Text style={styles.emptyIcon}>⌛</Text>
                <Text style={styles.emptyTitle}>Calculando valores</Text>
                <Text style={styles.emptyText}>Estamos aplicando las fórmulas oficiales.</Text>
              </View>
            ) : error || !resultados ? (
              <View style={[styles.emptyState, isDesktop && styles.emptyStateDesktop]}>
                <Text style={styles.emptyIcon}>⚠️</Text>
                <Text style={styles.emptyTitle}>No pudimos calcular</Text>
                <Text style={styles.emptyText}>{error || "Revisá los valores ingresados."}</Text>
              </View>
            ) : (
              <View style={styles.resultsGrid}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Copiar resumen completo de precios"
                  style={styles.copySummaryButton}
                  onPress={copySummary}
                >
                  <Text style={styles.copySummaryText}>
                    {copiedKey === "resumen" ? "✓ Resumen copiado" : "⧉ Copiar resumen completo"}
                  </Text>
                </TouchableOpacity>
                <ResultCard
                  title="Efectivo / contado"
                  subtitle={`Incluye ${porcentaje || "0"}% de ganancia`}
                  value={resultados.efectivo}
                  accent="secondary"
                  copiedKey={copiedKey}
                  valueKey="efectivo"
                  onCopy={copyValue}
                />
                <ResultCard
                  title="Ganancia aplicada"
                  value={resultados.ganancia}
                  copiedKey={copiedKey}
                  valueKey="ganancia"
                  onCopy={copyValue}
                />
                <ResultCard
                  title="Facturado en un pago"
                  subtitle="Incluye 5% de costo de factura"
                  value={resultados.factura.unPago}
                  accent="accent"
                  copiedKey={copiedKey}
                  valueKey="facturado"
                  onCopy={copyValue}
                />
                <ResultCard
                  title="Costo facturado"
                  subtitle="Valor inicial + 5%"
                  value={resultados.factura.costoBase}
                  copiedKey={copiedKey}
                  valueKey="costoFacturado"
                  onCopy={copyValue}
                />

                <View style={styles.installmentCard}>
                  <Text style={styles.installmentTitle}>3 cuotas</Text>
                  <ResultCard
                    title="Valor por cuota"
                    value={resultados.tresCuotas.cuota}
                    accent="primary"
                    copiedKey={copiedKey}
                    valueKey="cuota3"
                    onCopy={copyValue}
                  />
                  <ResultCard
                    title="Total financiado"
                    value={resultados.tresCuotas.total}
                    copiedKey={copiedKey}
                    valueKey="total3"
                    onCopy={copyValue}
                  />
                </View>

                <View style={styles.installmentCard}>
                  <Text style={styles.installmentTitle}>6 cuotas</Text>
                  <ResultCard
                    title="Valor por cuota"
                    value={resultados.seisCuotas.cuota}
                    accent="primary"
                    copiedKey={copiedKey}
                    valueKey="cuota6"
                    onCopy={copyValue}
                  />
                  <ResultCard
                    title="Total financiado"
                    value={resultados.seisCuotas.total}
                    copiedKey={copiedKey}
                    valueKey="total6"
                    onCopy={copyValue}
                  />
                </View>
              </View>
            )}
          </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 110 },
  scrollContentDesktop: { padding: SPACING.xl, paddingBottom: 120 },
  shell: { width: "100%", maxWidth: 1280, alignSelf: "center" },
  screenHeader: { marginBottom: SPACING.lg },
  screenEyebrow: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "800", letterSpacing: 1.2 },
  screenTitle: { color: COLORS.text, fontSize: 34, lineHeight: 42, fontWeight: "800" },
  screenSubtitle: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 23 },
  content: { width: "100%", gap: SPACING.md },
  contentDesktop: { flexDirection: "row", alignItems: "flex-start" },
  inputPanel: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  inputPanelDesktop: { width: 370, position: "sticky" as any, top: SPACING.lg },
  resultsPanel: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1, color: COLORS.primaryDark },
  heading: { fontSize: 23, fontWeight: "800", color: COLORS.text, marginTop: 4 },
  helper: { fontSize: 14, lineHeight: 20, color: COLORS.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.md },
  field: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.sm },
  fieldError: { marginTop: SPACING.xs, color: COLORS.error, fontSize: 12, fontWeight: "600" },
  moneyInputRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
  },
  inputPrefix: { fontSize: 19, fontWeight: "700", color: COLORS.textSecondary, marginRight: SPACING.sm },
  inputSuffix: { fontSize: 18, fontWeight: "700", color: COLORS.textSecondary },
  moneyInput: { flex: 1, fontSize: 19, fontWeight: "700", color: COLORS.text, outlineStyle: "none" } as any,
  clearButton: { alignItems: "center", paddingVertical: SPACING.sm, marginTop: SPACING.xs },
  clearText: { color: COLORS.textSecondary, fontWeight: "600" },
  resultsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  copyConfirmation: { minHeight: 20, marginBottom: SPACING.sm, color: COLORS.primaryDark, fontSize: 13, fontWeight: "700", textAlign: "right" },
  percentageBadge: { backgroundColor: COLORS.primary + "30", borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  percentageBadgeText: { color: COLORS.primaryDark, fontSize: 16, fontWeight: "800" },
  resultsGrid: { gap: SPACING.md },
  copySummaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  copySummaryText: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 82,
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderLeftWidth: 5,
  },
  resultText: { flex: 1, minWidth: 0 },
  resultTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  resultSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  resultValue: { fontSize: 23, fontWeight: "800", color: COLORS.text, marginTop: SPACING.xs },
  copyButton: { alignItems: "center", justifyContent: "center", minWidth: 72, minHeight: 54, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, marginLeft: SPACING.md, paddingHorizontal: SPACING.sm },
  copyIcon: { fontSize: 20, color: COLORS.primaryDark },
  copyText: { fontSize: 11, fontWeight: "700", color: COLORS.primaryDark, marginTop: 2 },
  installmentCard: { padding: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary + "12", borderWidth: 1, borderColor: COLORS.primary + "45", gap: SPACING.sm },
  installmentTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.xs },
  emptyState: { minHeight: 250, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  emptyStateDesktop: { minHeight: 380 },
  emptyIcon: { fontSize: 54, color: COLORS.primary, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, textAlign: "center" },
  emptyText: { maxWidth: 390, fontSize: 14, lineHeight: 21, color: COLORS.textSecondary, textAlign: "center", marginTop: SPACING.sm },
});
