import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('fintrack-theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fintrack-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('fintrack-token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await authService.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('fintrack-token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('fintrack-token', data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (userData) => {
    const data = await authService.signup(userData);
    localStorage.setItem('fintrack-token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fintrack-token');
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
