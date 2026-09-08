import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from '@/components/ThemedText';
import { ProductImageDraft } from '@/services/types';
import { productAssistantService } from '@/services/productAssistantService';
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import { DuplicateFieldKey as ComparisonFieldKey, DuplicateSource as ComparisonSource, getDuplicateChoiceValue, getDuplicateOriginalValues } from '@/utils/productDuplicate';

type DraftItem = {
  id: string;
  uri: string;
  name: string;
  status: 'pending' | 'analyzing' | 'ready' | 'saving' | 'created' | 'error';
  draft?: ProductImageDraft;
  error?: string;
  duplicateConfirmed?: boolean;
  selectedDuplicateId?: string;
  detectedDraft?: ProductImageDraft;
  duplicateImageSource?: 'original' | 'new';
  fieldSelections?: Partial<Record<ComparisonFieldKey, ComparisonSource>>;
  savedAs?: 'created' | 'updated';
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreateDraft: (draft: ProductImageDraft, imageUri: string, allowDuplicate?: boolean) => Promise<void>;
  onUpdateDuplicate: (
    existing: NonNullable<ProductImageDraft['possibleDuplicates']>[number],
    draft: ProductImageDraft,
    imageUri: string,
    useNewImage: boolean,
  ) => Promise<void>;
};

const getErrorMessage = (error: any) => error?.response?.data?.message || error?.message || 'No pudimos analizar esta imagen.';
const comparisonFields = [
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'categoriaSugerida', label: 'Categoría' },
  { key: 'precioBase', label: 'Precio base' },
  { key: 'porcentajeGanancia', label: 'Porcentaje' },
  { key: 'stockCantidad', label: 'Cantidad' },
  { key: 'stockDisponible', label: 'Disponibilidad' },
  { key: 'descripcion', label: 'Descripción' },
] as const;

const displayComparisonValue = (value: unknown) => {
  if (typeof value === 'boolean') return value ? 'Disponible' : 'No disponible';
  if (value === null || value === undefined || value === '') return 'Sin dato';
  return String(value);
};

