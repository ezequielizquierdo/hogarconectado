import apiClient from './apiClient';
import { ApiResponse } from './types';

export type PedidoEstado = 'reserva-pendiente' | 'pago-informado' | 'pago-confirmado' | 'cancelado' | 'vencido';

export interface PedidoResumen {
  _id: string;
  estado: PedidoEstado;
  reservadoAt: string;
  reservaVenceAt: string;
  pagoInformadoAt?: string;
}

async function cambiarEstado(id: string, estado: 'pago-confirmado' | 'cancelado') {
  const response = await apiClient.patch<ApiResponse<PedidoResumen>>(`/pedidos/${id}/estado`, { estado });
  return response.data.data;
}

export default { cambiarEstado };
