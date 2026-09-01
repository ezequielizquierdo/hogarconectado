import { useState, useEffect, useRef } from 'react';
import { productosService, handleApiError } from '../services';

export const useMarcas = () => {
    const [marcas, setMarcas] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Evita duplicar la misma carga sin serializar recursos independientes.
    const isRequestInProgress = useRef<boolean>(false);

    const cargarMarcas = async () => {
        // Evitar requests simultáneos
        if (isRequestInProgress.current) {
            console.log('Request de marcas en progreso, omitiendo...');
            return;
        }

        try {
            isRequestInProgress.current = true;
            setLoading(true);
            setError(null);

            const data = await productosService.obtenerMarcas();
            setMarcas(data);
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error('Error cargando marcas:', errorMessage);
        } finally {
            setLoading(false);
            isRequestInProgress.current = false;
        }
    };

    useEffect(() => {
        cargarMarcas();
    }, []);

    const recargar = () => {
        return cargarMarcas();
    };

    return {
        marcas,
        loading,
        error,
        recargar,
    };
};
