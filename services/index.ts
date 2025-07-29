// Exportar servicios
export { default as categoriasService } from './categoriasService';
export { default as productosService } from './productosService';
export { default as cotizacionesService } from './cotizacionesService';
export { default as apiClient } from './apiClient';

// Exportar tipos
export * from './types';

// Configuración de la API
export const API_CONFIG = {
    BASE_URL: __DEV__
        ? 'http://localhost:3000/api'
        : 'https://tu-backend-produccion.com/api',
    TIMEOUT: 10000,
};

// Utilidades para manejo de errores
export const handleApiError = (error: any) => {
    if (error.response) {
        // El servidor respondió con un código de error
        const { status, data } = error.response;
        switch (status) {
            case 400:
                return 'Datos inválidos. Por favor, verifica la información.';
            case 401:
                return 'No tienes autorización para realizar esta acción.';
            case 403:
                return 'Acceso denegado.';
            case 404:
                return 'El recurso solicitado no fue encontrado.';
            case 500:
                return 'Error interno del servidor. Intenta de nuevo más tarde.';
            default:
                return data?.message || 'Error desconocido del servidor.';
        }
    } else if (error.request) {
        // La petición se hizo pero no se recibió respuesta
        return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    } else {
        // Algo pasó al configurar la petición
        return 'Error al procesar la solicitud.';
    }
};

// Utilidades para formateo de datos
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

// Utilidades para validación
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
