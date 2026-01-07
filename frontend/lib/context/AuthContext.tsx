'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest, VerifyOtpRequest } from '@/lib/types/auth';
import * as authApi from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  verifyOtp: (data: VerifyOtpRequest) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    setUser(response.user);
  };

  const register = async (data: RegisterRequest) => {
    await authApi.register(data);
  };

  const verifyOtp = async (data: VerifyOtpRequest) => {
    const response = await authApi.verifyOtp(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    setUser(response.user);
  };

  const resendOtp = async (email: string) => {
    await authApi.resendOtp(email);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

