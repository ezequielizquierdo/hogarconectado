import apiClient from './apiClient';
import { ProductImageDraft, ApiResponse } from './types';
import { uriToDataUrl } from './uploadService';

export const productAssistantService = {
  async analizarImagen(uri: string): Promise<ProductImageDraft> {
    const imageData = await uriToDataUrl(uri);
    const response = await apiClient.post<ApiResponse<ProductImageDraft>>('/product-assistant/analyze', { imageData });
    return { ...response.data.data, porcentajeGanancia: 30 };
  }
};
