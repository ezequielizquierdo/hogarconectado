import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import consultasService from '@/services/consultasService';

interface ConsultasContextValue {
  nuevas: number;
  totalAbiertas: number;
  refresh: () => Promise<void>;
}

const ConsultasContext = createContext<ConsultasContextValue | null>(null);

export function ConsultasProvider({ children }: React.PropsWithChildren) {
  const { state, user } = useAuth();
  const [nuevas, setNuevas] = useState(0);
  const [totalAbiertas, setTotalAbiertas] = useState(0);

  const refresh = useCallback(async () => {
    if (state !== 'authenticated' || !['admin', 'vendedor'].includes(user?.rol || '')) {
      setNuevas(0);
      setTotalAbiertas(0);
      return;
    }
    try {
      const resumen = await consultasService.resumen();
      setNuevas(resumen.nuevas);
      setTotalAbiertas(resumen.totalAbiertas);
    } catch {
      // El contador no debe interrumpir la navegación si el backend está en reposo.
    }
  }, [state, user?.rol]);

  useEffect(() => {
    void refresh();
    if (state !== 'authenticated' || !['admin', 'vendedor'].includes(user?.rol || '')) return;
    const timer = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(timer);
  }, [refresh, state, user?.rol]);

  const value = useMemo(
    () => ({ nuevas, totalAbiertas, refresh }),
    [nuevas, totalAbiertas, refresh],
  );

  return <ConsultasContext.Provider value={value}>{children}</ConsultasContext.Provider>;
}

export function useConsultasResumen() {
  const context = useContext(ConsultasContext);
  if (!context) throw new Error('useConsultasResumen debe usarse dentro de ConsultasProvider');
  return context;
}
