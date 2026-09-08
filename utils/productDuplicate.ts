import type { ProductImageDraft } from '@/services/types';

export type DuplicateFieldKey = 'marca' | 'modelo' | 'categoriaSugerida' | 'descripcion' | 'precioBase' | 'porcentajeGanancia' | 'stockCantidad' | 'stockDisponible';
export type DuplicateSource = 'original' | 'new';
export type PossibleDuplicate = NonNullable<ProductImageDraft['possibleDuplicates']>[number];

export const getDuplicateOriginalValues = (duplicate: PossibleDuplicate) => ({
  marca: duplicate.marca,
  modelo: duplicate.modelo,
  categoriaSugerida: typeof duplicate.categoria === 'string' ? '' : duplicate.categoria?.nombre || '',
  descripcion: duplicate.descripcion || '',
  precioBase: duplicate.precioBase ?? 0,
  porcentajeGanancia: duplicate.porcentajeGanancia ?? 10,
  stockCantidad: duplicate.stock?.cantidad ?? 0,
  stockDisponible: duplicate.stock?.disponible ?? false,
});

export const getDuplicateChoiceValue = (
  duplicate: PossibleDuplicate,
  detected: ProductImageDraft,
  field: DuplicateFieldKey,
  source: DuplicateSource,
) => {
  const original = getDuplicateOriginalValues(duplicate);
  return source === 'original' ? original[field] : detected[field] ?? original[field];
};
