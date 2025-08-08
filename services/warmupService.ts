import apiClient from './apiClient';

class WarmupService {
    private static instance: WarmupService;
    private isWarmedUp: boolean = false;
    private warmupPromise: Promise<void> | null = null;

    // URLs de respaldo para intentar conectar
    private fallbackUrls: string[] = [
        'http://192.168.1.13:3000/api',    // IP correcta actual
        'http://localhost:3000/api',
        'http://127.0.0.1:3000/api',
        'http://192.168.1.68:3000/api',    // IP anterior configurada
        'http://192.168.1.100:3000/api',   // Rangos comunes
        'http://192.168.1.101:3000/api',
        'http://192.168.1.102:3000/api',
        'http://192.168.0.100:3000/api',   // Otro rango común
        'http://192.168.0.101:3000/api',
        'http://10.0.2.2:3000/api',        // Android emulator
        'http://10.0.0.1:3000/api',        // Algunos routers
        'https://hogarconectado-backend.onrender.com/api', // Producción como último recurso
    ];

    private constructor() { }

    static getInstance(): WarmupService {
        if (!WarmupService.instance) {
            WarmupService.instance = new WarmupService();
        }
        return WarmupService.instance;
    }

    // Despertar el backend con un endpoint simple
    async warmupBackend(): Promise<void> {
        if (this.isWarmedUp || this.warmupPromise) {
            return this.warmupPromise || Promise.resolve();
        }

        console.log('🔥 Iniciando warm-up del backend...');

        this.warmupPromise = this.performWarmup();

        try {
            await this.warmupPromise;
            this.isWarmedUp = true;
            console.log('✅ Backend warm-up completado');
        } catch (error) {
            console.log('⚠️ Warm-up falló, pero continuando:', error);
            // No lanzar error para no bloquear la app
        } finally {
            this.warmupPromise = null;
        }
    }

    private async performWarmup(): Promise<void> {
        console.log('🔍 Detectando servidor backend disponible...');

        // Intentar múltiples URLs hasta encontrar una que funcione
        for (const url of this.fallbackUrls) {
            try {
                console.log(`🔍 Probando conexión con: ${url}`);

                // Usar Promise.race para implementar timeout compatible
                const timeoutPromise = new Promise<Response>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout después de 8 segundos')), 8000)
                );

                const fetchPromise = fetch(`${url}/categorias`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const response = await Promise.race([fetchPromise, timeoutPromise]);

                if (response.ok) {
                    console.log(`✅ ¡Conexión exitosa con: ${url}!`);
                    console.log(`📡 Backend encontrado en: ${url}`);

                    // Guardar la URL que funciona para futuras referencias
                    this.workingUrl = url;
                    return;
                }
            } catch (error: any) {
                if (error.message.includes('Timeout')) {
                    console.log(`⏰ Timeout con ${url}`);
                } else {
                    console.log(`❌ Error con ${url}:`, error.message);
                }
                continue; // Intentar con la siguiente URL
            }
        }

        // Si ninguna URL funciona, intentar con apiClient normal como último recurso
        try {
            console.log('🔄 Intentando con configuración actual de apiClient...');
            await apiClient.get('/categorias', {
                timeout: 8000,
            });
            console.log('✅ ApiClient funcionó con configuración por defecto');
        } catch (error: any) {
            console.log('⚠️ Todas las conexiones fallaron');
            console.log('💡 Asegúrate de que:');
            console.log('   1. El backend esté corriendo en puerto 3000');
            console.log('   2. Tu IP sea accesible desde el simulador');
            throw error;
        }
    }

    private workingUrl: string | null = null;

    // Método para obtener la URL que está funcionando
    getWorkingUrl(): string | null {
        return this.workingUrl;
    }

    // Verificar si ya está caliente
    isBackendWarmedUp(): boolean {
        return this.isWarmedUp;
    }

    // Resetear estado (útil para desarrollo)
    reset(): void {
        this.isWarmedUp = false;
        this.warmupPromise = null;
    }
}

export default WarmupService.getInstance();
