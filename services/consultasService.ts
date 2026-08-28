import apiClient from './apiClient';
import { ApiListResponse, ApiResponse, ConsultaComercial, ConsultaEstado, ConsultaResumen } from './types';

export interface NuevaConsultaPayload {
  productoId: string;
  nombre: string;
  telefono: string;
}

function createIdempotencyKey(productoId: string) {
  return `consulta-${productoId}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

class ConsultasService {
  async crear(payload: NuevaConsultaPayload, idempotencyKey?: string) {
    const key = idempotencyKey || createIdempotencyKey(payload.productoId);
    const response = await apiClient.post<ApiResponse<{ id?: string }>>(
      '/consultas',
      { ...payload, website: '' },
      { headers: { 'x-idempotency-key': key } }
    );
    return { ...response.data, idempotencyKey: key };
  }

  async listar(estado?: ConsultaEstado): Promise<ConsultaComercial[]> {
    const response = await apiClient.get<ApiListResponse<ConsultaComercial>>('/consultas', {
      params: { limite: 100, ...(estado ? { estado } : {}) },
    });
    return response.data.data;
  }

  async resumen(): Promise<ConsultaResumen> {
    const response = await apiClient.get<ApiResponse<ConsultaResumen>>('/consultas/resumen');
    return response.data.data;
  }

  async cambiarEstado(id: string, estado: ConsultaEstado): Promise<ConsultaComercial> {
    const response = await apiClient.patch<ApiResponse<ConsultaComercial>>(
      `/consultas/${id}/estado`,
      { estado },
    );
    return response.data.data;
  }
}

export default new ConsultasService();
