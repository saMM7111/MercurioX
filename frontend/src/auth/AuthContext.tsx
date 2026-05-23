import React, { createContext, useState, useEffect } from 'react';
import { axiosInstance, setAccessToken } from '../api/axiosInstance';

export type Role = 'ADMIN' | 'MANAGER' | 'VIEWER' | 'USER';

export interface User {
  id: string;
  username: string;
  role: Role;
}

type AuthPayload = {
  userId: string;
  username: string;
  role: Role;
  accessToken: string;
};

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map the backend AuthResponse flat shape → our User type
function mapAuthData(payload: AuthPayload): { user: User; token: string } {
  return {
    token: payload.accessToken,
    user: { id: payload.userId, username: payload.username, role: payload.role },
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await axiosInstance.post('/auth/refresh');
        const payload = data?.data as AuthPayload | undefined;
        if (payload?.accessToken) {
          const { token, user: u } = mapAuthData(payload);
          setAccessTokenState(token);
          setAccessToken(token);
          setUser(u);
        }
      } catch {
        // No valid refresh token — user must log in
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    const payload = data?.data as AuthPayload | undefined;
    if (!payload?.accessToken) {
      throw new Error('Invalid auth response');
    }
    const { token, user: u } = mapAuthData(payload);
    setAccessTokenState(token);
    setAccessToken(token);
    setUser(u);
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
