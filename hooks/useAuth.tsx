'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { login as loginApi, logout as logoutApi, getSession, refreshToken as refreshTokenApi } from '@/lib/auth/auth';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Minimum interval between token refreshes (15 minutes in ms)
const MIN_REFRESH_INTERVAL = 15 * 60 * 1000;
// Time before expiry to refresh token (5 minutes in ms)
const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000;

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const router = useRouter();

  // Function to refresh token
  const refreshSession = useCallback(async () => {
    try {
      // Prevent refreshing too frequently
      const now = Date.now();
      if (now - lastRefreshTimeRef.current < MIN_REFRESH_INTERVAL) {
        console.log('Skipping token refresh - too soon since last refresh');
        return;
      }
      
      // Update last refresh time
      lastRefreshTimeRef.current = now;
      
      console.log('Refreshing token...');
      const response = await refreshTokenApi();
      setUser(response.user);
      setExpiresAt(response.expiresAt);
      
      // Schedule next refresh
      scheduleTokenRefresh(response.expiresAt);
    } catch (err) {
      console.error('Failed to refresh token:', err);
      // Handle failed refresh - redirect to login
      setUser(null);
      setExpiresAt(null);
      router.push('/auth/login');
    }
  }, [router]);

  // Schedule token refresh before it expires
  const scheduleTokenRefresh = useCallback((tokenExpiresAt: number) => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    const currentTime = Date.now();
    const timeUntilExpiry = tokenExpiresAt - currentTime;
    
    // Don't schedule if token is already expired
    if (timeUntilExpiry <= 0) {
      console.log('Token already expired, refreshing immediately');
      refreshSession();
      return;
    }
    
    // Refresh 5 minutes before expiry, or immediately if less than 5 minutes left
    const refreshTime = Math.max(0, timeUntilExpiry - REFRESH_BEFORE_EXPIRY);
    
    console.log(`Scheduling token refresh in ${Math.floor(refreshTime / 1000 / 60)} minutes`);
    
    refreshTimeoutRef.current = setTimeout(() => {
      refreshSession();
    }, refreshTime);
  }, [refreshSession]);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getSession();
        if (session) {
          setUser(session.user);
          setExpiresAt(session.expiresAt);
          
          // Initialize last refresh time
          lastRefreshTimeRef.current = Date.now();
          
          // Schedule token refresh
          scheduleTokenRefresh(session.expiresAt);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    
    // Cleanup function to clear timeout
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [scheduleTokenRefresh]);

  // Setup axios interceptor for handling 401 errors
  useEffect(() => {
    // This would be the place to set up an interceptor for API requests
    // to automatically try to refresh the token when a 401 is received
    // Example using axios:
    // 
    // axios.interceptors.response.use(
    //  response => response,
    //  async error => {
    //    if (error.response?.status === 401) {
    //      try {
    //        await refreshSession();
    //        // Retry the original request
    //        return axios(error.config);
    //      } catch (refreshError) {
    //        // If refresh fails, redirect to login
    //        router.push('/auth/login');
    //        return Promise.reject(refreshError);
    //      }
    //    }
    //    return Promise.reject(error);
    //  }
    // );
    
    // Cleanup function would remove the interceptor
  }, [refreshSession, router]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginApi({ email, password });
      setUser(response.user);
      setExpiresAt(response.expiresAt);
      
      // Initialize last refresh time
      lastRefreshTimeRef.current = Date.now();
      
      // Schedule token refresh
      scheduleTokenRefresh(response.expiresAt);
      
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await logoutApi();
      setUser(null);
      setExpiresAt(null);
      
      // Clear any scheduled refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      router.push('/auth/login'); // Redirect to login page after logout
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 