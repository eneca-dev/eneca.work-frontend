'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginApi, logout as logoutApi } from '@/lib/auth/auth';
import { User } from './types';
import logger from '@/lib/logger';

interface UseRealAuthProps {
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setExpiresAt: (expiresAt: number | null) => void;
  refreshSession: (forceRefresh: boolean) => Promise<void>;
  scheduleTokenRefresh: (expiresAt: number) => void;
  cleanupTimeouts: () => void;
}

/**
 * Хук для работы с реальной аутентификацией
 */
export function useRealAuth({
  setUser,
  setIsLoading,
  setError,
  setExpiresAt,
  refreshSession,
  scheduleTokenRefresh,
  cleanupTimeouts
}: UseRealAuthProps) {
  const router = useRouter();
  
  /**
   * Реальный логин через API
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('LOGIN', `Attempting login for user: ${email}`);
      const response = await loginApi({ email, password });
      
      logger.info('LOGIN', 'Login successful');
      logger.debug('LOGIN', `Token expires at: ${new Date(response.expiresAt).toISOString()}`);
      
      const timeUntilExpiry = response.expiresAt - Date.now();
      logger.debug('LOGIN', `Time until expiry: ${Math.floor(timeUntilExpiry/1000/60)} minutes`);
      
      // Проверяем корректность времени истечения
      if (timeUntilExpiry <= 0) {
        logger.error('LOGIN', 'WARNING: Token already expired upon login!');
      }
      
      // Используем промежуточную типизацию, чтобы безопасно обработать данные от API
      const apiUser = response.user as any;
      
      // Затем преобразуем в наш интерфейс User с проверками на undefined
      const user: User = {
        id: apiUser.id,
        email: apiUser.email,
        profile: apiUser.profile || {},
        firstName: apiUser.firstName || '',
        lastName: apiUser.lastName || '',
        role: apiUser.role || 'USER'
      };
      
      setUser(user);
      setExpiresAt(response.expiresAt);
      
      // Планируем обновление токена
      scheduleTokenRefresh(response.expiresAt);
      
      router.push('/dashboard'); // Редирект на дашборд после логина
    } catch (err: any) {
      logger.error('LOGIN', 'Login failed:', err);
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, scheduleTokenRefresh, setError, setExpiresAt, setIsLoading, setUser]);
  
  /**
   * Реальный логаут через API
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      logger.info('LOGOUT', 'Logging out user');
      await logoutApi();
      
      setUser(null);
      setExpiresAt(null);
      
      // Очищаем запланированные обновления токена
      cleanupTimeouts();
      
      router.push('/auth/login'); // Редирект на страницу логина после выхода
    } catch (err: any) {
      logger.error('LOGOUT', 'Logout error:', err);
      setError(err.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  }, [cleanupTimeouts, router, setError, setExpiresAt, setIsLoading, setUser]);
  
  return {
    login,
    logout
  };
} 