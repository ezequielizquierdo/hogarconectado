import { useState, useEffect } from 'react';
import { productosService, handleApiError } from '../services';
import type { Producto, ProductoFiltros } from '../services';

export const useProductos = (filtrosIniciales: ProductoFiltros = {}) => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<any>(null);
    const [filtros, setFiltros] = useState<ProductoFiltros>(filtrosIniciales);

    const cargarProductos = async (nuevosFiltros?: ProductoFiltros) => {
        try {
            setLoading(true);
            setError(null);

            const filtrosFinales = nuevosFiltros || filtros;
            const { productos: data, pagination: paginationData } =
                await productosService.obtenerProductos(filtrosFinales);

            setProductos(data);
            setPagination(paginationData);

            if (nuevosFiltros) {
                setFiltros(filtrosFinales);
            }
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error('Error cargando productos:', err);
        } finally {
            setLoading(false);
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
