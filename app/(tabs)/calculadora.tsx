import Header from "@/components/layout/Header";
import MobileHeader from "@/components/MobileHeader";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import * as Clipboard from "expo-clipboard";
import React, { useMemo, useState } from "react";
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

const FACTOR_FACTURA = 1.05;
const FACTOR_3_CUOTAS = 1.076;
const FACTOR_6_CUOTAS = 1.156;

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
  onCopy: (key: string, value: number) => void;
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
        accessibilityLabel={`Copiar ${title}`}
        style={styles.copyButton}
        onPress={() => onCopy(valueKey, value)}
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

  const resultados = useMemo(() => {
    const base = parseMoney(valorInicial);
    const porcentajeNumero = Number(porcentaje.replace(",", ".")) || 0;
    const ganancia = base * (porcentajeNumero / 100);
    const efectivo = base + ganancia;
    const costoFacturado = base * FACTOR_FACTURA;
    const facturadoUnPago = costoFacturado * (1 + porcentajeNumero / 100);
    const total3 = facturadoUnPago * FACTOR_3_CUOTAS;
    const total6 = facturadoUnPago * FACTOR_6_CUOTAS;

    return {
      ganancia,
      efectivo,
      costoFacturado,
      facturadoUnPago,
      total3,
      cuota3: total3 / 3,
      total6,
      cuota6: total6 / 6,
    };
  }, [valorInicial, porcentaje]);

  const handleInitialValue = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    setValorInicial(
      numericValue
        ? new Intl.NumberFormat("es-AR").format(Number(numericValue))
        : ""
    );
  };

  const copyValue = async (key: string, value: number) => {
    await Clipboard.setStringAsync(formatMoney(value));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1400);
  };

  const clear = () => {
    setValorInicial("");
    setPorcentaje("10");
    setCopiedKey(null);
  };

  return (
    <View style={styles.page}>
      {isDesktop ? (
        <Header
          sectionTitle="Calculadora de porcentajes"
          sectionSubtitle="Resultados rápidos para cada modalidad"
        />
      ) : (
        <MobileHeader
          title="Calculadora"
          subtitle="Porcentajes y formas de pago"
        />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
                />
              </View>
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
                />
                <Text style={styles.inputSuffix}>%</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.clearButton} onPress={clear}>
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

            {!valorInicial ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>％</Text>
                <Text style={styles.emptyTitle}>Ingresá un valor inicial</Text>
                <Text style={styles.emptyText}>
                  Acá aparecerán efectivo, factura y cuotas listos para copiar.
                </Text>
              </View>
            ) : (
              <View style={styles.resultsGrid}>
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
                  value={resultados.facturadoUnPago}
                  accent="accent"
                  copiedKey={copiedKey}
                  valueKey="facturado"
                  onCopy={copyValue}
                />
                <ResultCard
                  title="Costo facturado"
                  subtitle="Valor inicial + 5%"
                  value={resultados.costoFacturado}
                  copiedKey={copiedKey}
                  valueKey="costoFacturado"
                  onCopy={copyValue}
                />

                <View style={styles.installmentCard}>
                  <Text style={styles.installmentTitle}>3 cuotas</Text>
                  <ResultCard
                    title="Valor por cuota"
                    value={resultados.cuota3}
                    accent="primary"
                    copiedKey={copiedKey}
                    valueKey="cuota3"
                    onCopy={copyValue}
                  />
                  <ResultCard
                    title="Total financiado"
                    value={resultados.total3}
                    copiedKey={copiedKey}
                    valueKey="total3"
                    onCopy={copyValue}
                  />
                </View>

                <View style={styles.installmentCard}>
                  <Text style={styles.installmentTitle}>6 cuotas</Text>
                  <ResultCard
                    title="Valor por cuota"
                    value={resultados.cuota6}
                    accent="primary"
                    copiedKey={copiedKey}
                    valueKey="cuota6"
                    onCopy={copyValue}
                  />
                  <ResultCard
                    title="Total financiado"
                    value={resultados.total6}
                    copiedKey={copiedKey}
                    valueKey="total6"
                    onCopy={copyValue}
                  />
                </View>
              </View>
            )}
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
  content: { width: "100%", maxWidth: 1280, alignSelf: "center", gap: SPACING.md },
  contentDesktop: { flexDirection: "row", alignItems: "flex-start", padding: SPACING.lg },
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
  helper: { fontSize: 14, lineHeight: 20, color: COLORS.textSecondary, marginTop: SPACING.sm, marginBottom: SPACING.lg },
  field: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.sm },
  moneyInputRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
  },
  inputPrefix: { fontSize: 22, fontWeight: "700", color: COLORS.textSecondary, marginRight: SPACING.sm },
  inputSuffix: { fontSize: 20, fontWeight: "700", color: COLORS.textSecondary },
  moneyInput: { flex: 1, fontSize: 22, fontWeight: "700", color: COLORS.text, outlineStyle: "none" } as any,
  clearButton: { alignItems: "center", paddingVertical: SPACING.sm, marginTop: SPACING.xs },
  clearText: { color: COLORS.textSecondary, fontWeight: "600" },
  resultsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  percentageBadge: { backgroundColor: COLORS.primary + "30", borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  percentageBadgeText: { color: COLORS.primaryDark, fontSize: 16, fontWeight: "800" },
  resultsGrid: { gap: SPACING.md },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 96,
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
  emptyState: { minHeight: 380, alignItems: "center", justifyContent: "center", padding: SPACING.xl },
  emptyIcon: { fontSize: 54, color: COLORS.primary, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, textAlign: "center" },
  emptyText: { maxWidth: 390, fontSize: 14, lineHeight: 21, color: COLORS.textSecondary, textAlign: "center", marginTop: SPACING.sm },
});
