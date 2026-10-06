import { useCallback, useState, useEffect, useRef } from 'react';
import { productosService, handleApiError } from '../services';
import type { Producto, ProductoFiltros } from '../services';
import { readProductCatalogCache, writeProductCatalogCache } from '../services/productCatalogCache';

interface UseProductosOptions {
    enabled?: boolean;
    cachePublicCatalog?: boolean;
}

export const useProductos = (
    filtrosIniciales: ProductoFiltros = {},
    { enabled = true, cachePublicCatalog = false }: UseProductosOptions = {}
) => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<any>(null);
    const [filtros, setFiltros] = useState<ProductoFiltros>(filtrosIniciales);
    const filtrosRef = useRef<ProductoFiltros>(filtrosIniciales);
    const enabledRef = useRef(enabled);
    const cachePublicCatalogRef = useRef(cachePublicCatalog);
    const [refreshingInBackground, setRefreshingInBackground] = useState(false);

    enabledRef.current = enabled;
    cachePublicCatalogRef.current = cachePublicCatalog;

    const latestRequestId = useRef<number>(0);

    const cargarProductos = useCallback(async (
        nuevosFiltros?: ProductoFiltros,
        options: { silent?: boolean } = {}
    ) => {
        if (!enabledRef.current) return;
        const requestId = ++latestRequestId.current;
        const filtrosFinales = nuevosFiltros || filtrosRef.current;

        // Guardar los filtros de inmediato permite encadenar cambios rápidos sin
        // perder el anterior mientras la consulta todavía está en curso.
        if (nuevosFiltros) {
            filtrosRef.current = filtrosFinales;
            setFiltros(filtrosFinales);
        }

        try {
            if (options.silent) {
                setRefreshingInBackground(true);
            } else {
                setLoading(true);
            }
            setError(null);

            console.log('🔍 useProductos - Filtros enviados:', filtrosFinales);

            const { productos: data, pagination: paginationData } =
                await productosService.obtenerProductos(filtrosFinales);

            console.log('📊 useProductos - Productos recibidos:', data.length);
            console.log('📄 useProductos - Paginación:', paginationData);

            // Una respuesta anterior no debe reemplazar los resultados de la
            // búsqueda o filtro más reciente.
            if (requestId === latestRequestId.current) {
                setProductos(data);
                setPagination(paginationData);
                if (cachePublicCatalogRef.current) {
                    void writeProductCatalogCache(filtrosFinales, data, paginationData);
                }
            }
        } catch (err) {
            const errorMessage = handleApiError(err);

            // Mensaje más descriptivo para errores de red
            let friendlyMessage = errorMessage;
            if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
                friendlyMessage = 'El servidor está despertando, esto puede tomar unos segundos. Reintentando automáticamente...';
            }

            if (requestId === latestRequestId.current) {
                setError(friendlyMessage);
            }
            console.error('Error cargando productos:', err);
        } finally {
            if (requestId === latestRequestId.current) {
                setLoading(false);
                setRefreshingInBackground(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        let active = true;

        const initialize = async () => {
            const cached = cachePublicCatalog
                ? await readProductCatalogCache(filtrosRef.current)
                : null;

            if (!active) return;
            if (cached) {
                setProductos(cached.productos);
                setPagination(cached.pagination);
                setLoading(false);
            }

            await cargarProductos(undefined, { silent: Boolean(cached) });
        };

        void initialize();
        return () => {
            active = false;
        };
    }, [cachePublicCatalog, cargarProductos, enabled]);

    const buscar = useCallback((texto: string) => {
        cargarProductos({ ...filtrosRef.current, buscar: texto, pagina: 1 });
    }, [cargarProductos]);

    const filtrarPorCategoria = useCallback((categoriaId: string) => {
        cargarProductos({ ...filtrosRef.current, categoria: categoriaId, pagina: 1 });
    }, [cargarProductos]);

    const cambiarPagina = useCallback((nuevaPagina: number) => {
        cargarProductos({ ...filtrosRef.current, pagina: nuevaPagina });
    }, [cargarProductos]);

    const recargar = useCallback(() => {
        return cargarProductos(filtrosRef.current);
    }, [cargarProductos]);

    const limpiarFiltros = useCallback(() => {
        const filtrosLimpios = { limite: filtrosRef.current.limite };
        cargarProductos(filtrosLimpios);
    }, [cargarProductos]);

    return {
        productos,
        loading,
        refreshingInBackground,
        error,
        pagination,
        filtros,
        buscar,
        filtrarPorCategoria,
        cambiarPagina,
        recargar,
        limpiarFiltros,
        setFiltros: cargarProductos,
    };
};
