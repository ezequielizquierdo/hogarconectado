import { useEffect, useRef, useState } from 'react';
import preciosService from '@/services/preciosService';
import type { CalculoPrecios } from '@/services/types';

export function useCalculoPrecios(
    precioBase: number | null,
    porcentaje: number | null,
    delayMs = 300
) {
    const [data, setData] = useState<CalculoPrecios | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [settledKey, setSettledKey] = useState<string | null>(null);
    const requestId = useRef(0);
    const validInput =
        precioBase !== null &&
        porcentaje !== null &&
        Number.isFinite(precioBase) &&
        Number.isFinite(porcentaje) &&
        precioBase >= 0 &&
        porcentaje >= 0 &&
        porcentaje <= 100;
    const requestKey = validInput ? `${precioBase}:${porcentaje}` : null;

    useEffect(() => {
        const currentRequest = ++requestId.current;

        if (!validInput || requestKey === null) {
            setData(null);
            setLoading(false);
            setError(null);
            setSettledKey(null);
            return;
        }

        setLoading(true);
        setError(null);

        const timeout = setTimeout(async () => {
            try {
                const result = await preciosService.calcular(precioBase, porcentaje);
                if (requestId.current === currentRequest) {
                    setData(result);
                    setSettledKey(requestKey);
                }
            } catch (requestError) {
                console.error('Error calculando precios:', requestError);
                if (requestId.current === currentRequest) {
                    setData(null);
                    setError('No se pudieron calcular los precios. Intentá nuevamente.');
                    setSettledKey(requestKey);
                }
            } finally {
                if (requestId.current === currentRequest) setLoading(false);
            }
        }, delayMs);

        return () => clearTimeout(timeout);
    }, [delayMs, porcentaje, precioBase, requestKey, validInput]);

    const isCurrent = requestKey !== null && settledKey === requestKey;
    return {
        data: isCurrent ? data : null,
        loading: requestKey !== null && (loading || !isCurrent),
        error: isCurrent ? error : null,
    };
}
