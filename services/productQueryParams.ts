import type { ProductoFiltros } from './types';

export function buildProductQueryParams(filtros: ProductoFiltros): URLSearchParams {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.marca) params.append('marca', filtros.marca);
    if (filtros.tipoComercializacion) params.append('tipoComercializacion', filtros.tipoComercializacion);
    if (filtros.disponible !== undefined) params.append('disponible', filtros.disponible.toString());
    if (filtros.limite) params.append('limite', filtros.limite.toString());
    if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
    if (filtros.buscar) params.append('buscar', filtros.buscar);
    if (filtros.actualizados && filtros.actualizados !== 'todos') params.append('actualizados', filtros.actualizados);
    if (filtros.ordenar && filtros.ordenar !== 'recientes') params.append('ordenar', filtros.ordenar);
    return params;
}
