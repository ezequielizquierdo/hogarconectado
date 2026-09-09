import apiClient from './apiClient';
import { ApiResponse, CotizacionModalidad } from './types';

export interface PublicQuote {
  id: string;
  cliente: string;
  vendedor: string;
  productos: Array<{ marca: string; modelo: string; cantidad: number; imagen?: string; precioUnitario: number; subtotal: number }>;
  modalidadPago: CotizacionModalidad;
  total: number;
  cuotas?: { cantidad: number; monto: number } | null;
  observaciones?: string;
  aceptada: boolean;
  pedido?: { estado: 'reserva-pendiente' | 'pago-informado' | 'pago-confirmado' | 'cancelado' | 'vencido'; reservaVenceAt: string; pagoInformadoAt?: string } | null;
  enlaceVenceAt: string;
}

export interface PublicOrderResult {
  id: string;
  estado: 'reserva-pendiente' | 'pago-informado' | 'pago-confirmado';
  reservaVenceAt: string;
  pagoInformadoAt?: string;
}

function idempotencyKey(token: string) {
  return `aceptar-${token.slice(0, 12)}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function get(token: string) {
  const response = await apiClient.get<ApiResponse<PublicQuote>>(`/cotizaciones-publicas/${token}`);
  return response.data.data;
}

async function accept(token: string, key = idempotencyKey(token)) {
  const response = await apiClient.post<ApiResponse<PublicOrderResult>>(
    `/cotizaciones-publicas/${token}/aceptar`,
    { aceptaReserva24h: true },
    { headers: { 'x-idempotency-key': key } }
  );
  return response.data;
}

async function reportPayment(token: string) {
  const response = await apiClient.post<ApiResponse<PublicOrderResult>>(
    `/cotizaciones-publicas/${token}/informar-pago`
  );
  return response.data;
}

export default { accept, get, reportPayment };
