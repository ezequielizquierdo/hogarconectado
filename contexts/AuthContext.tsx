import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '@/services/authService';
import { Usuario } from '@/services/types';
import { setUnauthorizedHandler } from '@/services/apiClient';

type AuthState = 'loading' | 'unauthenticated' | 'authenticated' | 'pending' | 'blocked';

interface AuthContextValue {
  state: AuthState;
  user: Usuario | null;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (...roles: Usuario['rol'][]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState<AuthState>('loading');
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setState('unauthenticated');
    });
    return () => setUnauthorizedHandler();
  }, []);

  useEffect(() => {
    authService.hasToken().then(async hasToken => {
      if (!hasToken) return setState('unauthenticated');
      try {
        const current = await authService.me();
        setUser(current);
        setState(current.estado === 'activo' ? 'authenticated' : current.estado === 'pendiente' ? 'pending' : 'blocked');
      } catch {
        await authService.logout().catch(() => undefined);
        setState('unauthenticated');
      }
    });
  }, []);

  const loginWithGoogle = async (credential: string) => {
    setState('loading');
    try {
      const result = await authService.loginWithGoogle(credential);
      setUser(result.usuario);
      setState(result.usuario.estado === 'activo' ? 'authenticated' : result.usuario.estado === 'pendiente' ? 'pending' : 'blocked');
    } catch (error: any) {
      const blockedUser = error.response?.data?.data?.usuario as Usuario | undefined;
      if (blockedUser?.estado === 'bloqueado') {
        setUser(blockedUser);
        setState('blocked');
      } else {
        setState('unauthenticated');
        throw error;
      }
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setState('unauthenticated');
  };

  const value = useMemo(() => ({
    state, user, loginWithGoogle, logout,
    can: (...roles: Usuario['rol'][]) => Boolean(user && roles.includes(user.rol))
  }), [state, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
