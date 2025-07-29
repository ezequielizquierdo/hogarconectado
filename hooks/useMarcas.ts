import { useState, useEffect, useRef } from 'react';
import { productosService, handleApiError } from '../services';

// Rate limiting para evitar múltiples requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useMarcas = () => {
    const [marcas, setMarcas] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Control de rate limiting
    const lastRequestTime = useRef<number>(0);
    const isRequestInProgress = useRef<boolean>(false);

    const cargarMarcas = async () => {
        // Evitar requests simultáneos
        if (isRequestInProgress.current) {
            console.log('Request de marcas en progreso, omitiendo...');
            return;
        }

        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime.current;
        if (timeSinceLastRequest < 300) { // 300ms entre requests
            await delay(300 - timeSinceLastRequest);
        }

        try {
            isRequestInProgress.current = true;
            lastRequestTime.current = Date.now();
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
        cargarMarcas();
    };

    return {
        marcas,
        loading,
        error,
        recargar,
    };
};
