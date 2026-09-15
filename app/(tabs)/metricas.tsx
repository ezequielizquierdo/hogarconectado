import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { DataStatePanel } from '@/components/ui/DataStatePanel';
import { CardListSkeleton } from '@/components/ui/LoadingStates';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import cotizacionesService, { CommercialDashboard } from '@/services/cotizacionesService';

const money = (value = 0) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
const monthLabel = (period: string, long = false) => {
  const [year, month] = period.split('-').map(Number);
  const label = new Intl.DateTimeFormat('es-AR', { month: long ? 'long' : 'short', year: long ? 'numeric' : undefined }).format(new Date(year, month - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

function availableMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
}

function Trend({ value }: { value: number }) {
  const positive = value >= 0;
  return <View style={[styles.trend, positive ? styles.trendPositive : styles.trendNegative]}>
    <MaterialIcons name={positive ? 'trending-up' : 'trending-down'} size={14} color={positive ? '#25835b' : COLORS.errorStrong} />
    <Text style={[styles.trendText, { color: positive ? '#25835b' : COLORS.errorStrong }]}>{Math.abs(value)}% vs. mes anterior</Text>
  </View>;
}

function MetricCard({ icon, label, value, change, tone = 'primary' }: { icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string; value: string; change: number; tone?: 'primary' | 'mint' | 'peach' | 'sky' }) {
  return <View style={styles.metricCard}>
    <View style={[styles.metricIcon, styles[`metricIcon_${tone}`]]}><MaterialIcons name={icon} size={22} color={COLORS.ink} /></View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    <Trend value={change} />
  </View>;
}

function SalesChart({ data, metric }: { data: CommercialDashboard['historialMensual']; metric: 'montoVendido' | 'ventas' }) {
  const width = 720; const height = 220; const pad = 28;
  const values = data.map(item => item[metric]);
  const max = Math.max(...values, 1);
  const points = data.map((item, index) => ({
    x: data.length === 1 ? width / 2 : pad + index * ((width - pad * 2) / (data.length - 1)),
    y: height - pad - (item[metric] / max) * (height - pad * 2),
    item,
  }));
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  return <View>
    <View style={styles.chartCanvas}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessibilityLabel="Evolución mensual">
        {[0, 1, 2, 3].map(index => <Line key={index} x1={pad} x2={width - pad} y1={pad + index * ((height - pad * 2) / 3)} y2={pad + index * ((height - pad * 2) / 3)} stroke={COLORS.border} strokeWidth="1" />)}
        {points.length > 1 ? <Path d={path} fill="none" stroke={COLORS.primaryDark} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {points.map(point => <Circle key={point.item.periodo} cx={point.x} cy={point.y} r="7" fill={COLORS.surface} stroke={COLORS.primaryDark} strokeWidth="4" />)}
      </Svg>
    </View>
    <View style={styles.chartLabels}>{data.map(item => <Text key={item.periodo} style={styles.chartLabel}>{monthLabel(item.periodo)}</Text>)}</View>
  </View>;
}

function ProductList({ title, icon, items }: { title: string; icon: React.ComponentProps<typeof MaterialIcons>['name']; items: { key: string; name: string; value: string }[] }) {
  return <View style={styles.listCard}>
    <View style={styles.cardTitleRow}><View style={styles.smallIcon}><MaterialIcons name={icon} size={18} color={COLORS.primaryDark} /></View><Text style={styles.cardTitle}>{title}</Text></View>
    {items.length ? items.slice(0, 5).map((item, index) => <View key={item.key} style={styles.listRow}><Text style={styles.position}>{index + 1}</Text><Text style={styles.productName}>{item.name}</Text><Text style={styles.productValue}>{item.value}</Text></View>) : <Text style={styles.empty}>Todavía no hay información en este período.</Text>}
  </View>;
}

export default function MetricsScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const isAdmin = user?.rol === 'admin';
  const months = useMemo(availableMonths, []);
  const [period, setPeriod] = useState(months[0]);
  const [chartMetric, setChartMetric] = useState<'montoVendido' | 'ventas'>('montoVendido');
  const [rankingSort, setRankingSort] = useState<'ventas' | 'montoVendido'>('ventas');
  const [data, setData] = useState<CommercialDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await cotizacionesService.obtenerTableroComercial(period)); }
    catch { setError('No pudimos cargar las métricas del período.'); }
    finally { setLoading(false); }
  }, [period]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const ranking = useMemo(() => [...(data?.rankingVendedores || [])].sort((a, b) => b[rankingSort] - a[rankingSort]), [data, rankingSort]);
  const summary = data?.resumen;
  return <View style={styles.screen}><ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact]} showsVerticalScrollIndicator={false}>
    <ScreenHeader eyebrow="INTELIGENCIA COMERCIAL" title="Métricas" subtitle={isAdmin ? 'Entendé qué vende, quién impulsa el negocio y dónde están las oportunidades.' : 'Seguí tus ventas, tu ganancia y tu evolución mes a mes.'} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.months}>
      {months.map(month => <Pressable key={month} onPress={() => setPeriod(month)} style={[styles.monthChip, month === period && styles.monthChipActive]}><Text style={[styles.monthText, month === period && styles.monthTextActive]}>{monthLabel(month, true)}</Text></Pressable>)}
    </ScrollView>
    {loading ? <CardListSkeleton count={3} /> : error || !data || !summary ? <DataStatePanel status="error" title="No pudimos cargar las métricas" message={error} actionLabel="Reintentar" onAction={() => void load()} /> : <>
      <View style={styles.metricsGrid}>
        <MetricCard icon="shopping-bag" label="Ventas confirmadas" value={String(summary.ventas)} change={summary.cambios.ventas} />
        <MetricCard icon="payments" label="Monto vendido" value={money(summary.montoVendido)} change={summary.cambios.montoVendido} tone="mint" />
        <MetricCard icon="savings" label={isAdmin ? 'Ganancia de vendedores' : 'Tu ganancia'} value={money(summary.ganancia)} change={summary.cambios.ganancia} tone="peach" />
        {isAdmin ? <MetricCard icon="forum" label="Consultas recibidas" value={String(summary.consultas)} change={summary.cambios.consultas} tone="sky" /> : <MetricCard icon="account-balance-wallet" label="Dinero a rendir" value={money(summary.dineroARendir)} change={summary.cambios.montoVendido} tone="sky" />}
      </View>
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}><View><Text style={styles.cardTitle}>Evolución de los últimos meses</Text><Text style={styles.cardSubtitle}>{chartMetric === 'montoVendido' ? 'Monto vendido' : 'Cantidad de ventas'}</Text></View><View style={styles.switcher}><Pressable onPress={() => setChartMetric('montoVendido')} style={[styles.switchChip, chartMetric === 'montoVendido' && styles.switchChipActive]}><Text style={styles.switchText}>Monto</Text></Pressable><Pressable onPress={() => setChartMetric('ventas')} style={[styles.switchChip, chartMetric === 'ventas' && styles.switchChipActive]}><Text style={styles.switchText}>Ventas</Text></Pressable></View></View>
        {data.historialMensual.length ? <SalesChart data={data.historialMensual} metric={chartMetric} /> : <Text style={styles.empty}>Las ventas confirmadas aparecerán acá para mostrar su evolución.</Text>}
      </View>
      {isAdmin ? <>
        <View style={styles.rankingCard}><View style={styles.cardHeader}><View><Text style={styles.cardTitle}>Posiciones de vendedores</Text><Text style={styles.cardSubtitle}>Desempeño durante {monthLabel(data.periodo, true)}</Text></View><View style={styles.switcher}><Pressable onPress={() => setRankingSort('ventas')} style={[styles.switchChip, rankingSort === 'ventas' && styles.switchChipActive]}><Text style={styles.switchText}>Ventas</Text></Pressable><Pressable onPress={() => setRankingSort('montoVendido')} style={[styles.switchChip, rankingSort === 'montoVendido' && styles.switchChipActive]}><Text style={styles.switchText}>Monto</Text></Pressable></View></View>
          {ranking.length ? ranking.map((seller, index) => <View key={seller.vendedorId} style={styles.sellerRow}><View style={[styles.medal, index === 0 && styles.medalFirst]}><Text style={styles.medalText}>{index + 1}</Text></View><View style={styles.sellerCopy}><Text style={styles.sellerName}>{seller.nombre}</Text><Text style={styles.sellerMeta}>{seller.ventas} ventas · {money(seller.ganancia)} de ganancia</Text></View><Text style={styles.sellerAmount}>{money(seller.montoVendido)}</Text></View>) : <Text style={styles.empty}>Todavía no hay ventas de vendedores este mes.</Text>}
        </View>
        <View style={styles.listsGrid}>
          <ProductList title="Productos más vendidos" icon="emoji-events" items={data.productosMasVendidos.map(item => ({ key: item._id, name: `${item.marca} ${item.modelo}`, value: `${item.unidades} u.` }))} />
          <ProductList title="Productos más consultados" icon="question-answer" items={data.productosMasConsultados.map(item => ({ key: item._id, name: `${item.marca} ${item.modelo}`, value: `${item.consultas}` }))} />
          <ProductList title="Mayor variación de precio" icon="show-chart" items={data.productosMayorVariacion.map(item => ({ key: item.productoId, name: `${item.marca} ${item.modelo}`, value: money(item.variacionAbsoluta) }))} />
        </View>
      </> : <View style={styles.listsGrid}>
        <ProductList title="Tus productos vendidos" icon="inventory-2" items={data.productosMasVendidos.map(item => ({ key: item._id, name: `${item.marca} ${item.modelo}`, value: `${item.unidades} u.` }))} />
      </View>}
    </>}
  </ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, content: { width: '100%', maxWidth: 1460, alignSelf: 'center', padding: SPACING.xl, paddingBottom: 120 }, contentCompact: { padding: SPACING.md, paddingBottom: 110 },
  months: { gap: SPACING.sm, paddingVertical: SPACING.lg }, monthChip: { paddingHorizontal: SPACING.md, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full, backgroundColor: COLORS.surface }, monthChipActive: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.primary + '28' }, monthText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' }, monthTextActive: { color: COLORS.primaryDark },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.lg }, metricCard: { minWidth: 220, flex: 1, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, ...SHADOWS.sm }, metricIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, borderRadius: RADIUS.md }, metricIcon_primary: { backgroundColor: COLORS.primary + '55' }, metricIcon_mint: { backgroundColor: COLORS.secondary }, metricIcon_peach: { backgroundColor: COLORS.accent }, metricIcon_sky: { backgroundColor: COLORS.info }, metricLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' }, metricValue: { marginTop: 3, color: COLORS.text, fontSize: 25, fontWeight: '900' }, trend: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm, paddingHorizontal: 7, paddingVertical: 4, borderRadius: RADIUS.full }, trendPositive: { backgroundColor: COLORS.success + '70' }, trendNegative: { backgroundColor: COLORS.error + '60' }, trendText: { fontSize: 10, fontWeight: '800' },
  chartCard: { marginBottom: SPACING.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, ...SHADOWS.sm }, cardHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md, marginBottom: SPACING.md }, cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' }, cardSubtitle: { marginTop: 2, color: COLORS.textSecondary, fontSize: 12 }, switcher: { flexDirection: 'row', gap: 3, padding: 3, borderRadius: RADIUS.full, backgroundColor: COLORS.cardBackground }, switchChip: { paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: RADIUS.full }, switchChipActive: { backgroundColor: COLORS.surface, ...SHADOWS.sm }, switchText: { color: COLORS.text, fontSize: 11, fontWeight: '800' }, chartCanvas: { width: '100%', overflow: 'hidden' }, chartLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.sm }, chartLabel: { flex: 1, color: COLORS.textSecondary, fontSize: 10, textAlign: 'center' },
  rankingCard: { marginBottom: SPACING.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface }, sellerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border }, medal: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.cardBackground }, medalFirst: { backgroundColor: COLORS.warning }, medalText: { color: COLORS.ink, fontWeight: '900' }, sellerCopy: { minWidth: 0, flex: 1 }, sellerName: { color: COLORS.text, fontSize: 14, fontWeight: '800' }, sellerMeta: { marginTop: 2, color: COLORS.textSecondary, fontSize: 11 }, sellerAmount: { color: COLORS.primaryDark, fontSize: 14, fontWeight: '900' },
  listsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }, listCard: { minWidth: Platform.OS === 'web' ? 300 : 0, flex: 1, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface }, cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md }, smallIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.primary + '25' }, listRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border }, position: { width: 20, color: COLORS.primaryDark, fontSize: 12, fontWeight: '900' }, productName: { minWidth: 0, flex: 1, color: COLORS.text, fontSize: 12, fontWeight: '700' }, productValue: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '800' }, empty: { paddingVertical: SPACING.xl, color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
});
