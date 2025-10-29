// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { authService } from '../services/auth.service'; //

// Interface for User data remains the same
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
  fetchCurrentUser: () => Promise<void>;
  isNewSignup: boolean; // Represents if profile setup is likely needed
  resetNewSignupFlag: () => void;
  matchIdToOpen: number | null;
  setMatchIdToOpen: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [matchIdToOpen, setMatchIdToOpenState] = useState<number | null>(null);

  const setMatchIdToOpen = (id: number | null) => {
    console.log(`[AuthContext] Setting matchIdToOpen to: ${id}`);
    setMatchIdToOpenState(id);
  }

  const resetNewSignupFlag = () => {
    console.log('🔄 [AuthContext] Manually resetting isNewSignup flag.');
    setIsNewSignup(false);
  };

  const fetchCurrentUser = useCallback(async () => {
    console.log('🔄 [AuthContext] fetchCurrentUser starting...');

    if (authService.isAuthenticated()) { //
      try {
        const userData = await authService.getCurrentUser(); //
        console.log('✅ [AuthContext] Current user fetched:', userData);
        setUser(userData);

        // *** Determine isNewSignup based on profile_picture_url ***
        if (!userData.profile_picture_url) {
          console.log('🚩 [AuthContext] User profile picture is missing, setting isNewSignup = true.');
          setIsNewSignup(true);
        } else {
          console.log('✅ [AuthContext] User has profile picture, setting isNewSignup = false.');
          setIsNewSignup(false);
        }
        // **********************************************************

      } catch (error) {
        console.error('❌ [AuthContext] Failed to fetch user, logging out:', error);
        await authService.logout(); //
        setUser(null);
        setIsNewSignup(false); // Reset on error too
      }
    } else {
        console.log('ℹ️ [AuthContext] No token found, user is not authenticated.');
        setUser(null);
        setIsNewSignup(false); // Reset if not authenticated
    }
    console.log('🔄 [AuthContext] fetchCurrentUser finished.');
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('⏳ [AuthContext] Initial auth check starting...');
      setLoading(true);
      await fetchCurrentUser();
      setLoading(false);
      console.log('✅ [AuthContext] Initial auth check finished.');
    };
    checkAuth();
  }, [fetchCurrentUser]);

  // --- MODIFIED LOGIN ---
  const login = async (email: string, password: string) => {
    console.log('🔄 [AuthContext] Login initiated...');
    // REMOVED: setIsNewSignup(false); // Don't reset here anymore

    try {
      await authService.login({ email, password }); //
      console.log('🔐 [AuthContext] Login API call successful. Fetching user data...');
      await fetchCurrentUser(); // Fetch user data; this will now set isNewSignup based on the profile pic
      console.log(`✅ [AuthContext] Login process finished. isNewSignup is now: ${isNewSignup}`); // Log the state *after* fetch
    } catch (error) {
       console.error('❌ [AuthContext] Login failed:', error);
       setUser(null);
       setIsNewSignup(false); // Ensure flag is false on login error
       localStorage.removeItem('token');
       throw error; // Re-throw for the component
    }
  };
  // --- END MODIFIED LOGIN ---

  const register = async (
    email: string,
    password: string,
    name: string,
    age?: number,
    bio?: string
  ) => {
    console.log('🔐 [AuthContext] Register called with:', { email, name, age });
    try {
      console.log('🔐 [AuthContext] Calling authService.register...');
      await authService.register({ email, password, name, age, bio }); //
      console.log('✅ [AuthContext] authService.register successful.');
      console.log('🔐 [AuthContext] Calling fetchCurrentUser after register...');
      await fetchCurrentUser(); // Let fetchCurrentUser determine the flag
      console.log(`✅ [AuthContext] Register function finished. isNewSignup is now: ${isNewSignup}`);
    } catch (error) {
      console.error('❌ [AuthContext] Register failed:', error);
      setUser(null);
      setIsNewSignup(false); // Reset flag on failure
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = async () => {
    console.log('🔄 [AuthContext] Logout initiated, resetting isNewSignup.');
    await authService.logout(); //
    setUser(null);
    setIsNewSignup(false);
  };

  return (
    // *** ADDED: Provide the new state and setter ***
    <AuthContext.Provider value={{
      user, login, register, logout, loading, fetchCurrentUser, isNewSignup, resetNewSignupFlag,
      matchIdToOpen, setMatchIdToOpen // <-- Add here
      }}>
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