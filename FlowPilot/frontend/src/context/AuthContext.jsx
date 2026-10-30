import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('flowpilot_user') || localStorage.getItem('flowguard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('flowpilot_token') || localStorage.getItem('flowguard_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on initial mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('flowpilot_token') || localStorage.getItem('flowguard_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('flowpilot_user', JSON.stringify(res.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();

    // Listen for 401 token expiry event dispatched by api.js
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('flowpilot_token', res.token);
      localStorage.setItem('flowpilot_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Authentication failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.logout().catch(() => {});
      }
    } finally {
      localStorage.removeItem('flowpilot_token');
      localStorage.removeItem('flowguard_token');
      localStorage.removeItem('flowpilot_user');
      localStorage.removeItem('flowguard_user');
      setToken(null);
      setUser(null);
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    hasRole,
    isAdmin: user?.role === 'ADMIN',
    isOfficial: user?.role === 'OFFICIAL',
    isInstitution: user?.role === 'INSTITUTION'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
