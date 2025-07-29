import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Función de delay para rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 200ms entre requests

// Configuración base de la API
const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'web') {
            // En web, intentar usar la misma origin que la aplicación web para evitar CORS
            if (typeof window !== 'undefined') {
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                // Si estamos en localhost, usar puerto 3000 para el backend
                if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    return `${protocol}//${hostname}:3000/api`;
                }
            }
            // Fallback para web
            return 'http://localhost:3000/api';
        } else {
            // Para móvil, usar la IP local
            return 'http://192.168.1.13:3000/api';
        }
    } else {
        return 'https://tu-backend-produccion.com/api';
    }
}; const API_BASE_URL = getBaseURL();

// Crear instancia de axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para requests (agregar token si existe y rate limiting)
apiClient.interceptors.request.use(
    async (config) => {
        // Rate limiting: asegurar intervalo mínimo entre requests
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;

        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            const delayTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            await delay(delayTime);
        }

        lastRequestTime = Date.now();

        try {
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.log('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para responses (manejo de errores y retry en 429)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Manejo de errores 429 (Too Many Requests)
        if (error.response?.status === 429 && !originalRequest._retry) {
            originalRequest._retry = true;
            const retryAfter = error.response.headers['retry-after'] || 2;
            const retryDelay = parseInt(retryAfter) * 1000; // Convertir a ms

            console.log(`Rate limited. Retrying after ${retryDelay}ms`);
            await delay(retryDelay);

            return apiClient(originalRequest);
        }

        if (error.response?.status === 401) {
            // Token expirado, limpiar storage
            await AsyncStorage.removeItem('auth_token');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
