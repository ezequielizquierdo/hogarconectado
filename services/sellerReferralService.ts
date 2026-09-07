import AsyncStorage from '@react-native-async-storage/async-storage';

import apiClient from './apiClient';
import { ApiResponse } from './types';

const STORAGE_KEY = 'hc_seller_ref';
const ATTRIBUTION_MS = 30 * 24 * 60 * 60 * 1000;

export interface SellerReferral {
  codigo: string;
  nombre: string;
  expiresAt: number;
}

async function validate(codigo: string) {
  const normalizedCode = codigo.trim().toLowerCase();
  if (!/^[a-z0-9-]{6,32}$/.test(normalizedCode)) return null;
  try {
    const response = await apiClient.get<ApiResponse<{ codigo: string; nombre: string }>>(`/vendedores/${normalizedCode}`);
    return response.data.data;
  } catch {
    return null;
  }
}

async function remember(codigo: string): Promise<SellerReferral | null> {
  const seller = await validate(codigo);
  if (!seller) return null;
  const referral = { ...seller, expiresAt: Date.now() + ATTRIBUTION_MS };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(referral));
  return referral;
}

async function current(): Promise<SellerReferral | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const referral = JSON.parse(raw) as SellerReferral;
    if (!referral.codigo || referral.expiresAt <= Date.now()) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return referral;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export default { current, remember };
