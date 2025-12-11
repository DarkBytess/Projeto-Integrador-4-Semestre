import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await apiClient.init();
      if (apiClient.isAuthenticated()) {
        const userData = await apiClient.getMe();
        setUser(userData);
      }
    } catch (error) {
      await apiClient.clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, senha: string) => {
    const response = await apiClient.login(email, senha);
    await apiClient.setToken(response.token);
    setUser(response.user);
  };

  const register = async (nome: string, email: string, senha: string) => {
    const response = await apiClient.register(nome, email, senha);
    await apiClient.setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    await apiClient.clearToken();
    setUser(null);
  };

  const loginWithToken = async (token: string) => {
    await apiClient.setToken(token);
    const userData = await apiClient.getMe();
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
