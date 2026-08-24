import apiClient from './apiClient';
import type { ApiResponse, CalculoPrecios } from './types';

class PreciosService {
    async calcular(precioBase: number, porcentaje: number): Promise<CalculoPrecios> {
        const response = await apiClient.post<ApiResponse<CalculoPrecios>>(
            '/precios/calcular',
            { precioBase, porcentaje }
        );
        return response.data.data;
    }
}

export default new PreciosService();
