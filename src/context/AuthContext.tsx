import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService } from '../services/auth.service';

interface User {
  id: number;
  email: string;
  name: string;
  age?: number;
  bio?: string;
  profile_picture_url?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, age?: number, bio?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    age?: number,
    bio?: string
  ) => {
    console.log('🔐 [AuthContext] Register called with:', { email, name, age });
    try {
      const data = await authService.register({ email, password, name, age, bio });
      console.log('✅ [AuthContext] Register successful, user data received:', data.user);
      setUser(data.user);
    } catch (error) {
      console.error('❌ [AuthContext] Register failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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
