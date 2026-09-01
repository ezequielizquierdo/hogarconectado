import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/constants/theme';

function SkeletonBlock({ style }: { style?: any }) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return <Animated.View style={[styles.block, style, { opacity }]} />;
}

export function AppLaunchScreen() {
  return <View style={styles.launch} accessibilityLabel="Cargando Hogar Conectado">
    <View style={styles.launchMark}><Text style={styles.launchIcon}>⌂</Text></View>
    <Text style={styles.launchTitle}>Hogar Conectado</Text>
    <Text style={styles.launchSubtitle}>Preparando tu vidriera operativa…</Text>
    <View style={styles.launchTrack}><SkeletonBlock style={styles.launchProgress} /></View>
  </View>;
}

export function LoadingBar({ label = 'Actualizando…' }: { label?: string }) {
  return <View style={styles.loadingBar} accessibilityLiveRegion="polite">
    <SkeletonBlock style={styles.loadingBarPulse} />
    <Text style={styles.loadingBarText}>{label}</Text>
  </View>;
}

export function ProductCatalogSkeleton() {
  const { width } = useWindowDimensions();
  const columns = width >= 1280 ? 4 : width >= 760 ? 2 : 1;
  return <View style={styles.catalog} accessibilityLabel="Cargando productos">
    {Array.from({ length: columns * 2 }).map((_, index) => <View key={index} style={[styles.productCard, { width: columns === 1 ? '100%' : `${100 / columns - 2}%` }]}>
      <SkeletonBlock style={styles.productImage} /><SkeletonBlock style={styles.badge} />
      <SkeletonBlock style={styles.lineShort} /><SkeletonBlock style={styles.lineWide} />
      <SkeletonBlock style={styles.lineMedium} /><SkeletonBlock style={styles.price} />
    </View>)}
  </View>;
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return <View style={styles.list} accessibilityLabel="Cargando contenido">
    {Array.from({ length: count }).map((_, index) => <View key={index} style={styles.listCard}>
      <View style={styles.listRow}><SkeletonBlock style={styles.avatar} /><View style={styles.listCopy}>
        <SkeletonBlock style={styles.lineMedium} /><SkeletonBlock style={styles.lineWide} /><SkeletonBlock style={styles.lineShort} />
      </View></View><SkeletonBlock style={styles.listAction} />
    </View>)}
  </View>;
}

const styles = StyleSheet.create({
  block: { backgroundColor: '#e9edff', borderRadius: RADIUS.sm },
  launch: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, backgroundColor: COLORS.background },
  launchMark: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.secondary, borderWidth: 1, borderColor: COLORS.border },
  launchIcon: { color: COLORS.primaryDark, fontSize: 38, fontWeight: '700' },
  launchTitle: { marginTop: SPACING.md, color: COLORS.text, fontSize: 24, fontWeight: '700' },
  launchSubtitle: { marginTop: SPACING.xs, color: COLORS.textSecondary, fontSize: 14 },
  launchTrack: { width: 180, height: 4, marginTop: SPACING.lg, overflow: 'hidden', borderRadius: RADIUS.full, backgroundColor: COLORS.border },
  launchProgress: { width: '70%', height: '100%', backgroundColor: COLORS.primaryDark },
  loadingBar: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  loadingBarPulse: { width: 42, height: 5, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryDark },
  loadingBarText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  catalog: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACING.md },
  productCard: { minHeight: 390, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface },
  productImage: { width: '100%', height: 210, marginBottom: SPACING.md, borderRadius: RADIUS.md },
  badge: { width: 90, height: 28, marginBottom: SPACING.md },
  lineShort: { width: '35%', height: 11, marginBottom: SPACING.sm },
  lineWide: { width: '78%', height: 17, marginBottom: SPACING.sm },
  lineMedium: { width: '58%', height: 13, marginBottom: SPACING.sm },
  price: { width: 120, height: 25, marginTop: SPACING.sm },
  list: { width: '100%', gap: SPACING.md },
  listCard: { width: '100%', padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface },
  listRow: { flexDirection: 'row', gap: SPACING.md }, avatar: { width: 88, height: 88, borderRadius: RADIUS.md },
  listCopy: { flex: 1, justifyContent: 'center' }, listAction: { width: '100%', height: 42, marginTop: SPACING.md, borderRadius: RADIUS.md },
});
