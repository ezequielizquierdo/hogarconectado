import { useState, useEffect, useRef } from 'react';
import { productosService, handleApiError } from '../services';
import type { Producto, ProductoFiltros } from '../services';

// Rate limiting para evitar múltiples requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useProductos = (filtrosIniciales: ProductoFiltros = {}) => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<any>(null);
    const [filtros, setFiltros] = useState<ProductoFiltros>(filtrosIniciales);

    // Control de rate limiting
    const lastRequestTime = useRef<number>(0);
    const isRequestInProgress = useRef<boolean>(false);

    const cargarProductos = async (nuevosFiltros?: ProductoFiltros) => {
        // Evitar requests simultáneos
        if (isRequestInProgress.current) {
            console.log('Request en progreso, omitiendo...');
            return;
        }

        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime.current;
        if (timeSinceLastRequest < 500) { // 500ms entre requests
            await delay(500 - timeSinceLastRequest);
        }

        try {
            isRequestInProgress.current = true;
            lastRequestTime.current = Date.now();
            setLoading(true);
            setError(null);

            const filtrosFinales = nuevosFiltros || filtros;
            console.log('🔍 useProductos - Filtros enviados:', filtrosFinales);

            const { productos: data, pagination: paginationData } =
                await productosService.obtenerProductos(filtrosFinales);

            console.log('📊 useProductos - Productos recibidos:', data.length);
            console.log('📄 useProductos - Paginación:', paginationData);

            setProductos(data);
            setPagination(paginationData);

            if (nuevosFiltros) {
                setFiltros(filtrosFinales);
            }
        } catch (err) {
            const errorMessage = handleApiError(err);

            // Mensaje más descriptivo para errores de red
            let friendlyMessage = errorMessage;
            if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
                friendlyMessage = 'El servidor está despertando, esto puede tomar unos segundos. Reintentando automáticamente...';
            }

            setError(friendlyMessage);
            console.error('Error cargando productos:', err);
        } finally {
            setLoading(false);
            isRequestInProgress.current = false;
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const buscar = (texto: string) => {
        cargarProductos({ ...filtros, buscar: texto, pagina: 1 });
    };

    const filtrarPorCategoria = (categoriaId: string) => {
        cargarProductos({ ...filtros, categoria: categoriaId, pagina: 1 });
    };

    const cambiarPagina = (nuevaPagina: number) => {
        cargarProductos({ ...filtros, pagina: nuevaPagina });
    };

    const recargar = () => {
        cargarProductos(filtros);
    };

    const limpiarFiltros = () => {
        const filtrosLimpios = { limite: filtros.limite };
        cargarProductos(filtrosLimpios);
    };

    return {
        productos,
        loading,
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
