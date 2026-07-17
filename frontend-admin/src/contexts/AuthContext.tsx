import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminLogin, AdminLoginResponse } from '../services/adminService';
import axios from 'axios';
import api from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  adminInfo: AdminLoginResponse | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if user is already logged in from localStorage
    const savedToken = localStorage.getItem('adminToken');
    return !!savedToken;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('adminToken');
  });

  const [adminInfo, setAdminInfo] = useState<AdminLoginResponse | null>(() => {
    const savedAdminInfo = localStorage.getItem('adminInfo');
    return savedAdminInfo ? JSON.parse(savedAdminInfo) : null;
  });

  useEffect(() => {
    // Set axios default authorization header if token exists
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Handle 401 response globally
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized access detected (401), logging out...");
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  // Listen for storage changes (cross-tab logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'adminToken' || e.key === 'adminInfo') && !e.newValue) {
        console.log(`${e.key} removed from another tab, logging out...`);
        logout();
      }
      if (e.key === 'adminAuthenticated' && e.newValue !== 'true') {
        console.log("adminAuthenticated changed or removed, logging out...");
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodic check for local storage (to handle current tab manual deletion)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('adminToken');
      const currentAdminInfo = localStorage.getItem('adminInfo');
      const authStatus = localStorage.getItem('adminAuthenticated');
      
      if (isAuthenticated && (!currentToken || !currentAdminInfo || authStatus !== 'true')) {
        console.log("Authentication data missing or invalid in localStorage, logging out...");
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await adminLogin({ email, password });

      // Store token and admin info
      setToken(response.token);
      setAdminInfo(response);
      setIsAuthenticated(true);

      // Save to localStorage
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminInfo', JSON.stringify(response));
      localStorage.setItem('adminAuthenticated', 'true');

      return true;
    } catch (error: unknown) {
      console.error('Login error:', error);
      // Handle error - return false to indicate login failed
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setAdminInfo(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('adminAuthenticated');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token, adminInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

