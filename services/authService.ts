import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import { Usuario } from './types';

export interface LoginResult {
  token?: string;
  usuario: Usuario;
}

const TOKEN_KEY = 'auth_token';

export const authService = {
  async loginWithGoogle(credential: string): Promise<LoginResult> {
    const response = await apiClient.post('/auth/google', { credential });
    const result = response.data.data as LoginResult;
    if (result.token) await AsyncStorage.setItem(TOKEN_KEY, result.token);
    return result;
  },

  async me(): Promise<Usuario> {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  async hasToken(): Promise<boolean> {
    return Boolean(await AsyncStorage.getItem(TOKEN_KEY));
  },

  async logout(): Promise<void> {
    try {
      if (await this.hasToken()) await apiClient.post('/auth/logout');
    } finally {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }
};
