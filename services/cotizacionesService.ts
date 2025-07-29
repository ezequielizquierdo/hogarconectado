import apiClient from './apiClient';
import {
    Cotizacion,
    CrearCotizacionData,
    CotizacionFiltros,
    CotizacionConMensaje,
    ApiResponse,
    ApiListResponse,
} from './types';

class CotizacionesService {
    // Crear nueva cotización
    async crearCotizacion(datos: CrearCotizacionData): Promise<Cotizacion> {
        try {
            const response = await apiClient.post<ApiResponse<Cotizacion>>('/cotizaciones', datos);
            return response.data.data;
        } catch (error) {
            console.error('Error creando cotización:', error);
            throw error;
        }
    }

    // Obtener cotizaciones con filtros
    async obtenerCotizaciones(filtros: CotizacionFiltros = {}): Promise<{
        cotizaciones: Cotizacion[];
        pagination?: any;
    }> {
        try {
            const params = new URLSearchParams();

            if (filtros.estado) params.append('estado', filtros.estado);
            if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
            if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
            if (filtros.limite) params.append('limite', filtros.limite.toString());
            if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
            if (filtros.buscar) params.append('buscar', filtros.buscar);

            const response = await apiClient.get<ApiListResponse<Cotizacion>>(`/cotizaciones?${params.toString()}`);

            return {
                cotizaciones: response.data.data,
                pagination: response.data.pagination,
            };
        } catch (error) {
            console.error('Error obteniendo cotizaciones:', error);
            throw error;
        }
    }

    // Obtener cotización por ID
    async obtenerCotizacionPorId(id: string): Promise<Cotizacion> {
        try {
            const response = await apiClient.get<ApiResponse<Cotizacion>>(`/cotizaciones/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo cotización por ID:', error);
            throw error;
        }
    }

    // Actualizar estado de cotización
    async actualizarEstadoCotizacion(id: string, estado: string): Promise<Cotizacion> {
        try {
            const response = await apiClient.put<ApiResponse<Cotizacion>>(`/cotizaciones/${id}/estado`, { estado });
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando estado de cotización:', error);
            throw error;
        }
    }

    // Eliminar cotización
    async eliminarCotizacion(id: string): Promise<void> {
        try {
            await apiClient.delete(`/cotizaciones/${id}`);
        } catch (error) {
            console.error('Error eliminando cotización:', error);
            throw error;
        }
    }

    // Generar mensaje de WhatsApp para cotización
    async generarMensajeWhatsApp(id: string): Promise<CotizacionConMensaje> {
        try {
            const response = await apiClient.get<ApiResponse<CotizacionConMensaje>>(`/cotizaciones/${id}/mensaje`);
            return response.data.data;
        } catch (error) {
            console.error('Error generando mensaje de WhatsApp:', error);
            throw error;
        }
    }

    // Obtener estadísticas de cotizaciones
    async obtenerEstadisticas(): Promise<any> {
        try {
            const response = await apiClient.get<ApiResponse<any>>('/cotizaciones/estadisticas/resumen');
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    // Obtener cotizaciones recientes
    async obtenerCotizacionesRecientes(limite: number = 5): Promise<Cotizacion[]> {
        try {
            const { cotizaciones } = await this.obtenerCotizaciones({
                limite,
                estado: 'todas',
            });
            return cotizaciones;
        } catch (error) {
            console.error('Error obteniendo cotizaciones recientes:', error);
            throw error;
        }
    }
}

export default new CotizacionesService();
