import apiClient from './apiClient';
import {
    Categoria,
    ApiResponse,
    ApiListResponse,
} from './types';

class CategoriasService {
    // Obtener todas las categorías
    async obtenerCategorias(): Promise<Categoria[]> {
        try {
            const response = await apiClient.get<ApiListResponse<Categoria>>('/categorias');
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            throw error;
        }
    }

    // Obtener categoría por ID
    async obtenerCategoriaPorId(id: string): Promise<Categoria> {
        try {
            const response = await apiClient.get<ApiResponse<Categoria>>(`/categorias/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo categoría por ID:', error);
            throw error;
        }
    }

    // Crear nueva categoría
    async crearCategoria(categoria: Omit<Categoria, '_id' | 'createdAt' | 'updatedAt'>): Promise<Categoria> {
        try {
            const response = await apiClient.post<ApiResponse<Categoria>>('/categorias', categoria);
            return response.data.data;
        } catch (error) {
            console.error('Error creando categoría:', error);
            throw error;
        }
    }

    // Actualizar categoría
    async actualizarCategoria(id: string, categoria: Partial<Categoria>): Promise<Categoria> {
        try {
            const response = await apiClient.put<ApiResponse<Categoria>>(`/categorias/${id}`, categoria);
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando categoría:', error);
            throw error;
        }
    }

    // Eliminar categoría
    async eliminarCategoria(id: string): Promise<void> {
        try {
            await apiClient.delete(`/categorias/${id}`);
        } catch (error) {
            console.error('Error eliminando categoría:', error);
            throw error;
        }
    }
}

export default new CategoriasService();
