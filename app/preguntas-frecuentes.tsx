import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

type FaqItem = {
  id: string;
  question: string;
  answer: React.ReactNode;
};

function getBuyerQuestions(): FaqItem[] {
  return [
  {
    id: 'comprar-producto',
    question: 'Quiero comprar un producto. ¿Cómo hago?',
    answer: (
      <View style={styles.answerSteps}>
        <Step number="1" text="Explorá el catálogo y elegí uno o varios productos." />
        <Step number="2" text="Presioná “Lo quiero” para agregarlos a tu consulta." />
        <Step number="3" text="Revisá la selección, ingresá tu nombre y teléfono, y enviá la consulta." />
        <Step number="4" text="Un vendedor se comunicará para confirmar disponibilidad, precio, pago y entrega." />
        <Text style={styles.answerNote}>Consultar no confirma la compra ni reserva el producto. La operación queda confirmada cuando se acuerdan el pago y la entrega.</Text>
      </View>
    ),
  },
  ];
}

function getSellerQuestions(): FaqItem[] {
  return [
  {
    id: 'comision-vendedor',
    question: '¿Cuál es mi comisión por vender un producto?',
    answer: (
      <View style={styles.answerSteps}>
        <Text style={styles.answerText}>Recibís el <Text style={styles.answerStrong}>60% del margen comercial</Text> de la venta. El 40% restante corresponde a Hogar Conectado.</Text>
        <View style={styles.exampleBox}>
          <Text style={styles.exampleLabel}>EJEMPLO</Text>
          <Text style={styles.exampleText}>Si el costo a rendir es $371.000 y vendés a $430.000, el margen es $59.000.</Text>
          <Text style={styles.exampleResult}>Tu comisión: $35.400</Text>
          <Text style={styles.exampleText}>Hogar Conectado: $23.600</Text>
        </View>
        <Text style={styles.answerNote}>El envío se cobra aparte, se rinde completo y no forma parte de la comisión.</Text>
      </View>
    ),
  },
  {
    id: 'ofrecer-producto',
    question: 'Quiero ofrecer un producto mío. ¿Cómo hago y cómo se reparten las comisiones?',
    answer: (
      <View style={styles.answerSteps}>
        <Step number="1" text="Ingresá a “Sumate” y elegí “Quiero sumar productos”." />
        <Step number="2" text="Contanos qué ofrecés y dejá tus datos de contacto." />
        <Step number="3" text="El administrador revisará el producto y acordará con vos el importe que debés recibir antes de publicarlo." />
        <Step number="4" text="Cuando se vende, primero se contempla ese importe acordado. El margen comercial restante se distribuye: 60% para quien realizó la venta y 40% para Hogar Conectado." />
        <Text style={styles.answerNote}>Si vos también concretás la venta, recibís tanto el importe acordado por tu producto como la comisión que te corresponde como vendedor.</Text>
      </View>
    ),
  },
  ];
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{number}</Text></View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function FaqCard({ item, expanded, onPress }: { item: FaqItem; expanded: boolean; onPress: () => void }) {
  return (
    <View style={[styles.faqCard, expanded && styles.faqCardExpanded]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onPress}
        style={({ pressed }) => [styles.questionButton, pressed && styles.pressed]}
      >
        <Text style={styles.question}>{item.question}</Text>
        <View style={[styles.chevron, expanded && styles.chevronExpanded]}>
          <MaterialIcons name={expanded ? 'remove' : 'add'} size={21} color={COLORS.ink} />
        </View>
      </Pressable>
      {expanded ? <View style={styles.answer}>{item.answer}</View> : null}
    </View>
  );
}

function Section({ eyebrow, title, description, icon, questions, openId, setOpenId }: {
  eyebrow: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  questions: FaqItem[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}><MaterialIcons name={icon} size={24} color={COLORS.ink} /></View>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.faqList}>
        {questions.map(item => (
          <FaqCard key={item.id} item={item} expanded={openId === item.id} onPress={() => setOpenId(openId === item.id ? null : item.id)} />
        ))}
      </View>
    </View>
  );
}

