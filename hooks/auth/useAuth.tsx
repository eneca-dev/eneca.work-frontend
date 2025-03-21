'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import { useMockAuth } from './mock';
import { useSession } from './useSession';
import { useTokenRefresh } from './useTokenRefresh';
import { useFetchInterceptor } from './useFetchInterceptor';
import { useRealAuth } from './useRealAuth';
import { User, AuthContextType, AuthProviderProps } from './types';
import { isMockAuthEnabled } from './constants';
import logger from '@/lib/logger';

// Создаем контекст аутентификации
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Провайдер аутентификации
 * Управляет состоянием пользователя и предоставляет методы для работы с аутентификацией
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Получаем состояние и методы для работы с сессией
  const { 
    expiresAt, 
    setExpiresAt 
  } = useSession({ 
    user, 
    setUser, 
    setIsLoading 
  });
  
  // Получаем методы для работы с обновлением токенов
  const { 
    refreshSession: tokenRefreshSession, 
    scheduleTokenRefresh,
    cleanupTimeouts
  } = useTokenRefresh({
    user,
    setUser,
    expiresAt,
    setExpiresAt,
    setError
  });
  
  // Определяем механизм аутентификации в зависимости от режима
  const mockAuth = useMockAuth({ 
    setUser, 
    setIsLoading, 
    setExpiresAt, 
    setError 
  });
  
  const realAuth = useRealAuth({
    setUser,
    setIsLoading,
    setError,
    setExpiresAt,
    refreshSession: tokenRefreshSession,
    scheduleTokenRefresh,
    cleanupTimeouts
  });
  
  // Выбираем подходящие реализации в зависимости от режима
  const { login, logout } = isMockAuthEnabled ? mockAuth : realAuth;
  
  // Выбираем подходящую реализацию refreshSession
  const refreshSession = isMockAuthEnabled 
    ? mockAuth.refreshSession 
    : tokenRefreshSession;
  
  // Устанавливаем перехватчик для 401 ошибок
  useFetchInterceptor({ user, refreshSession });
  
  // Проверка срока действия токена каждую минуту
  useEffect(() => {
    // Пропускаем в режиме моков
    if (isMockAuthEnabled) return;
    
    const checkTokenExpiry = () => {
      if (!expiresAt || !user) return;
      
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Для отладки логируем в dev режиме
      if (process.env.NODE_ENV === 'development') {
        logger.debug('CHECK', `Token expiry check: ${Math.floor(timeUntilExpiry/1000/60)} minutes remaining`);
      }
      
      // Если токен истекает скоро и обновление не запланировано
      if (timeUntilExpiry <= 300000 && !tokenRefreshSession) {
        logger.warn('CHECK', 'Token expiring soon but no refresh scheduled, scheduling now');
        scheduleTokenRefresh(expiresAt);
      }
    };
    
    // Проверяем каждую минуту
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [expiresAt, isMockAuthEnabled, scheduleTokenRefresh, tokenRefreshSession, user]);
  
  // Очистка таймаутов при размонтировании
  useEffect(() => {
    return () => {
      cleanupTimeouts();
    };
  }, [cleanupTimeouts]);
  
  // Предоставляем контекст аутентификации дочерним компонентам
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      error, 
      refreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Хук для использования контекста аутентификации
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 