import { useEffect } from 'react';

export default function WebAppSetup() {
  useEffect(() => {
    if (!__DEV__) {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://hogarconectado-backend.onrender.com/api';
      const backendUrl = apiUrl.replace(/\/api\/?$/, '');
      void fetch(`${backendUrl}/health`, {
        cache: 'no-store',
        credentials: 'omit',
      }).catch(() => undefined);
    }

    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        if (__DEV__) console.warn('No se pudo registrar el service worker', error);
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
