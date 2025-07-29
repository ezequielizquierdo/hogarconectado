import { useState, useEffect } from 'react';
import { productosService, handleApiError } from '../services';
import { Producto } from '../services/types';

export const useProductosPorCategoriaYMarca = (categoriaId: string, marca: string) => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargarProductos = async (catId: string, marcaSeleccionada: string) => {
        if (!catId || !marcaSeleccionada) {
            setProductos([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await productosService.obtenerProductosPorCategoriaYMarca(catId, marcaSeleccionada);
            setProductos(data);
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error('Error cargando productos por categoría y marca:', errorMessage);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProductos(categoriaId, marca);
    }, [categoriaId, marca]);

    const recargar = () => {
        if (categoriaId && marca) {
            cargarProductos(categoriaId, marca);
        }
    };

    return {
        productos,
        loading,
        error,
        recargar,
    };
};
