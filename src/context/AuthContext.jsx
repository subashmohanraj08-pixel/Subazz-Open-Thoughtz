import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sot_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('sot_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authService.me();
      setUser(data.user);
      localStorage.setItem('sot_user', JSON.stringify(data.user));
    } catch (err) {
      localStorage.removeItem('sot_token');
      localStorage.removeItem('sot_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (emailOrUsername, password) => {
    const { data } = await authService.login({ emailOrUsername, password });
    localStorage.setItem('sot_token', data.token);
    localStorage.setItem('sot_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    localStorage.setItem('sot_token', data.token);
    localStorage.setItem('sot_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore network errors on logout
    }
    localStorage.removeItem('sot_token');
    localStorage.removeItem('sot_user');
    setUser(null);
  };

  const updateLocalUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('sot_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocalUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
