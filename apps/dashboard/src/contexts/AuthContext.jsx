'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ff_token');
    const savedUser = localStorage.getItem('ff_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      api.get('/api/auth/me')
        .then((data) => {
          setUser(data.user);
          localStorage.setItem('ff_user', JSON.stringify(data.user));
        })
        .catch(() => {
          localStorage.removeItem('ff_token');
          localStorage.removeItem('ff_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('ff_token', data.token);
    localStorage.setItem('ff_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api.post('/api/auth/register', { name, email, password });
    localStorage.setItem('ff_token', data.token);
    localStorage.setItem('ff_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const updateProfile = useCallback(async (data) => {
    const result = await api.put('/api/auth/me', data);
    setUser(result.user);
    localStorage.setItem('ff_user', JSON.stringify(result.user));
    return result;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
