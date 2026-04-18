import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

const STORAGE_TOKEN = 'token';
const STORAGE_USER  = 'user';

export const ROLES = {
  MANAGER:      'MANAGER',
  FRONT_DESK:   'FRONT_DESK',
  HOUSEKEEPING: 'HOUSEKEEPING',
};

/**
 * Development-mode fallback login.
 * When the backend isn't up yet, we still want the UI to be testable.
 * Real auth happens via POST /api/auth/login which returns { token, user }.
 */
function mockLogin(email) {
  const lower = (email || '').toLowerCase();
  let role = ROLES.FRONT_DESK;
  if (lower.endsWith('@manager.com'))      role = ROLES.MANAGER;
  else if (lower.endsWith('@housekeeping.com')) role = ROLES.HOUSEKEEPING;

  const name = lower.split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Staff';

  // Fake signed-ish token — only used if the real /api/auth/login is unreachable.
  const token = `dev.${btoa(JSON.stringify({ email: lower, role, iat: Date.now() }))}`;
  return { token, user: { email: lower, name, role } };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN));
  const [user,  setUser]  = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Global 401 handler — if any API call 401s, log the user out.
  useEffect(() => {
    const id = api.interceptors.response.use(
      (resp) => resp,
      (err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem(STORAGE_TOKEN);
          localStorage.removeItem(STORAGE_USER);
          setToken(null);
          setUser(null);
          if (window.location.pathname !== '/login') {
            window.location.assign('/login');
          }
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      let payload;
      try {
        const resp = await api.post('/api/auth/login', { email, password });
        payload = resp.data;
      } catch (netErr) {
        // Backend not reachable → dev mock (still requires a password to prevent typos).
        if (!password || password.length < 4) {
          throw new Error('Password must be at least 4 characters.');
        }
        payload = mockLogin(email);
      }

      const { token: t, user: u } = payload || {};
      if (!t || !u) throw new Error('Invalid login response.');

      localStorage.setItem(STORAGE_TOKEN, t);
      localStorage.setItem(STORAGE_USER,  JSON.stringify(u));
      setToken(t);
      setUser(u);
      return u;
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Login failed.';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      if (!roles) return true;
      const arr = Array.isArray(roles) ? roles : [roles];
      return arr.includes(user.role);
    },
    [user]
  );

  const value = {
    token,
    user,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    hasRole,
    ROLES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