export function ProductImageImportModal({ visible, onClose, onCreateDraft, onUpdateDuplicate }: Props) {
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
        const firstDuplicate = draft.possibleDuplicates?.[0];
        setItems(current => current.map(candidate => candidate.id === item.id ? {
          ...candidate,
          status: 'ready',
          draft: firstDuplicate ? { ...draft, ...getDuplicateOriginalValues(firstDuplicate) } : draft,
          detectedDraft: draft,
          selectedDuplicateId: draft.possibleDuplicates?.[0]?._id,
          duplicateImageSource: 'original',
          fieldSelections: Object.fromEntries(comparisonFields.map(field => [field.key, 'original'])) as Record<ComparisonFieldKey, ComparisonSource>,
        } : candidate));
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

  const updateDraft = (id: string, field: keyof ProductImageDraft, value: string | number | boolean, keepDuplicates = false) => {
    setItems(current => current.map(item => item.id === id && item.draft
      ? (() => {
          const preserveComparison = keepDuplicates || (item.draft.possibleDuplicates?.length || 0) > 0;
          return {
          ...item,
          duplicateConfirmed: !preserveComparison && (field === 'marca' || field === 'modelo') ? false : item.duplicateConfirmed,
          draft: {
            ...item.draft,
            [field]: value,
            ...(!preserveComparison && (field === 'marca' || field === 'modelo') ? { possibleDuplicates: [] } : {}),
          },
        };
        })()
      : item));
  };

  const remove = (id: string) => setItems(current => current.filter(item => item.id !== id));
  const createProduct = async (item: DraftItem, allowDuplicate = item.duplicateConfirmed || false) => {
    if (!item.draft || item.status !== 'ready') return;
    if (!allowDuplicate) {
      try {
        const possibleDuplicates = await productAssistantService.buscarDuplicados(item.draft.marca, item.draft.modelo);
        if (possibleDuplicates.length > 0) {
          setItems(current => current.map(candidate => candidate.id === item.id && candidate.draft
            ? { ...candidate, draft: { ...candidate.draft, possibleDuplicates }, duplicateConfirmed: false }
            : candidate));
          return;
        }
      } catch (error) {
        setItems(current => current.map(candidate => candidate.id === item.id
          ? { ...candidate, error: getErrorMessage(error) }
          : candidate));
        return;
      }
    }
    setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'saving', error: undefined } : candidate));
    try {
      await onCreateDraft(item.draft, item.uri, allowDuplicate);
      setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'created', savedAs: 'created' } : candidate));
    } catch (error) {
      setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'ready', error: getErrorMessage(error) } : candidate));
    }
  };

  const chooseDuplicateField = (
    item: DraftItem,
    field: ComparisonFieldKey,
    source: ComparisonSource,
  ) => {
    const duplicate = item.draft?.possibleDuplicates?.find(candidate => candidate._id === item.selectedDuplicateId);
    const detected = item.detectedDraft;
    if (!duplicate || !detected) return;
    updateDraft(item.id, field, getDuplicateChoiceValue(duplicate, detected, field, source), true);
    setItems(current => current.map(candidate => candidate.id === item.id
      ? { ...candidate, fieldSelections: { ...candidate.fieldSelections, [field]: source } }
      : candidate));
  };

  const updateDetectedField = (item: DraftItem, field: ComparisonFieldKey, value: string | number | boolean) => {
    setItems(current => current.map(candidate => {
      if (candidate.id !== item.id || !candidate.detectedDraft || !candidate.draft) return candidate;
      const selected = candidate.fieldSelections?.[field] === 'new';
      return {
        ...candidate,
        detectedDraft: { ...candidate.detectedDraft, [field]: value },
        draft: selected ? { ...candidate.draft, [field]: value } : candidate.draft,
      };
    }));
  };

  const chooseAllDuplicateFields = (item: DraftItem, source: ComparisonSource) => {
    comparisonFields.forEach(field => chooseDuplicateField(item, field.key, source));
    setItems(current => current.map(candidate => candidate.id === item.id
      ? { ...candidate, duplicateImageSource: source === 'original' ? 'original' : 'new' }
      : candidate));
  };

  const selectDuplicate = (itemId: string, duplicate: NonNullable<ProductImageDraft['possibleDuplicates']>[number]) => {
    setItems(current => current.map(candidate => candidate.id === itemId && candidate.draft
      ? {
          ...candidate,
          selectedDuplicateId: duplicate._id,
          duplicateImageSource: 'original',
          fieldSelections: Object.fromEntries(comparisonFields.map(field => [field.key, 'original'])) as Record<ComparisonFieldKey, ComparisonSource>,
          draft: { ...candidate.draft, ...getDuplicateOriginalValues(duplicate) },
        }
      : candidate));
  };

  const updateExisting = async (item: DraftItem) => {
    if (!item.draft || item.status !== 'ready') return;
    const duplicate = item.draft.possibleDuplicates?.find(candidate => candidate._id === item.selectedDuplicateId);
    if (!duplicate) return;
    setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'saving', error: undefined } : candidate));
    try {
      await onUpdateDuplicate(duplicate, item.draft, item.uri, item.duplicateImageSource !== 'original');
      setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: 'created', savedAs: 'updated' } : candidate));
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
                      <ThemedText style={styles.readyText}>{item.savedAs === 'updated' ? 'Producto actualizado correctamente' : 'Producto creado correctamente'}</ThemedText>
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
                    {(item.draft.possibleDuplicates?.length || 0) === 0 ? <>
                    <View style={styles.field}><ThemedText style={styles.label}>Marca *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={item.draft.marca} placeholder="Marca" onChangeText={value => updateDraft(item.id, 'marca', value)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Modelo *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={item.draft.modelo} placeholder="Modelo" onChangeText={value => updateDraft(item.id, 'modelo', value)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Categoría *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={item.draft.categoriaSugerida} placeholder="Categoría sugerida" onChangeText={value => updateDraft(item.id, 'categoriaSugerida', value)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Precio base *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={item.draft.precioBase?.toString() || ''} placeholder="Precio base" keyboardType="numeric" onChangeText={value => updateDraft(item.id, 'precioBase', Number(value.replace(/\D/g, '')) || 0)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Porcentaje para precio contado *</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={String(item.draft.porcentajeGanancia ?? 10)} placeholder="Ej.: 10" keyboardType="decimal-pad" onChangeText={value => updateDraft(item.id, 'porcentajeGanancia', Number(value.replace(',', '.')) || 0)} /></View>
                    <View style={styles.field}><ThemedText style={styles.label}>Stock cantidad</ThemedText><TextInput editable={item.status === 'ready'} style={styles.input} value={String(item.draft.stockCantidad)} placeholder="Stock" keyboardType="numeric" onChangeText={value => updateDraft(item.id, 'stockCantidad', Number(value.replace(/\D/g, '')) || 0)} /></View>
                    <View style={styles.field}>
                      <ThemedText style={styles.label}>Stock disponible</ThemedText>
                      <TouchableOpacity disabled={item.status !== 'ready'} style={styles.stockToggle} onPress={() => updateDraft(item.id, 'stockDisponible', !item.draft!.stockDisponible)}>
                        <ThemedText style={styles.stockToggleText}>{item.draft.stockDisponible ? 'Disponible' : 'No disponible'}</ThemedText>
                        <MaterialIcons name={item.draft.stockDisponible ? 'toggle-on' : 'toggle-off'} size={30} color={item.draft.stockDisponible ? '#21734b' : COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.field}><ThemedText style={styles.label}>Descripción</ThemedText><TextInput editable={item.status === 'ready'} style={[styles.input, styles.description]} value={item.draft.descripcion} placeholder="Descripción" multiline onChangeText={value => updateDraft(item.id, 'descripcion', value)} /></View>
                    </> : null}
                    {item.draft.advertencias.length > 0 ? (
                      <View style={styles.warning}><MaterialIcons name="info-outline" size={18} color="#8a5b00" /><ThemedText style={styles.warningText}>{item.draft.advertencias.join(' ')}</ThemedText></View>
                    ) : null}
                    {(item.draft.possibleDuplicates?.length || 0) > 0 && !item.duplicateConfirmed ? (
                      <View style={styles.duplicateWarning}>
                        <View style={styles.duplicateHeading}>
                          <MaterialIcons name="warning-amber" size={20} color={COLORS.errorStrong} />
                          <ThemedText style={styles.duplicateTitle}>Este producto podría estar cargado</ThemedText>
                        </View>
                        <ThemedText style={styles.duplicateHelp}>Elegí el valor final de cada fila. La opción coloreada es la que se guardará; los valores nuevos también se pueden corregir.</ThemedText>
                        <View style={styles.duplicateCandidates}>
                          {item.draft.possibleDuplicates?.map(product => (
                            <TouchableOpacity
                              key={product._id}
                              onPress={() => selectDuplicate(item.id, product)}
                              style={[styles.duplicateCandidate, item.selectedDuplicateId === product._id && styles.duplicateCandidateSelected]}
                            >
                              <ThemedText style={styles.duplicateProduct}>{product.marca} {product.modelo}</ThemedText>
                            </TouchableOpacity>
                          ))}
                        </View>
                        {(() => {
                          const original = item.draft?.possibleDuplicates?.find(product => product._id === item.selectedDuplicateId);
                          if (!original) return null;
                          const originalValues = getDuplicateOriginalValues(original);
                          return (
                            <View style={styles.comparison}>
                              <View style={styles.comparisonHeader}>
                                <View style={styles.comparisonImageBox}>{original.imagen ? <Image source={{ uri: original.imagen }} style={styles.comparisonImage} resizeMode="contain" /> : <MaterialIcons name="image-not-supported" size={24} color={COLORS.textSecondary} />}</View>
                                <ThemedText style={styles.comparisonColumnTitle}>Producto existente</ThemedText>
                                <View style={styles.comparisonImageBox}><Image source={{ uri: item.uri }} style={styles.comparisonImage} resizeMode="contain" /></View>
                                <ThemedText style={styles.comparisonColumnTitle}>Imagen nueva</ThemedText>
                              </View>
                              {comparisonFields.map(field => {
                                const newValue = item.detectedDraft?.[field.key];
                                const numericField = field.key === 'precioBase' || field.key === 'porcentajeGanancia' || field.key === 'stockCantidad';
                                return (
                                  <View key={field.key} style={styles.comparisonRow}>
                                    <ThemedText style={styles.comparisonLabel}>{field.label}</ThemedText>
                                    <TouchableOpacity
                                      style={[styles.valueChoice, item.fieldSelections?.[field.key] === 'original' && styles.valueChoiceSelected]}
                                      onPress={() => chooseDuplicateField(item, field.key, 'original')}
                                    >
                                      <ThemedText numberOfLines={3} style={styles.valueChoiceText}>{displayComparisonValue(originalValues[field.key])}</ThemedText>
                                      <View style={styles.choiceFooter}>{item.fieldSelections?.[field.key] === 'original' ? <MaterialIcons name="check-circle" size={15} color={COLORS.primaryDark} /> : null}<ThemedText style={styles.useValue}>Usar actual</ThemedText></View>
                                    </TouchableOpacity>
                                    <View style={[styles.valueChoice, item.fieldSelections?.[field.key] === 'new' && styles.valueChoiceSelected]}>
                                      {field.key === 'stockDisponible' ? (
                                        <TouchableOpacity style={styles.inlineToggle} onPress={() => updateDetectedField(item, field.key, !newValue)}>
                                          <ThemedText style={styles.valueChoiceText}>{displayComparisonValue(newValue)}</ThemedText>
                                          <MaterialIcons name={newValue ? 'toggle-on' : 'toggle-off'} size={26} color={newValue ? '#21734b' : COLORS.textSecondary} />
                                        </TouchableOpacity>
                                      ) : (
                                        <TextInput
                                          multiline={field.key === 'descripcion'}
                                          keyboardType={numericField ? 'decimal-pad' : 'default'}
                                          onChangeText={value => updateDetectedField(
                                            item,
                                            field.key,
                                            numericField
                                              ? field.key === 'porcentajeGanancia'
                                                ? Number(value.replace(',', '.').replace(/[^0-9.]/g, '')) || 0
                                                : Number(value.replace(/\D/g, '')) || 0
                                              : value,
                                          )}
                                          placeholder="Sin dato"
                                          placeholderTextColor={COLORS.textLight}
                                          style={[styles.comparisonInput, field.key === 'descripcion' && styles.comparisonInputMultiline]}
                                          value={newValue === null || newValue === undefined ? '' : String(newValue)}
                                        />
                                      )}
                                      <TouchableOpacity style={styles.choiceFooter} onPress={() => chooseDuplicateField(item, field.key, 'new')}>
                                        {item.fieldSelections?.[field.key] === 'new' ? <MaterialIcons name="check-circle" size={15} color={COLORS.primaryDark} /> : null}
                                        <ThemedText style={styles.useValue}>Usar nuevo</ThemedText>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                );
                              })}
                              <View style={styles.imageChoiceRow}>
                                <ThemedText style={styles.comparisonLabel}>Imagen final</ThemedText>
                                <TouchableOpacity onPress={() => setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, duplicateImageSource: 'original' } : candidate))} style={[styles.imageChoice, item.duplicateImageSource === 'original' && styles.imageChoiceSelected]}><ThemedText style={styles.useValue}>Conservar actual</ThemedText></TouchableOpacity>
                                <TouchableOpacity onPress={() => setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, duplicateImageSource: 'new' } : candidate))} style={[styles.imageChoice, item.duplicateImageSource !== 'original' && styles.imageChoiceSelected]}><ThemedText style={styles.useValue}>Agregar nueva</ThemedText></TouchableOpacity>
                              </View>
                            </View>
                          );
                        })()}
                        <View style={styles.bulkChoices}>
                          <TouchableOpacity style={styles.bulkChoice} onPress={() => chooseAllDuplicateFields(item, 'original')}><ThemedText style={styles.bulkChoiceText}>Elegir todo actual</ThemedText></TouchableOpacity>
                          <TouchableOpacity style={styles.bulkChoice} onPress={() => chooseAllDuplicateFields(item, 'new')}><ThemedText style={styles.bulkChoiceText}>Elegir todo nuevo</ThemedText></TouchableOpacity>
                        </View>
                        <View style={styles.duplicateActions}>
                          <TouchableOpacity style={styles.duplicateUpdate} onPress={() => updateExisting(item)}>
                            <ThemedText style={styles.duplicateConfirmText}>Guardar selección</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.duplicateConfirm} onPress={() => createProduct(item, true)}>
                            <ThemedText style={styles.duplicateConfirmText}>Crear como producto nuevo</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}
                    {item.error ? <ThemedText style={styles.errorText}>{item.error}</ThemedText> : null}
                    {(item.draft.possibleDuplicates?.length || 0) === 0 ? <TouchableOpacity disabled={item.status !== 'ready'} style={[styles.reviewButton, item.status !== 'ready' && styles.reviewButtonDisabled]} onPress={() => createProduct(item)}>
                      {item.status === 'saving' ? <ActivityIndicator color={COLORS.ink} /> : <MaterialIcons name={item.status === 'created' ? 'check-circle' : 'add-circle'} size={18} color={COLORS.ink} />}
                      <ThemedText style={styles.reviewButtonText}>{item.status === 'saving' ? 'Creando producto…' : item.status === 'created' ? 'Producto creado' : 'Crear producto'}</ThemedText>
                    </TouchableOpacity> : null}
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
  duplicateWarning: { gap: SPACING.sm, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.error, borderRadius: RADIUS.md, backgroundColor: '#fff7f7' },
  duplicateHeading: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  duplicateTitle: { flex: 1, color: COLORS.errorStrong, fontSize: 14, fontWeight: '800' },
  duplicateProduct: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  duplicateHelp: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  duplicateCandidates: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  duplicateCandidate: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  duplicateCandidateSelected: { borderColor: COLORS.primaryDark, backgroundColor: '#eef0ff' },
  comparison: { gap: SPACING.sm, marginTop: SPACING.xs },
  comparisonHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  comparisonImageBox: { width: 48, height: 48, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  comparisonImage: { width: '100%', height: '100%' },
  comparisonColumnTitle: { flex: 1, color: COLORS.text, fontSize: 11, lineHeight: 14, fontWeight: '700' },
  comparisonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  comparisonLabel: { width: '100%', color: COLORS.textSecondary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  valueChoice: { flex: 1, minWidth: 110, minHeight: 58, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, padding: SPACING.sm, justifyContent: 'space-between' },
  valueChoiceSelected: { borderColor: COLORS.primaryDark, borderWidth: 2, backgroundColor: '#eef0ff' },
  valueChoiceText: { color: COLORS.text, fontSize: 12, lineHeight: 16 },
  comparisonInput: { minHeight: 28, color: COLORS.text, fontSize: 12, lineHeight: 16, padding: 0, borderBottomWidth: 1, borderBottomColor: COLORS.borderFocus },
  comparisonInputMultiline: { minHeight: 54, textAlignVertical: 'top' },
  inlineToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choiceFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  useValue: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '800', marginTop: 3 },
  imageChoiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  imageChoice: { flex: 1, minWidth: 110, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, padding: SPACING.sm, alignItems: 'center' },
  imageChoiceSelected: { borderColor: COLORS.primaryDark, backgroundColor: '#eef0ff' },
  bulkChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  bulkChoice: { flex: 1, minWidth: 130, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.sm },
  bulkChoiceText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '800' },
  duplicateActions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  duplicateCancel: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  duplicateCancelText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  duplicateUpdate: { flex: 1, minWidth: 145, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.secondary },
  duplicateConfirm: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.warning },
  duplicateConfirmText: { color: COLORS.ink, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  reviewButton: { minHeight: 46, backgroundColor: COLORS.secondary, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }, reviewButtonDisabled: { opacity: 0.7 }, reviewButtonText: { color: COLORS.ink, fontWeight: '800' },
});
