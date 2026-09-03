import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { DataStatePanel } from "@/components/ui/DataStatePanel";
import { CardListSkeleton, LoadingBar } from "@/components/ui/LoadingStates";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useQuoteDraft } from "@/contexts/QuoteDraftContext";
import { useDebounce } from "@/hooks/useDebounce";
import cotizacionesService from "@/services/cotizacionesService";
import type {
  Cotizacion,
  CotizacionEstado,
  ProductoCotizacion,
} from "@/services/types";
import {
  getQuoteItemSubtotal,
  getQuoteProductName,
  quoteToDraftItems,
  QUOTE_MODE_LABEL,
} from "@/utils/quoteHistory";
import { getDraftInstallmentCount } from "@/utils/quoteDraft";

const STATES: { value: CotizacionEstado | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "enviada", label: "Enviadas" },
  { value: "confirmada", label: "Confirmadas" },
  { value: "cancelada", label: "Canceladas" },
];

const STATE_LABEL: Record<CotizacionEstado, string> = {
  pendiente: "Pendiente",
  enviada: "Enviada",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function askForConfirmation(message: string) {
  if (Platform.OS === "web") return Promise.resolve(window.confirm(message));
  return new Promise<boolean>((resolve) => {
    Alert.alert("Confirmar", message, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: "Eliminar", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

function askToReplaceDraft() {
  const message = "Ya hay una cotización en preparación. ¿Querés reemplazarla por esta selección?";
  if (Platform.OS === "web") return Promise.resolve(window.confirm(message));
  return new Promise<boolean>((resolve) => {
    Alert.alert("Reemplazar selección", message, [
      { text: "Conservar actual", style: "cancel", onPress: () => resolve(false) },
      { text: "Reemplazar", onPress: () => resolve(true) },
    ]);
  });
}

function ProductLine({ item, quote }: { item: ProductoCotizacion; quote: Cotizacion }) {
  return (
    <View style={styles.productLine}>
      <View style={styles.productLineCopy}>
        <Text numberOfLines={1} style={styles.productName}>
          {getQuoteProductName(item)}
        </Text>
        <Text style={styles.productMeta}>
          {item.cantidad} {item.cantidad === 1 ? "unidad" : "unidades"}
          {item.detalles?.categoria ? ` · ${item.detalles.categoria}` : ""}
        </Text>
      </View>
      <Text style={styles.productSubtotal}>
        {formatMoney(getQuoteItemSubtotal(item, quote.modalidadPago))}
      </Text>
    </View>
  );
}

function ConfirmationSummary({ quote, detailed = false }: { quote: Cotizacion; detailed?: boolean }) {
  if (quote.estado !== "confirmada") return null;
  const confirmer = typeof quote.confirmadaPor === "string"
    ? "Usuario sin detalle"
    : quote.confirmadaPor?.nombre ?? "Usuario no registrado";
  const summary = quote.resumenConfirmacion;

  return (
    <View style={[styles.confirmationBox, detailed && styles.confirmationBoxDetailed]}>
      <View style={styles.confirmationHeader}>
        <MaterialIcons name="verified" size={18} color={COLORS.primaryDark} />
        <View style={styles.confirmationCopy}>
          <Text style={styles.confirmationTitle}>Confirmó {confirmer}</Text>
          {quote.confirmadaAt ? <Text style={styles.confirmationDate}>{formatDate(quote.confirmadaAt)}</Text> : null}
        </View>
      </View>
      {summary ? (
        <View style={styles.settlementRow}>
          <View style={styles.settlementItem}>
            <Text style={styles.settlementLabel}>Dinero a rendir</Text>
            <Text style={styles.settlementValue}>{formatMoney(summary.dineroARendir)}</Text>
          </View>
          <View style={styles.settlementItem}>
            <Text style={styles.settlementLabel}>Ganancia del vendedor</Text>
            <Text style={styles.profitValue}>{formatMoney(summary.gananciaVendedor)}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.legacyConfirmation}>Confirmación anterior sin resumen financiero registrado.</Text>
      )}
    </View>
  );
}

export function QuoteHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items: draftItems, replaceItems } = useQuoteDraft();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isAdmin = user?.rol === "admin";
  const [quotes, setQuotes] = useState<Cotizacion[]>([]);
  const [filter, setFilter] = useState<CotizacionEstado | "todas">("todas");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Cotizacion | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await cotizacionesService.obtenerCotizaciones({
        estado: filter,
        buscar: debouncedSearch || undefined,
        limite: 100,
        pagina: 1,
      });
      setQuotes(result.cotizaciones);
      setTotal(result.pagination?.total ?? result.cotizaciones.length);
    } catch {
      setError("No pudimos cargar las cotizaciones guardadas.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const summary = useMemo(() => ({
    pending: quotes.filter((quote) => quote.estado === "pendiente").length,
    amount: quotes.reduce((sum, quote) => sum + quote.totales.total, 0),
  }), [quotes]);

  const filterButtons = STATES.map((state) => (
    <Pressable
      key={state.value}
      onPress={() => setFilter(state.value)}
      style={[styles.filterChip, filter === state.value && styles.filterChipActive]}
    >
      <Text style={[styles.filterText, filter === state.value && styles.filterTextActive]}>
        {state.label}
      </Text>
    </Pressable>
  ));

  const updateState = async (quote: Cotizacion, state: CotizacionEstado) => {
    const confirmationIsComplete = Boolean(
      quote.confirmadaPor && quote.confirmadaAt && quote.resumenConfirmacion
    );
    if (
      processingId ||
      (quote.estado === state && (state !== "confirmada" || confirmationIsComplete))
    ) return;
    setProcessingId(quote._id);
    setFeedback("");
    try {
      const updated = await cotizacionesService.actualizarEstadoCotizacion(quote._id, state);
      setQuotes((current) => current.map((item) => item._id === quote._id ? updated : item));
      setSelected((current) => current?._id === quote._id ? updated : current);
      setFeedback(
        state === "confirmada"
          ? "Confirmación registrada con su resumen financiero."
          : `Cotización marcada como ${STATE_LABEL[state].toLowerCase()}.`
      );
    } catch {
      setFeedback("No pudimos actualizar el estado.");
    } finally {
      setProcessingId(null);
    }
  };

  const openDetail = async (quote: Cotizacion) => {
    setSelected(quote);
    setDetailLoading(true);
    setDetailError("");
    try {
      const detail = await cotizacionesService.obtenerCotizacionPorId(quote._id);
      setSelected(detail);
      setQuotes((current) =>
        current.map((item) => item._id === detail._id ? detail : item)
      );
    } catch {
      setDetailError("No pudimos cargar el detalle completo. Podés reintentar sin cerrar esta ventana.");
    } finally {
      setDetailLoading(false);
    }
  };

  const share = async (quote: Cotizacion, openWhatsApp: boolean) => {
    let reservedWindow: Window | null = null;
    if (openWhatsApp && Platform.OS === "web" && isDesktop) {
      reservedWindow = window.open("about:blank", "_blank");
      if (reservedWindow) reservedWindow.opener = null;
    }
    setProcessingId(quote._id);
    setFeedback("");
    try {
      const result = await cotizacionesService.generarMensajeWhatsApp(quote._id);
      if (openWhatsApp) {
        let successMessage = "WhatsApp abierto con la cotización preparada.";
        if (quote.estado === "pendiente") {
          try {
            const updated = await cotizacionesService.actualizarEstadoCotizacion(quote._id, "enviada");
            setQuotes((current) => current.map((item) => item._id === quote._id ? updated : item));
            setSelected((current) => current?._id === quote._id ? updated : current);
            successMessage = "WhatsApp abierto y cotización marcada como enviada.";
          } catch {
            successMessage = "WhatsApp se abrió, pero no pudimos actualizar el estado. Podés marcarla como enviada desde el detalle.";
          }
        }

        if (Platform.OS === "web") {
          if (reservedWindow && !reservedWindow.closed) {
            reservedWindow.location.replace(result.urlWhatsApp);
          } else {
            window.location.assign(result.urlWhatsApp);
          }
        } else {
          const canOpen = await Linking.canOpenURL(result.urlWhatsApp);
          if (!canOpen) throw new Error("WhatsApp no disponible");
          await Linking.openURL(result.urlWhatsApp);
        }
        setFeedback(successMessage);
      }
      else {
        await Clipboard.setStringAsync(result.mensaje);
        setFeedback("Texto de la cotización copiado.");
      }
    } catch {
      if (reservedWindow && !reservedWindow.closed) reservedWindow.close();
      setFeedback("No pudimos abrir WhatsApp. Podés usar Copiar texto para enviar la cotización manualmente.");
    } finally {
      setProcessingId(null);
    }
  };

  const remove = async (quote: Cotizacion) => {
    const confirmed = await askForConfirmation(
      `¿Eliminar la cotización de ${quote.datosContacto.nombre}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    setProcessingId(quote._id);
    try {
      await cotizacionesService.eliminarCotizacion(quote._id);
      setSelected(null);
      setFeedback("Cotización eliminada.");
      await load();
    } catch {
      setFeedback("No pudimos eliminar la cotización.");
    } finally {
      setProcessingId(null);
    }
  };

  const reuseAsNew = async (quote: Cotizacion) => {
    const nextItems = quoteToDraftItems(quote);
    if (nextItems.length === 0) {
      setFeedback("Esta cotización no tiene productos reutilizables.");
      return;
    }
    if (draftItems.length > 0 && !(await askToReplaceDraft())) return;
    replaceItems(nextItems);
    setSelected(null);
    setFeedback("");
    router.push("/(tabs)/productos");
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, !isDesktop && styles.contentMobile]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, !isDesktop && styles.headerMobile]}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>GESTIÓN COMERCIAL</Text>
            <Text style={styles.title}>Cotizaciones</Text>
            <Text style={styles.subtitle}>
              Encontrá, compartí y seguí las propuestas guardadas.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/productos")}
            accessibilityRole="button"
            accessibilityLabel="Crear cotización desde Productos"
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="add" size={20} color={COLORS.ink} />
            <Text style={styles.primaryButtonText}>Nueva desde Productos</Text>
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{total}</Text>
            <Text style={styles.summaryLabel}>Cotizaciones encontradas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.pending}</Text>
            <Text style={styles.summaryLabel}>Pendientes visibles</Text>
          </View>
          {isDesktop && (
            <View style={[styles.summaryCard, styles.summaryCardWide]}>
              <Text style={styles.summaryValue}>{formatMoney(summary.amount)}</Text>
              <Text style={styles.summaryLabel}>Total de la vista actual</Text>
            </View>
          )}
        </View>

        <View style={[styles.toolbar, !isDesktop && styles.toolbarMobile]}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={21} color={COLORS.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por cliente o teléfono"
              placeholderTextColor={COLORS.textLight}
              accessibilityLabel="Buscar cotizaciones"
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")} accessibilityLabel="Limpiar búsqueda">
                <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
              </Pressable>
            )}
          </View>
          {isDesktop ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {filterButtons}
            </ScrollView>
          ) : (
            <View style={styles.filtersMobile}>{filterButtons}</View>
          )}
        </View>

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

        {loading && quotes.length > 0 ? <LoadingBar label="Actualizando cotizaciones…" /> : null}
        {loading && quotes.length === 0 ? (
          <CardListSkeleton />
        ) : error ? (
          <DataStatePanel status="error" title="No pudimos cargar la bandeja" message={error} actionLabel="Reintentar" onAction={() => void load()} />
        ) : quotes.length === 0 ? (
          <DataStatePanel
            status="empty"
            title="Todavía no hay cotizaciones aquí"
            message={search || filter !== "todas" ? "Probá con otra búsqueda o filtro." : "Agregá productos desde el catálogo para crear la primera."}
            actionLabel={search || filter !== "todas" ? "Limpiar filtros" : "Ir a Productos"}
            onAction={() => {
              if (search || filter !== "todas") { setSearch(""); setFilter("todas"); }
              else router.push("/(tabs)/productos");
            }}
          />
        ) : (
          <View style={styles.grid}>
            {quotes.map((quote) => (
              <View key={quote._id} style={[styles.card, isDesktop && styles.cardDesktop]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderCopy}>
                    <Text numberOfLines={1} style={styles.clientName}>{quote.datosContacto.nombre}</Text>
                    <Text style={styles.cardMeta}>{formatDate(quote.createdAt)} · {quote.datosContacto.telefono}</Text>
                  </View>
                  <View style={[styles.statusBadge, styles[`status_${quote.estado}`]]}>
                    <Text style={styles.statusText}>{STATE_LABEL[quote.estado]}</Text>
                  </View>
                </View>

                <View style={styles.productList}>
                  {quote.productos.slice(0, 2).map((item, index) => (
                    <ProductLine key={`${quote._id}-${index}`} item={item} quote={quote} />
                  ))}
                  {quote.productos.length > 2 && (
                    <Text style={styles.moreProducts}>+ {quote.productos.length - 2} productos más</Text>
                  )}
                </View>

                <View style={styles.totalRow}>
                  <View>
                    <Text style={styles.modeLabel}>{QUOTE_MODE_LABEL[quote.modalidadPago]}</Text>
                    <Text style={styles.unitsLabel}>
                      {getDraftInstallmentCount(quote.modalidadPago)
                        ? `${getDraftInstallmentCount(quote.modalidadPago)} cuotas de ${formatMoney(quote.totales.total / (getDraftInstallmentCount(quote.modalidadPago) ?? 1))}`
                        : `${quote.productos.reduce((sum, item) => sum + item.cantidad, 0)} unidades`}
                    </Text>
                  </View>
                  <Text style={styles.total}>{formatMoney(quote.totales.total)}</Text>
                </View>

                <ConfirmationSummary quote={quote} />

                <View style={styles.actions}>
                  <Pressable onPress={() => void openDetail(quote)} style={styles.secondaryAction}>
                    <MaterialIcons name="visibility" size={19} color={COLORS.text} />
                    <Text style={styles.secondaryActionText}>Ver detalle</Text>
                  </Pressable>
                  <Pressable
                    disabled={processingId === quote._id}
                    onPress={() => void share(quote, true)}
                    style={styles.whatsappAction}
                  >
                    {processingId === quote._id ? <ActivityIndicator size="small" color={COLORS.ink} /> : <MaterialIcons name="chat" size={19} color={COLORS.ink} />}
                    <Text style={styles.whatsappText}>WhatsApp</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          {selected && (
            <View style={[styles.modal, isDesktop && styles.modalDesktop]} accessibilityViewIsModal>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderCopy}>
                  <Text style={styles.modalEyebrow}>COTIZACIÓN GUARDADA</Text>
                  <Text style={styles.modalTitle}>{selected.datosContacto.nombre}</Text>
                  <Text style={styles.modalMeta}>{formatDate(selected.createdAt)} · {selected.datosContacto.telefono}</Text>
                </View>
                <Pressable onPress={() => { setSelected(null); setDetailError(""); }} style={styles.closeButton} accessibilityLabel="Cerrar detalle">
                  <MaterialIcons name="close" size={24} color={COLORS.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                {detailLoading ? (
                  <View style={styles.detailState}>
                    <ActivityIndicator size="small" color={COLORS.primaryDark} />
                    <Text style={styles.detailStateText}>Cargando detalle completo…</Text>
                  </View>
                ) : null}
                {detailError ? (
                  <View style={styles.detailError}>
                    <Text style={styles.detailErrorText}>{detailError}</Text>
                    <Pressable onPress={() => void openDetail(selected)} style={styles.retryDetailButton}>
                      <Text style={styles.retryDetailText}>Reintentar</Text>
                    </Pressable>
                  </View>
                ) : null}
                <View style={styles.detailProducts}>
                  {selected.productos.map((item, index) => (
                    <ProductLine key={`${selected._id}-detail-${index}`} item={item} quote={selected} />
                  ))}
                </View>
                <View style={styles.detailTotal}>
                  <View>
                    <Text style={styles.modeLabel}>{QUOTE_MODE_LABEL[selected.modalidadPago]}</Text>
                    <Text style={styles.unitsLabel}>
                      {getDraftInstallmentCount(selected.modalidadPago)
                        ? `${getDraftInstallmentCount(selected.modalidadPago)} cuotas de ${formatMoney(selected.totales.total / (getDraftInstallmentCount(selected.modalidadPago) ?? 1))}`
                        : "Total cotizado"}
                    </Text>
                  </View>
                  <Text style={styles.detailTotalValue}>{formatMoney(selected.totales.total)}</Text>
                </View>
                <ConfirmationSummary quote={selected} detailed />
                {selected.observaciones ? (
                  <View style={styles.notes}>
                    <Text style={styles.notesTitle}>Observaciones</Text>
                    <Text style={styles.notesText}>{selected.observaciones}</Text>
                  </View>
                ) : null}

                <Text style={styles.sectionLabel}>Actualizar seguimiento</Text>
                <View style={styles.stateActions}>
                  {STATES.filter((state) => state.value !== "todas").map((state) => (
                    <Pressable
                      key={state.value}
                      disabled={processingId === selected._id}
                      onPress={() => void updateState(selected, state.value as CotizacionEstado)}
                      style={[styles.stateButton, selected.estado === state.value && styles.stateButtonActive]}
                    >
                      <Text style={[styles.stateButtonText, selected.estado === state.value && styles.stateButtonTextActive]}>{STATE_LABEL[state.value as CotizacionEstado]}</Text>
                    </Pressable>
                  ))}
                </View>
                {feedback ? <Text style={styles.modalFeedback}>{feedback}</Text> : null}
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable disabled={processingId === selected._id} onPress={() => void reuseAsNew(selected)} style={styles.modalSecondaryAction}>
                  <MaterialIcons name="content-copy" size={19} color={COLORS.text} />
                  <Text style={styles.secondaryActionText}>Usar como nueva</Text>
                </Pressable>
                <Pressable disabled={processingId === selected._id} onPress={() => void share(selected, false)} style={styles.modalSecondaryAction}>
                  {processingId === selected._id ? <ActivityIndicator size="small" color={COLORS.text} /> : <MaterialIcons name="content-copy" size={19} color={COLORS.text} />}
                  <Text style={styles.secondaryActionText}>Copiar texto</Text>
                </Pressable>
                <Pressable disabled={processingId === selected._id} onPress={() => void share(selected, true)} style={styles.modalPrimaryAction}>
                  {processingId === selected._id ? <ActivityIndicator size="small" color={COLORS.ink} /> : <MaterialIcons name="chat" size={19} color={COLORS.ink} />}
                  <Text style={styles.whatsappText}>Abrir WhatsApp</Text>
                </Pressable>
                {isAdmin && (
                  <Pressable disabled={processingId === selected._id} onPress={() => void remove(selected)} style={styles.deleteAction} accessibilityLabel="Eliminar cotización">
                    <MaterialIcons name="delete-outline" size={21} color={COLORS.errorStrong} />
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { width: "100%", maxWidth: 1460, alignSelf: "center", padding: SPACING.xl, paddingBottom: 120 },
  contentMobile: { padding: SPACING.md, paddingBottom: 110 },
  header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: SPACING.lg, marginBottom: SPACING.lg },
  headerMobile: { alignItems: "stretch", flexDirection: "column" },
  headerCopy: { flex: 1 },
  eyebrow: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: COLORS.text, fontSize: 34, lineHeight: 42, fontWeight: "800" },
  subtitle: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 23 },
  primaryButton: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.xs, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  primaryButtonText: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.76 },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md, marginBottom: SPACING.lg },
  summaryCard: { minWidth: 150, flexGrow: 1, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface },
  summaryCardWide: { flexGrow: 2 },
  summaryValue: { color: COLORS.primaryDark, fontSize: 24, fontWeight: "800" },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  toolbar: { flexDirection: "row", alignItems: "center", gap: SPACING.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface },
  toolbarMobile: { alignItems: "stretch", flexDirection: "column" },
  searchBox: { minHeight: 44, flex: 1, flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  searchInput: { minWidth: 0, flex: 1, color: COLORS.text, fontSize: 15, outlineStyle: "none" } as any,
  filters: { gap: SPACING.sm },
  filtersMobile: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  filterChip: { minHeight: 40, justifyContent: "center", paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full, backgroundColor: COLORS.surface },
  filterChipActive: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.primary + "28" },
  filterText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: COLORS.primaryDark },
  feedback: { marginBottom: SPACING.md, color: COLORS.text, fontSize: 14, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md },
  card: { width: "100%", padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 4, borderTopColor: COLORS.primary, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, ...SHADOWS.sm },
  cardDesktop: { width: "48.9%" },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: SPACING.md },
  cardHeaderCopy: { minWidth: 0, flex: 1 },
  clientName: { color: COLORS.text, fontSize: 19, fontWeight: "800" },
  cardMeta: { marginTop: 2, color: COLORS.textSecondary, fontSize: 12 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: RADIUS.sm },
  status_pendiente: { backgroundColor: COLORS.warning },
  status_enviada: { backgroundColor: COLORS.info },
  status_confirmada: { backgroundColor: COLORS.success },
  status_cancelada: { backgroundColor: COLORS.error },
  statusText: { color: COLORS.text, fontSize: 11, fontWeight: "800" },
  productList: { gap: SPACING.sm, marginTop: SPACING.lg },
  productLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SPACING.md, paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  productLineCopy: { minWidth: 0, flex: 1 },
  productName: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  productMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  productSubtotal: { color: COLORS.text, fontSize: 14, fontWeight: "800" },
  moreProducts: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "700" },
  totalRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: SPACING.lg },
  modeLabel: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  unitsLabel: { marginTop: 2, color: COLORS.textSecondary, fontSize: 12 },
  total: { color: COLORS.primaryDark, fontSize: 23, fontWeight: "800" },
  confirmationBox: { gap: SPACING.sm, marginTop: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.success + "24" },
  confirmationBoxDetailed: { marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.success },
  confirmationHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  confirmationCopy: { minWidth: 0, flex: 1 },
  confirmationTitle: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  confirmationDate: { marginTop: 1, color: COLORS.textSecondary, fontSize: 11 },
  settlementRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  settlementItem: { minWidth: 140, flex: 1, padding: SPACING.sm, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface },
  settlementLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: "700" },
  settlementValue: { marginTop: 2, color: COLORS.text, fontSize: 15, fontWeight: "900" },
  profitValue: { marginTop: 2, color: COLORS.primaryDark, fontSize: 15, fontWeight: "900" },
  legacyConfirmation: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16 },
  actions: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg },
  secondaryAction: { minHeight: 43, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.xs, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  secondaryActionText: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  whatsappAction: { minHeight: 43, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.xs, borderRadius: RADIUS.md, backgroundColor: COLORS.secondaryDark },
  whatsappText: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  modalOverlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.md, backgroundColor: "rgba(29, 36, 64, 0.58)" },
  modal: { width: "100%", maxWidth: 620, maxHeight: "90%", borderRadius: RADIUS.xl, overflow: "hidden", backgroundColor: COLORS.surface, ...SHADOWS.lg },
  modalDesktop: { maxWidth: 720 },
  modalHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: SPACING.md, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalHeaderCopy: { minWidth: 0, flex: 1 },
  modalEyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  modalTitle: { marginTop: 2, color: COLORS.text, fontSize: 24, fontWeight: "800" },
  modalMeta: { marginTop: 3, color: COLORS.textSecondary, fontSize: 12 },
  closeButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.full, backgroundColor: COLORS.cardBackground },
  modalScroll: { flexShrink: 1 },
  modalContent: { padding: SPACING.lg },
  detailState: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  detailStateText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "700" },
  detailError: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: SPACING.sm, marginBottom: SPACING.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.errorStrong, borderRadius: RADIUS.md, backgroundColor: COLORS.error + "20" },
  detailErrorText: { minWidth: 0, flex: 1, color: COLORS.errorStrong, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  retryDetailButton: { minHeight: 36, justifyContent: "center", paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  retryDetailText: { color: COLORS.text, fontSize: 12, fontWeight: "800" },
  detailProducts: { gap: SPACING.md },
  detailTotal: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: SPACING.lg, padding: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary + "20" },
  detailTotalValue: { color: COLORS.primaryDark, fontSize: 25, fontWeight: "800" },
  notes: { marginTop: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  notesTitle: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  notesText: { marginTop: SPACING.xs, color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  sectionLabel: { marginTop: SPACING.lg, marginBottom: SPACING.sm, color: COLORS.textSecondary, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  stateActions: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  stateButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full },
  stateButtonActive: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.primary },
  stateButtonText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "700" },
  stateButtonTextActive: { color: COLORS.ink },
  modalFeedback: { marginTop: SPACING.md, color: COLORS.text, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  modalActions: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  modalSecondaryAction: { minHeight: 44, flexGrow: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  modalPrimaryAction: { minHeight: 44, flexGrow: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.secondaryDark },
  deleteAction: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: RADIUS.md, backgroundColor: COLORS.error + "28" },
});
