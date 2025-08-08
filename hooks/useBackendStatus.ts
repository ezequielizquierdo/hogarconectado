import { useState, useEffect } from 'react';
import { warmupService } from '@/services';

export const useBackendStatus = () => {
    const [isWarmedUp, setIsWarmedUp] = useState(false);
    const [isWarming, setIsWarming] = useState(false);

    useEffect(() => {
        const checkStatus = () => {
            setIsWarmedUp(warmupService.isBackendWarmedUp());
        };

        // Verificar estado inicial
        checkStatus();

        // Verificar periódicamente durante los primeros minutos
        const interval = setInterval(checkStatus, 2000);

        // Limpiar después de 2 minutos
        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, 120000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    const forceWarmup = async () => {
        setIsWarming(true);
        try {
            await warmupService.warmupBackend();
            setIsWarmedUp(true);
        } catch (error) {
            console.error('Error durante warm-up manual:', error);
        } finally {
            setIsWarming(false);
        }
    };

    return {
        isWarmedUp,
        isWarming,
        forceWarmup,
    };
};
