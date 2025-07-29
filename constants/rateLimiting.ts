// Configuración centralizada para rate limiting
export const RATE_LIMITING_CONFIG = {
    // Delays mínimos entre requests (en milisegundos)
    API_REQUEST_INTERVAL: 200,        // Delay entre requests de API
    PRODUCTOS_REQUEST_INTERVAL: 500,  // Delay específico para productos
    CATEGORIAS_REQUEST_INTERVAL: 300, // Delay específico para categorías
    MARCAS_REQUEST_INTERVAL: 300,     // Delay específico para marcas

    // Timeouts para retry en caso de 429
    RETRY_DELAY_429: 2000,           // Delay base para retry en 429
    MAX_RETRIES: 3,                  // Máximo número de reintentos

    // Debounce times
    SEARCH_DEBOUNCE_TIME: 300,       // Debounce para búsquedas
    FILTER_DEBOUNCE_TIME: 200,       // Debounce para filtros

    // Cache settings
    IMAGE_CACHE_TIMEOUT: 5000,       // Timeout para imágenes
    IMAGE_REQUEST_DELAY: 100,        // Delay entre requests de imágenes
};

// Función de delay centralizada
export const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

// Función para calcular delay dinámico basado en el tipo de request
export const getDelayForRequestType = (type: 'productos' | 'categorias' | 'marcas' | 'api' | 'image'): number => {
    switch (type) {
        case 'productos':
            return RATE_LIMITING_CONFIG.PRODUCTOS_REQUEST_INTERVAL;
        case 'categorias':
            return RATE_LIMITING_CONFIG.CATEGORIAS_REQUEST_INTERVAL;
        case 'marcas':
            return RATE_LIMITING_CONFIG.MARCAS_REQUEST_INTERVAL;
        case 'image':
            return RATE_LIMITING_CONFIG.IMAGE_REQUEST_DELAY;
        case 'api':
        default:
            return RATE_LIMITING_CONFIG.API_REQUEST_INTERVAL;
    }
};

// Logger para debugging de rate limiting
export const logRateLimit = (type: string, action: string, delay?: number) => {
    if (__DEV__) {
        console.log(`[RateLimit] ${type}: ${action}${delay ? ` (delay: ${delay}ms)` : ''}`);
    }
};

export default RATE_LIMITING_CONFIG;
