import apiClient from './apiClient';
import { UserRole, Usuario } from './types';

export const usuariosService = {
  async listar(estado?: string): Promise<Usuario[]> {
    const response = await apiClient.get('/usuarios', { params: estado ? { estado } : undefined });
    return response.data.data;
  },
  async aprobar(id: string, rol: UserRole): Promise<Usuario> {
    const response = await apiClient.put(`/usuarios/${id}/aprobar`, { rol });
    return response.data.data;
  },
  async cambiarRol(id: string, rol: UserRole): Promise<Usuario> {
    const response = await apiClient.put(`/usuarios/${id}/rol`, { rol });
    return response.data.data;
  },
  async bloquear(id: string): Promise<Usuario> {
    const response = await apiClient.put(`/usuarios/${id}/bloquear`);
    return response.data.data;
  },
  async reactivar(id: string): Promise<Usuario> {
    const response = await apiClient.put(`/usuarios/${id}/reactivar`);
    return response.data.data;
  }
};
