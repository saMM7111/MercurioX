import React, { createContext, useState, useEffect } from 'react';
import { axiosInstance, setAccessToken } from '../api/axiosInstance';

export type Role = 'ADMIN' | 'MANAGER' | 'VIEWER' | 'USER';

export interface User {
  id: string;
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On load, attempt to refresh token
    const initAuth = async () => {
      try {
        const { data } = await axiosInstance.post('/auth/refresh');
        const token = data.data.accessToken;
        setAccessTokenState(token);
        setAccessToken(token);
        
        // Decoding JWT or using `/auth/me` to get user details would be ideal here.
        // For now, assume backend returns user in AuthResponse or we extract it.
        if (data.data.user) {
          setUser(data.data.user);
        }
      } catch (err) {
        console.error('Initial refresh failed', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    const token = data.data.accessToken;
    setAccessTokenState(token);
    setAccessToken(token);
    setUser(data.data.user);
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      setAccessTokenState(null);
      setAccessToken(null);
      setUser(null);
    }
  };

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken: accessTokenState, login, logout, hasRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
