import { useState, useEffect } from 'react';
import { productosService, handleApiError } from '../services';

export const useMarcasPorCategoria = (categoriaId: string) => {
    const [marcas, setMarcas] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargarMarcas = async (catId: string) => {
        if (!catId) {
            setMarcas([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await productosService.obtenerMarcasPorCategoria(catId);
            setMarcas(data);
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error('Error cargando marcas por categoría:', errorMessage);
            setMarcas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarMarcas(categoriaId);
    }, [categoriaId]);

    const recargar = () => {
        if (categoriaId) {
            cargarMarcas(categoriaId);
        }
    };

    return {
        marcas,
        loading,
        error,
        recargar,
    };
};
