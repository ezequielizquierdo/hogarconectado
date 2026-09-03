import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from '@/components/ThemedText';
import { ProductImageDraft } from '@/services/types';
import { productAssistantService } from '@/services/productAssistantService';
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';

type DraftItem = {
  id: string;
  uri: string;
  name: string;
  status: 'pending' | 'analyzing' | 'ready' | 'saving' | 'created' | 'error';
  draft?: ProductImageDraft;
  error?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreateDraft: (draft: ProductImageDraft, imageUri: string) => Promise<void>;
};

const getErrorMessage = (error: any) => error?.response?.data?.message || error?.message || 'No pudimos analizar esta imagen.';

export function ProductImageImportModal({ visible, onClose, onCreateDraft }: Props) {
  const [items, setItems] = useState<DraftItem[]>([]);
  const [selecting, setSelecting] = useState(false);

  const addAndAnalyze = async (assets: { uri: string; name?: string | null; fileName?: string | null }[]) => {
    const additions = assets.slice(0, 10).map((asset, index) => ({
      id: `${Date.now()}-${index}`,
      uri: asset.uri,
      name: asset.name || asset.fileName || `Imagen ${items.length + index + 1}`,
      status: 'pending' as const,
    }));
    setItems(current => [...current, ...additions]);

    for (const item of additions) {
      setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'analyzing' } : candidate));
      try {
        const draft = await productAssistantService.analizarImagen(item.uri);
        setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'ready', draft } : candidate));
      } catch (error) {
        setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'error', error: getErrorMessage(error) } : candidate));
      }
    }
  };

  const pickGallery = async () => {
    setSelecting(true);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para seleccionar productos.');
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.85,
      });
      if (!result.canceled) await addAndAnalyze(result.assets);
    } finally {
      setSelecting(false);
    }
  };

  const pickFiles = async () => {
    setSelecting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', multiple: true, copyToCacheDirectory: true });
      if (!result.canceled) await addAndAnalyze(result.assets);
    } finally {
      setSelecting(false);
    }
  };

  const updateDraft = (id: string, field: keyof ProductImageDraft, value: string | number | boolean) => {
    setItems(current => current.map(item => item.id === id && item.draft
      ? { ...item, draft: { ...item.draft, [field]: value } }
      : item));
  };

  const remove = (id: string) => setItems(current => current.filter(item => item.id !== id));
  const createProduct = async (item: DraftItem) => {
    if (!item.draft || item.status !== 'ready') return;
    setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'saving', error: undefined } : candidate));
    try {
      await onCreateDraft(item.draft, item.uri);
      setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'created' } : candidate));
    } catch (error) {
      setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'ready', error: getErrorMessage(error) } : candidate));
    }
  };
  const busy = selecting || items.some(item => item.status === 'analyzing' || item.status === 'pending' || item.status === 'saving');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={busy ? undefined : onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <ThemedText style={styles.eyebrow}>ALTA ASISTIDA</ThemedText>
              <ThemedText style={styles.title}>Crear desde imágenes</ThemedText>
              <ThemedText style={styles.subtitle}>Una imagen equivale a un producto. Revisá los datos antes de guardarlo.</ThemedText>
            </View>
            <TouchableOpacity style={styles.close} disabled={busy} onPress={onClose} accessibilityLabel="Cerrar alta asistida">
              <MaterialIcons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.sourceActions}>
            <TouchableOpacity style={styles.primaryButton} disabled={selecting} onPress={pickGallery}>
              <MaterialIcons name="photo-library" size={20} color={COLORS.ink} />
              <ThemedText style={styles.primaryButtonText}>{Platform.OS === 'web' ? 'Elegir imágenes' : 'Galería del teléfono'}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} disabled={selecting} onPress={pickFiles}>
              <MaterialIcons name="folder-open" size={20} color={COLORS.text} />
              <ThemedText style={styles.secondaryButtonText}>Archivos</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
            {items.length === 0 ? (
              <View style={styles.empty}>
                <MaterialIcons name="auto-awesome" size={34} color={COLORS.primaryDark} />
                <ThemedText style={styles.emptyTitle}>Seleccioná hasta 10 imágenes</ThemedText>
                <ThemedText style={styles.emptyText}>Analizaremos marca, modelo, categoría, precio, stock y descripción de cada una.</ThemedText>
              </View>
            ) : items.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="contain" />
                  <View style={styles.cardStatus}>
                    <ThemedText numberOfLines={1} style={styles.fileName}>{item.name}</ThemedText>
                    {item.status === 'analyzing' || item.status === 'pending' ? (
                      <View style={styles.statusRow}><ActivityIndicator color={COLORS.primaryDark} /><ThemedText style={styles.statusText}>Leyendo producto…</ThemedText></View>
                    ) : item.status === 'error' ? (
                      <ThemedText style={styles.errorText}>{item.error}</ThemedText>
                    ) : item.status === 'created' ? (
                      <ThemedText style={styles.readyText}>Producto creado correctamente</ThemedText>
                    ) : (
                      <ThemedText style={styles.readyText}>Borrador listo · {Math.round((item.draft?.confianza || 0) * 100)}% de confianza</ThemedText>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => remove(item.id)} disabled={item.status === 'analyzing'} accessibilityLabel={`Quitar ${item.name}`}>
                    <MaterialIcons name="close" size={20} color={COLORS.errorStrong} />
                  </TouchableOpacity>
                </View>

                {(item.status === 'ready' || item.status === 'saving' || item.status === 'created') && item.draft ? (
                  <View style={styles.fields}>
                    <View style={styles.field}><ThemedText style={styles.label}>Marca *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={item.draft.marca} placeholder="Marca" onChangeText={value => updateDraft(item.id, 'marca', value)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Modelo *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={item.draft.modelo} placeholder="Modelo" onChangeText={value => updateDraft(item.id, 'modelo', value)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Categoría *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={item.draft.categoriaSugerida} placeholder="Categoría sugerida" onChangeText={value => updateDraft(item.id, 'categoriaSugerida', value)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Precio base *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={item.draft.precioBase?.toString() || ''} placeholder="Precio base" keyboardType="numeric" onChangeText={value => updateDraft(item.id, 'precioBase', Number(value.replace(/\D/g, '')) || 0)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Porcentaje para precio contado *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={String(item.draft.porcentajeGanancia ?? 30)} placeholder="Ej.: 30" keyboardType="decimal-pad" onChangeText={value => updateDraft(item.id, 'porcentajeGanancia', Number(value.replace(',', '.')) || 0)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Stock cantidad</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={String(item.draft.stockCantidad)} placeholder="Stock" keyboardType="numeric" onChangeText={value => updateDraft(item.id, 'stockCantidad', Number(value.replace(/\D/g, '')) || 0)} /></View>
                    <View style={styles.field}>
                      <ThemedText style={styles.label}>Stock disponible</ThemedText>
                      <TouchableOpacity disabled={item.status !== 'ready'} style={styles.stockToggle} onPress={() => updateDraft(item.id, 'stockDisponible', !item.draft!.stockDisponible)}>
                        <ThemedText style={styles.stockToggleText}>{item.draft.stockDisponible ? 'Disponible' : 'No disponible'}</ThemedText>
                        <MaterialIcons name={item.draft.stockDisponible ? 'toggle-on' : 'toggle-off'} size={30} color={item.draft.stockDisponible ? '#21734b' : COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.field}><ThemedText style={styles.label}>Descripción</ThemedText><TextInput editable={item.status === 'ready'} style={[styles.input, styles.description]} value={item.draft.descripcion} placeholder="Descripción" multiline onChangeText={value => updateDraft(item.id, 'descripcion', value)} /></View>
                    {item.draft.advertencias.length > 0 ? (
                      <View style={styles.warning}><MaterialIcons name="info-outline" size={18} color="#8a5b00" /><ThemedText style={styles.warningText}>{item.draft.advertencias.join(' ')}</ThemedText></View>
                    ) : null}
                    {item.error ? <ThemedText style={styles.errorText}>{item.error}</ThemedText> : null}
                    <TouchableOpacity disabled={item.status !== 'ready'} style={[styles.reviewButton, item.status !== 'ready' && styles.reviewButtonDisabled]} onPress={() => createProduct(item)}>
                      {item.status === 'saving' ? <ActivityIndicator color={COLORS.ink} /> : <MaterialIcons name={item.status === 'created' ? 'check-circle' : 'add-circle'} size={18} color={COLORS.ink} />}
                      <ThemedText style={styles.reviewButtonText}>{item.status === 'saving' ? 'Creando producto…' : item.status === 'created' ? 'Producto creado' : 'Crear producto'}</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(29,36,64,0.55)', alignItems: 'center', justifyContent: 'center', padding: SPACING.md },
  container: { width: '100%', maxWidth: 760, maxHeight: '92%', backgroundColor: COLORS.background, borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOWS.lg },
  header: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerCopy: { flex: 1 }, eyebrow: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: 2 }, subtitle: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 4 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.cardBackground, alignItems: 'center', justifyContent: 'center' },
  sourceActions: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface },
  primaryButton: { flex: 1, minHeight: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  secondaryButton: { minHeight: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  primaryButtonText: { color: COLORS.ink, fontWeight: '700' }, secondaryButtonText: { color: COLORS.text, fontWeight: '700' },
  list: { flexGrow: 0 }, listContent: { padding: SPACING.md, gap: SPACING.md },
  empty: { minHeight: 240, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl }, emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md }, emptyText: { color: COLORS.textSecondary, textAlign: 'center', maxWidth: 440, marginTop: SPACING.sm, lineHeight: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, ...SHADOWS.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md }, thumbnail: { width: 78, height: 78, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground }, cardStatus: { flex: 1 }, fileName: { color: COLORS.text, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm }, statusText: { color: COLORS.textSecondary, fontSize: 13 }, readyText: { color: '#21734b', fontSize: 13, marginTop: 5 }, errorText: { color: COLORS.errorStrong, fontSize: 13, marginTop: 5 },
  fields: { gap: SPACING.md, marginTop: SPACING.md }, field: { gap: SPACING.xs }, label: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  input: { minHeight: 44, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground, color: COLORS.text, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }, description: { minHeight: 70, textAlignVertical: 'top' },
  stockToggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.cardBackground, paddingHorizontal: SPACING.md }, stockToggleText: { color: COLORS.text, fontSize: 14 },
  warning: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: '#fff7df', padding: SPACING.sm, borderRadius: RADIUS.md }, warningText: { flex: 1, color: '#6c4b08', fontSize: 12, lineHeight: 17 },
  reviewButton: { minHeight: 46, backgroundColor: COLORS.secondary, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }, reviewButtonDisabled: { opacity: 0.7 }, reviewButtonText: { color: COLORS.ink, fontWeight: '800' },
});
