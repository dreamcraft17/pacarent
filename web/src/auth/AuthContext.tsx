import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, clearTokens, setTokens } from '../api/client';

type Me = {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  profile?: { fullName: string; city: string };
};

type AuthContextValue = {
  me: Me | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const data = await api<Me>('/api/auth/me');
      setMe(data);
    } catch {
      setMe(null);
      clearTokens();
    }
  }, []);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (loginId: string, password: string) => {
    const data = await api<{
      accessToken: string;
      refreshToken: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login: loginId, password }),
    });
    setTokens(data.accessToken, data.refreshToken);
    await refreshMe();
  }, [refreshMe]);

  const logout = useCallback(() => {
    clearTokens();
    setMe(null);
  }, []);

  const value = useMemo(
    () => ({ me, loading, login, logout, refreshMe }),
    [me, loading, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth di luar AuthProvider');
  return ctx;
}
