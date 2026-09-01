import { useState, useEffect, useRef } from 'react';
import { categoriasService, handleApiError } from '../services';
import type { Categoria } from '../services';

export const useCategorias = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Evita duplicar la misma carga sin serializar recursos independientes.
    const isRequestInProgress = useRef<boolean>(false);

    const cargarCategorias = async () => {
        // Evitar requests simultáneos
        if (isRequestInProgress.current) {
            console.log('Request de categorías en progreso, omitiendo...');
            return;
        }

        try {
            isRequestInProgress.current = true;
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
            isRequestInProgress.current = false;
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    const recargar = () => {
        return cargarCategorias();
    };

    return {
        categorias,
        loading,
        error,
        recargar,
    };
};
