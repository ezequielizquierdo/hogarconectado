import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import apiClient from './apiClient';

export interface UploadedImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
}

const blobToDataUrl = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

const optimizeWebImage = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('No se pudo leer la imagen seleccionada');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('No se pudo preparar la imagen seleccionada'));
      element.src = objectUrl;
    });
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return blobToDataUrl(blob);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const uriToDataUrl = async (uri: string): Promise<string> => {
  if (uri.startsWith('data:')) return uri;
  if (Platform.OS === 'web') {
    return optimizeWebImage(uri);
  }
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const extension = uri.split('.').pop()?.toLowerCase();
  const mimeType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
};

export const uploadService = {
  async subirImagen(uri: string): Promise<UploadedImage> {
    const imageData = await uriToDataUrl(uri);
    const response = await apiClient.post('/upload/base64', { imageData, filename: `producto_${Date.now()}` });
    return response.data.data;
  },
  async eliminarImagen(publicId: string): Promise<void> {
    await apiClient.delete('/upload/cloudinary', { data: { publicId } });
  }
};
