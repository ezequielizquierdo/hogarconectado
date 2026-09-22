import { describe, expect, it } from 'vitest';

import { buildProductQueryParams } from './productQueryParams';

describe('parámetros del catálogo', () => {
  it('envía el período y el orden junto a los demás filtros', () => {
    const params = buildProductQueryParams({
      categoria: 'categoria-1', actualizados: 'semana', ordenar: 'precio-desc', pagina: 1,
    });
    expect(params.get('categoria')).toBe('categoria-1');
    expect(params.get('actualizados')).toBe('semana');
    expect(params.get('ordenar')).toBe('precio-desc');
    expect(params.get('pagina')).toBe('1');
  });

  it('mantiene el catálogo completo y reciente por defecto', () => {
    const params = buildProductQueryParams({ actualizados: 'todos', ordenar: 'recientes' });
    expect(params.has('actualizados')).toBe(false);
    expect(params.has('ordenar')).toBe(false);
  });
});
