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
  refreshSession: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Minimum interval between token refreshes (уменьшаем с 15 до 1 минуты)
const MIN_REFRESH_INTERVAL = 60 * 1000;
// Time before expiry to refresh token (5 minutes in ms)
const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000;
// Maximum attempts to refresh token before redirecting to login
const MAX_REFRESH_ATTEMPTS = 3;

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const refreshAttemptsRef = useRef<number>(0);
  const router = useRouter();

  // Function to refresh token
  const refreshSession = useCallback(async (forceRefresh = false) => {
    try {
      // Prevent refreshing too frequently, unless forced
      const now = Date.now();
      if (!forceRefresh && now - lastRefreshTimeRef.current < MIN_REFRESH_INTERVAL) {
        console.log('Skipping token refresh - too soon since last refresh');
        return;
      }
      
      // Если превышено количество попыток, сбрасываем счетчик и перенаправляем на логин
      if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
        console.log(`Max refresh attempts (${MAX_REFRESH_ATTEMPTS}) reached, redirecting to login`);
        refreshAttemptsRef.current = 0;
        setUser(null);
        setExpiresAt(null);
        router.push('/auth/login');
        return;
      }
      
      // Update last refresh time and increment attempts counter
      lastRefreshTimeRef.current = now;
      refreshAttemptsRef.current += 1;
      
      console.log('Refreshing token...');
      const response = await refreshTokenApi();
      
      // Сброс счетчика попыток при успешном обновлении
      refreshAttemptsRef.current = 0;
      
      // Обновляем пользователя и время истечения токена
      setUser(response.user);
      setExpiresAt(response.expiresAt);
      
      // Schedule next refresh
      scheduleTokenRefresh(response.expiresAt);
    } catch (err) {
      console.error('Failed to refresh token:', err);
      
      // Увеличиваем счетчик попыток, но не редиректим сразу
      // Редирект произойдет при MAX_REFRESH_ATTEMPTS
      if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
        // Handle failed refresh after max attempts - redirect to login
        setUser(null);
        setExpiresAt(null);
        router.push('/auth/login');
      } else {
        // Если ошибка 429 (rate limiting), делаем более длительную паузу перед следующей попыткой
        const isRateLimited = err instanceof Error && err.message.includes('too frequently');
        const retryDelay = isRateLimited ? 60000 : 5000; // 1 минута или 5 секунд
        
        console.log(`Will retry token refresh in ${retryDelay/1000} seconds`);
        setTimeout(() => refreshSession(true), retryDelay);
      }
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
      refreshSession(true); // Принудительное обновление
      return;
    }
    
    // Refresh 5 minutes before expiry, or immediately if less than 5 minutes left
    const refreshTime = Math.max(0, timeUntilExpiry - REFRESH_BEFORE_EXPIRY);
    
    console.log(`Scheduling token refresh in ${Math.floor(refreshTime / 1000 / 60)} minutes`);
    
    refreshTimeoutRef.current = setTimeout(() => {
      refreshSession(true); // Принудительное обновление по таймауту
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
          
          // Reset refresh attempts counter
          refreshAttemptsRef.current = 0;
          
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

  // Setup fetch interceptor for handling 401 errors
  useEffect(() => {
    // Оригинальная функция fetch
    const originalFetch = window.fetch;
    
    // Замена на перехватчик
    window.fetch = async (input, init) => {
      try {
        // Выполняем оригинальный запрос
        const response = await originalFetch(input, init);
        
        // Перехватываем ошибку 401
        if (response.status === 401) {
          // Только для API запросов, не для внешних ресурсов
          const url = typeof input === 'string' ? input : input.url;
          if (url.includes('/api/') && user) {
            console.log('Intercepted 401 response, attempting to refresh token');
            try {
              // Пытаемся обновить токен
              await refreshSession(true);
              
              // Повторяем оригинальный запрос
              return await originalFetch(input, init);
            } catch (refreshError) {
              console.error('Failed to refresh token in fetch interceptor:', refreshError);
              // Если обновление не удалось, возвращаем исходный ответ с 401
            }
          }
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };
    
    // Восстанавливаем оригинальную функцию при размонтировании
    return () => {
      window.fetch = originalFetch;
    };
  }, [refreshSession, user]);

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
      
      // Reset refresh attempts counter
      refreshAttemptsRef.current = 0;
      
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
    <AuthContext.Provider value={{ user, isLoading, login, logout, error, refreshSession }}>
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