import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';

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
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    const rotateAnimation = Animated.loop(Animated.timing(rotation, {
      toValue: 1, duration: 1300, useNativeDriver: true,
    }));
    const pulseAnimation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.72, duration: 700, useNativeDriver: true }),
    ]));
    rotateAnimation.start();
    pulseAnimation.start();
    return () => { rotateAnimation.stop(); pulseAnimation.stop(); };
  }, [pulse, rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <View style={styles.launch} accessibilityLabel="Cargando Hogar Conectado">
    <View style={styles.launchBrand}>
      <Animated.View style={[styles.launchRing, { transform: [{ rotate: spin }] }]} />
      <Animated.View style={[styles.launchLogoFrame, { opacity: pulse }]}>
        <Image
          source={require('@/assets/images/logo-transparent-circle.png')}
          style={styles.launchLogo}
          contentFit="contain"
          cachePolicy="memory-disk"
          accessibilityLabel="Logo de Hogar Conectado"
        />
      </Animated.View>
    </View>
    <Text style={styles.launchTitle}>Hogar Conectado</Text>
    <Text style={styles.launchSubtitle}>Conectando con tu vidriera…</Text>
    <View style={styles.launchDots}>
      <SkeletonBlock style={styles.launchDot} />
      <SkeletonBlock style={styles.launchDot} />
      <SkeletonBlock style={styles.launchDot} />
    </View>
    <Text style={styles.launchHint}>Esto puede demorar unos segundos si el servicio está iniciando.</Text>
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
  launchBrand: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  launchRing: { position: 'absolute', width: 106, height: 106, borderRadius: RADIUS.full, borderWidth: 4, borderColor: COLORS.border, borderTopColor: COLORS.primaryDark, borderRightColor: COLORS.secondaryDark },
  launchLogoFrame: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.surface },
  launchLogo: { width: 76, height: 76 },
  launchTitle: { marginTop: SPACING.md, color: COLORS.text, fontSize: 24, fontWeight: '700' },
  launchSubtitle: { marginTop: SPACING.xs, color: COLORS.textSecondary, fontSize: 14 },
  launchDots: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  launchDot: { width: 9, height: 9, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryDark },
  launchHint: { maxWidth: 290, marginTop: SPACING.lg, color: COLORS.textLight, fontSize: 12, lineHeight: 18, textAlign: 'center' },
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