export default function PreguntasFrecuentesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { state, user } = useAuth();
  const [openId, setOpenId] = useState<string | null>('comprar-producto');
  const showSellerQuestions = user?.rol === 'vendedor' || user?.rol === 'admin';
  const wide = Platform.OS === 'web' && width >= 900;
  const buyerQuestions = getBuyerQuestions();
  const sellerQuestions = getSellerQuestions();

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/productos')} style={({ pressed }) => [styles.brand, pressed && styles.pressed]}>
          <Image source={require('../assets/images/logo-transparent-circle.png')} style={styles.logo} contentFit="contain" />
          <View><Text style={styles.brandName}>Hogar Conectado</Text><Text style={styles.brandCaption}>Tu vidriera operativa</Text></View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar preguntas frecuentes" onPress={() => router.back()} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
          <MaterialIcons name="close" size={24} color={COLORS.text} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>CENTRO DE AYUDA</Text>
        <Text style={styles.heroTitle}>Preguntas frecuentes</Text>
        <Text style={styles.heroSubtitle}>Respuestas simples para comprar, vender y entender cómo funciona Hogar Conectado.</Text>
      </View>

      <View style={[styles.sections, wide && showSellerQuestions && styles.sectionsWide]}>
        <Section eyebrow="PARA COMPRADORES" title="Comprar" description="Desde elegir un producto hasta coordinar la operación." icon="shopping-bag" questions={buyerQuestions} openId={openId} setOpenId={setOpenId} />
        {showSellerQuestions ? (
          <Section eyebrow="PARA VENDEDORES" title="Vender" description="Comisiones, productos propios y próximos pasos." icon="storefront" questions={sellerQuestions} openId={openId} setOpenId={setOpenId} />
        ) : null}
      </View>

      <View style={styles.helpCard}>
        <MaterialIcons name="support-agent" size={25} color={COLORS.primaryDark} />
        <View style={styles.helpCopy}><Text style={styles.helpTitle}>¿No encontraste tu respuesta?</Text><Text style={styles.helpText}>Podés consultar por un producto desde el catálogo o enviarnos una solicitud para sumarte.</Text></View>
        <Pressable accessibilityRole="button" onPress={() => router.push(state === 'unauthenticated' ? '/sumate' : '/(tabs)/productos')} style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}>
          <Text style={styles.helpButtonText}>{state === 'unauthenticated' ? 'Quiero sumarme' : 'Ir a Productos'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center', padding: SPACING.md, paddingBottom: SPACING.xxl },
  topbar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logo: { width: 46, height: 46 },
  brandName: { color: COLORS.ink, fontSize: 17, fontWeight: '800' },
  brandCaption: { color: COLORS.textSecondary, fontSize: 11 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  pressed: { opacity: 0.72 },
  hero: { maxWidth: 720, marginBottom: SPACING.xl },
  heroEyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  heroTitle: { color: COLORS.ink, fontSize: 34, lineHeight: 41, fontWeight: '900', marginTop: 4 },
  heroSubtitle: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 23, marginTop: 5 },
  sections: { gap: SPACING.lg },
  sectionsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  section: { flex: 1, minWidth: 0, padding: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, borderTopWidth: 4, borderColor: COLORS.border, borderTopColor: COLORS.primary, backgroundColor: COLORS.surface, ...SHADOWS.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.lg },
  sectionIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.secondary },
  sectionCopy: { flex: 1, gap: 2 },
  sectionEyebrow: { color: COLORS.primaryDark, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  sectionTitle: { color: COLORS.ink, fontSize: 23, fontWeight: '900' },
  sectionDescription: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  faqList: { gap: SPACING.sm },
  faqCard: { overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.cardBackground },
  faqCardExpanded: { borderColor: COLORS.primaryDark, backgroundColor: COLORS.surface },
  questionButton: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  question: { flex: 1, color: COLORS.text, fontSize: 15, lineHeight: 21, fontWeight: '800' },
  chevron: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.surface },
  chevronExpanded: { backgroundColor: COLORS.primary },
  answer: { borderTopWidth: 1, borderTopColor: COLORS.border, padding: SPACING.md },
  answerSteps: { gap: SPACING.sm },
  answerText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  answerStrong: { color: COLORS.text, fontWeight: '900' },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  stepNumber: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.primary },
  stepNumberText: { color: COLORS.ink, fontSize: 12, fontWeight: '900' },
  stepText: { flex: 1, color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, paddingTop: 2 },
  answerNote: { color: COLORS.text, fontSize: 13, lineHeight: 19, fontWeight: '700', padding: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.secondary + '55' },
  exampleBox: { gap: 4, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground },
  exampleLabel: { color: COLORS.primaryDark, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  exampleText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  exampleResult: { color: COLORS.primaryDark, fontSize: 17, fontWeight: '900' },
  helpCard: { marginTop: SPACING.lg, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.md, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface },
  helpCopy: { flex: 1, minWidth: 220 },
  helpTitle: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  helpText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 2 },
  helpButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  helpButtonText: { color: COLORS.ink, fontSize: 13, fontWeight: '900' },
});
