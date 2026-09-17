import apiClient from './apiClient';
import { ApiResponse } from './types';

export type SolicitudTipo = 'productos' | 'vendedor' | 'ambos';
export type SolicitudEstado = 'nueva' | 'contactada' | 'aprobada' | 'rechazada';

export interface SolicitudIncorporacion {
  _id: string;
  tipo: SolicitudTipo;
  contacto: { nombre: string; telefono: string; email?: string; localidad?: string };
  productos?: { descripcion?: string; cantidadAproximada?: number };
  vendedor?: { canales?: string[]; experiencia?: string };
  mensaje?: string;
  estado: SolicitudEstado;
  notasAdmin?: string;
  createdAt: string;
}

export interface NuevaSolicitudPayload {
  tipo: SolicitudTipo;
  nombre: string;
  telefono: string;
  email?: string;
  localidad?: string;
  productosDescripcion?: string;
  cantidadAproximada?: string;
  canales?: string[];
  experiencia?: string;
  mensaje?: string;
  aceptaContacto: true;
}

const idempotencyKey = () => `sumate-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;

export const solicitudesIncorporacionService = {
  async crear(payload: NuevaSolicitudPayload) {
    const response = await apiClient.post<ApiResponse<{ id: string }>>('/solicitudes-incorporacion', { ...payload, website: '' }, {
      headers: { 'x-idempotency-key': idempotencyKey() },
    });
    return response.data;
  },
  async listar() {
    const response = await apiClient.get<ApiResponse<SolicitudIncorporacion[]>>('/solicitudes-incorporacion');
    return response.data.data;
  },
  async actualizar(id: string, estado: SolicitudEstado, notasAdmin?: string) {
    const response = await apiClient.patch<ApiResponse<SolicitudIncorporacion>>(`/solicitudes-incorporacion/${id}`, { estado, notasAdmin });
    return response.data.data;
  },
};
