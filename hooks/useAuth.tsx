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
  refreshSession: (forceRefresh?: boolean) => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

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
  const initializedRef = useRef<boolean>(false);

  // Function to refresh token
  const refreshSession = useCallback(async (forceRefresh = false) => {
    try {
      // Расширенное логирование
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
      console.log(`[REFRESH] Attempt initiated. Force refresh: ${forceRefresh}`);
      console.log(`[REFRESH] Time since last refresh: ${timeSinceLastRefresh}ms (${Math.round(timeSinceLastRefresh/1000)} seconds)`);
      console.log(`[REFRESH] Current refresh attempts: ${refreshAttemptsRef.current}`);
      
      if (expiresAt) {
        const timeUntilExpiry = expiresAt - now;
        console.log(`[REFRESH] Token expires at: ${new Date(expiresAt).toISOString()}`);
        console.log(`[REFRESH] Time until expiry: ${timeUntilExpiry}ms (${Math.round(timeUntilExpiry/1000/60)} minutes)`);
      } else {
        console.log(`[REFRESH] No expiration time set!`);
      }

      // Prevent refreshing too frequently, unless forced
      if (!forceRefresh && timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
        console.log('[REFRESH] Skipping - too soon since last refresh');
        
        // Проверка истечения токена, даже если слишком рано для обновления
        if (expiresAt && now >= expiresAt) {
          console.log('[REFRESH] WARNING: Token has expired but refresh is rate-limited');
          // Планируем повторную попытку через короткий интервал, если токен истек
          setTimeout(() => refreshSession(true), 5000);
        }
        
        return;
      }
      
      // Если превышено количество попыток, сбрасываем счетчик и перенаправляем на логин
      if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
        console.log(`[REFRESH] Max attempts (${MAX_REFRESH_ATTEMPTS}) reached, redirecting to login`);
        refreshAttemptsRef.current = 0;
        setUser(null);
        setExpiresAt(null);
        router.push('/auth/login');
        return;
      }
      
      // Update last refresh time and increment attempts counter
      lastRefreshTimeRef.current = now;
      refreshAttemptsRef.current += 1;
      
      console.log('[REFRESH] Sending refresh request to API...');
      const response = await refreshTokenApi();
      
      // Подробное логирование успешного обновления
      console.log('[REFRESH] Success! Token refreshed successfully');
      console.log(`[REFRESH] New expiration time: ${new Date(response.expiresAt).toISOString()}`);
      const newTimeUntilExpiry = response.expiresAt - Date.now();
      console.log(`[REFRESH] New time until expiry: ${newTimeUntilExpiry}ms (${Math.round(newTimeUntilExpiry/1000/60)} minutes)`);
      
      // Сброс счетчика попыток при успешном обновлении
      refreshAttemptsRef.current = 0;
      
      // Обновляем пользователя и время истечения токена
      setUser(response.user);
      setExpiresAt(response.expiresAt);
      
      // Schedule next refresh
      scheduleTokenRefresh(response.expiresAt);
    } catch (err: any) {
      console.error('[REFRESH] Failed to refresh token:', err);
      
      // Увеличиваем счетчик попыток, но не редиректим сразу
      // Редирект произойдет при MAX_REFRESH_ATTEMPTS
      if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
        // Handle failed refresh after max attempts - redirect to login
        console.log('[REFRESH] Max retry attempts reached, logging out user');
        setUser(null);
        setExpiresAt(null);
        router.push('/auth/login');
      } else {
        // Если ошибка 429 (rate limiting), делаем более длительную паузу перед следующей попыткой
        const isRateLimited = err instanceof Error && err.message.includes('too frequently');
        const retryDelay = isRateLimited ? 60000 : 5000; // 1 минута или 5 секунд
        
        console.log(`[REFRESH] Will retry token refresh in ${retryDelay/1000} seconds`);
        setTimeout(() => refreshSession(true), retryDelay);
      }
    }
  }, [router, expiresAt]);

  // Schedule token refresh before it expires
  const scheduleTokenRefresh = useCallback((tokenExpiresAt: number) => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    const currentTime = Date.now();
    const timeUntilExpiry = tokenExpiresAt - currentTime;
    
    console.log(`[SCHEDULE] Token expires at: ${new Date(tokenExpiresAt).toISOString()}`);
    console.log(`[SCHEDULE] Current time: ${new Date(currentTime).toISOString()}`);
    console.log(`[SCHEDULE] Time until expiry: ${timeUntilExpiry}ms (${Math.floor(timeUntilExpiry/1000/60)} minutes)`);
    
    // Don't schedule if token is already expired
    if (timeUntilExpiry <= 0) {
      console.log('[SCHEDULE] Token already expired, refreshing immediately');
      // Добавляем небольшую задержку чтобы избежать циклических вызовов
      setTimeout(() => refreshSession(true), 500);
      return;
    }
    
    // Refresh 5 minutes before expiry, or immediately if less than 5 minutes left
    const refreshTime = Math.max(0, timeUntilExpiry - REFRESH_BEFORE_EXPIRY);
    
    console.log(`[SCHEDULE] Will refresh token in ${Math.floor(refreshTime/1000/60)} minutes (${Math.floor(refreshTime/1000)} seconds)`);
    
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('[SCHEDULE] Scheduled refresh time reached, triggering refresh');
      refreshSession(true); // Принудительное обновление по таймауту
    }, refreshTime);
  }, [refreshSession]);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[INIT] Starting authentication initialization');
        const session = await getSession();
        
        if (session) {
          console.log('[INIT] Session found:', session.user.email);
          console.log(`[INIT] Token expires at: ${new Date(session.expiresAt).toISOString()}`);
          const timeUntilExpiry = session.expiresAt - Date.now();
          console.log(`[INIT] Time until expiry: ${timeUntilExpiry}ms (${Math.floor(timeUntilExpiry/1000/60)} minutes)`);
          
          setUser(session.user);
          setExpiresAt(session.expiresAt);
          
          // Initialize last refresh time
          lastRefreshTimeRef.current = Date.now();
          
          // Reset refresh attempts counter
          refreshAttemptsRef.current = 0;
          
          // Проверка, не истек ли токен уже
          if (timeUntilExpiry <= 0) {
            console.log('[INIT] Token already expired during initialization, forcing refresh');
            setTimeout(() => refreshSession(true), 1000);
          } else {
            // Schedule token refresh
            scheduleTokenRefresh(session.expiresAt);
          }
        } else {
          console.log('[INIT] No active session found');
          setUser(null);
          setExpiresAt(null);
        }
        
        initializedRef.current = true;
      } catch (err) {
        console.error('[INIT] Auth initialization error:', err);
        setUser(null);
        setExpiresAt(null);
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
  }, [scheduleTokenRefresh, refreshSession]);

  // Interceptor для автоматического обновления токена при 401 ошибках
  useEffect(() => {
    // Оригинальная fetch функция
    const originalFetch = window.fetch;
    
    // Замена на перехватчик
    window.fetch = async (input, init) => {
      try {
        // Выполняем оригинальный запрос
        const response = await originalFetch(input, init);
        
        // Перехватываем ошибку 401
        if (response.status === 401) {
          // Только для API запросов, не для внешних ресурсов
          let url = '';
          if (typeof input === 'string') {
            url = input;
          } else if (input instanceof URL) {
            url = input.href; // URL объект имеет свойство href
          } else if (input instanceof Request) {
            url = input.url; // Request объект имеет свойство url
          }
          
          if (url.includes('/api/') && user) {
            console.log('[INTERCEPTOR] 401 response intercepted for URL:', url);
            try {
              console.log('[INTERCEPTOR] Attempting to refresh token...');
              // Пытаемся обновить токен
              await refreshSession(true);
              
              // Повторяем оригинальный запрос
              console.log('[INTERCEPTOR] Token refreshed, retrying original request');
              return await originalFetch(input, init);
            } catch (refreshError) {
              console.error('[INTERCEPTOR] Failed to refresh token during 401 handling:', refreshError);
              // Если обновление не удалось, возвращаем исходный ответ с 401
            }
          }
        }
        
        return response;
      } catch (error) {
        console.error('[INTERCEPTOR] Fetch error:', error);
        throw error;
      }
    };
    
    // Восстанавливаем оригинальную функцию при размонтировании
    return () => {
      window.fetch = originalFetch;
    };
  }, [refreshSession, user]);

  // Проверка срока действия токена каждую минуту
  useEffect(() => {
    const checkTokenExpiry = () => {
      if (!expiresAt || !user) return;
      
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Для отладки логируем каждую проверку только в dev режиме
      if (process.env.NODE_ENV === 'development') {
        console.log(`[CHECK] Token expiry check: ${Math.floor(timeUntilExpiry/1000/60)} minutes remaining`);
      }
      
      // Если токен истек или истекает в ближайшие 5 минут и обновление не запланировано
      if (timeUntilExpiry <= REFRESH_BEFORE_EXPIRY && !refreshTimeoutRef.current) {
        console.log('[CHECK] Token expiring soon but no refresh scheduled, scheduling now');
        scheduleTokenRefresh(expiresAt);
      }
    };
    
    // Проверяем каждую минуту
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [expiresAt, user, scheduleTokenRefresh]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[LOGIN] Attempting login for user:', email);
      const response = await loginApi({ email, password });
      
      console.log('[LOGIN] Login successful');
      console.log(`[LOGIN] Token expires at: ${new Date(response.expiresAt).toISOString()}`);
      const timeUntilExpiry = response.expiresAt - Date.now();
      console.log(`[LOGIN] Time until expiry: ${timeUntilExpiry}ms (${Math.floor(timeUntilExpiry/1000/60)} minutes)`);
      
      // Проверяем корректность времени истечения
      if (timeUntilExpiry <= 0) {
        console.error('[LOGIN] WARNING: Token already expired upon login!');
      }
      
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
      console.error('[LOGIN] Login failed:', err);
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
      console.log('[LOGOUT] Logging out user');
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
      console.error('[LOGOUT] Logout error:', err);
      setError(err.message || 'Failed to logout');
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
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 