import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  userId: string;
  email: string;
  displayName?: string;
  image?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string, remember?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token') || localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = (userData: User, authToken: string, remember: boolean = false) => {
    setUser(userData);
    setToken(authToken);
    
    const storage = remember ? localStorage : sessionStorage;
    const fallbackStorage = remember ? sessionStorage : localStorage;
    fallbackStorage.removeItem('token');
    fallbackStorage.removeItem('user');
    
    storage.setItem('token', authToken);
    storage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
