// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react'; // Added useCallback
import { authService } from '../services/auth.service';

// Interface for User data remains the same
interface User {
  id: number;
  email: string;
  name: string;
  age?: number;
  bio?: string;
  profile_picture_url?: string;
}

// *** Add fetchCurrentUser to the context type definition ***
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, age?: number, bio?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  fetchCurrentUser: () => Promise<void>; // <-- Added function type
}

// AuthContext creation remains the same
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // *** Define the fetchCurrentUser function ***
  // Use useCallback to memoize the function
  const fetchCurrentUser = useCallback(async () => {
    console.log('🔄 [AuthContext] Fetching current user...');
    // No need to set loading to true here unless it's a forced refresh
    // setLoading(true);
    if (authService.isAuthenticated()) { //
      try {
        const userData = await authService.getCurrentUser(); //
        console.log('✅ [AuthContext] Current user fetched:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ [AuthContext] Failed to fetch user, logging out:', error);
        // If fetching fails (e.g., invalid token), log out
        await authService.logout(); //
        setUser(null);
      } finally {
         // Only set loading false if it was set true initially or on error maybe
         // setLoading(false);
      }
    } else {
        console.log('ℹ️ [AuthContext] No token found, user is not authenticated.');
        setUser(null); // Ensure user is null if not authenticated
        // setLoading(false); // Make sure loading stops if check is done
    }
  }, []); // useCallback dependency array is empty as it doesn't depend on props/state outside its scope

  // Initial authentication check on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true); // Start loading on initial check
      await fetchCurrentUser(); // Use the new function for the initial check
      setLoading(false); // Stop loading after the check is complete
    };
    checkAuth();
  }, [fetchCurrentUser]); // Add fetchCurrentUser as a dependency

  // Login, Register, Logout functions remain largely the same
  const login = async (email: string, password: string) => {
    try {
      // authService.login saves the token to localStorage
      await authService.login({ email, password }); //
      // Now that the token is set, fetch the most up-to-date user data
      await fetchCurrentUser(); // <--- ADD THIS CALL
    } catch (error) {
       console.error('❌ [AuthContext] Login failed:', error);
       setUser(null); // Ensure user is null on login failure
       localStorage.removeItem('token'); // Clear token on login failure
       throw error; // Re-throw so Login page can display the error
    }
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
      // authService.register saves the token to localStorage
      await authService.register({ email, password, name, age, bio }); //
      // Now that the token is set, fetch the user data
      await fetchCurrentUser(); // <--- ADD THIS CALL
    } catch (error) {
      console.error('❌ [AuthContext] Register failed:', error);
      setUser(null); // Ensure user is null on register failure
      localStorage.removeItem('token'); // Clear token on register failure
      throw error; // Re-throw so Signup page can display the error
    }
  };

  const logout = async () => {
    await authService.logout(); //
    setUser(null);
  };

  return (
    // *** Add fetchCurrentUser to the provided context value ***
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook remains the same
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};