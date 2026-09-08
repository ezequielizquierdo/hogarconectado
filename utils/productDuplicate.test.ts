import { describe, expect, it } from 'vitest';
import { getDuplicateChoiceValue, getDuplicateOriginalValues } from './productDuplicate';

const existing = {
  _id: 'producto-1', marca: 'Briket', modelo: 'HE150W', categoria: { _id: 'cat-1', nombre: 'Freezers' },
  descripcion: 'Actual', precioBase: 100000, stock: { cantidad: 2, disponible: true }, imagenes: [], imagenPublicIds: [],
};
const detected = {
  marca: 'BRIKET', modelo: 'HE150W', categoriaSugerida: 'Freezers', descripcion: 'Nueva', precioBase: 120000,
  porcentajeGanancia: 10, stockCantidad: 4, stockDisponible: false, confianza: 0.95, advertencias: [],
};

describe('selección de datos duplicados', () => {
  it('conserva los datos actuales y aplica 10% cuando el registro no tiene porcentaje propio', () => {
    expect(getDuplicateOriginalValues(existing)).toMatchObject({ precioBase: 100000, stockCantidad: 2, porcentajeGanancia: 10 });
  });

  it('permite elegir independientemente el valor nuevo editado', () => {
    expect(getDuplicateChoiceValue(existing, detected, 'precioBase', 'new')).toBe(120000);
    expect(getDuplicateChoiceValue(existing, detected, 'stockCantidad', 'original')).toBe(2);
  });
});
