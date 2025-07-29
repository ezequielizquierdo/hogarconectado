import { useState, useEffect } from 'react';
import { categoriasService, handleApiError } from '../services';
import type { Categoria } from '../services';

export const useCategorias = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargarCategorias = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await categoriasService.obtenerCategorias();
            setCategorias(data);
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error('Error cargando categorías:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    const recargar = () => {
        cargarCategorias();
    };

    return {
        categorias,
        loading,
        error,
        recargar,
    };
};
