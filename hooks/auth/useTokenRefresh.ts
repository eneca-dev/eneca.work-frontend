'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { refreshToken as refreshTokenApi } from '@/lib/auth/auth';
import { User } from './types';
import { 
  MIN_REFRESH_INTERVAL, 
  REFRESH_BEFORE_EXPIRY, 
  MAX_REFRESH_ATTEMPTS 
} from './constants';
import logger from '@/lib/logger';

interface UseTokenRefreshProps {
  user: User | null;
  setUser: (user: User | null) => void;
  expiresAt: number | null;
  setExpiresAt: (expiresAt: number | null) => void;
  setError: (error: string | null) => void;
}

/**
 * Хук для управления обновлением токенов
 */
export function useTokenRefresh({
  user,
  setUser,
  expiresAt,
  setExpiresAt,
  setError
}: UseTokenRefreshProps) {
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const refreshAttemptsRef = useRef<number>(0);
  
  /**
   * Планирование обновления токена до истечения
   */
  const scheduleTokenRefresh = useCallback((tokenExpiresAt: number) => {
    // Очищаем предыдущий таймаут
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    const currentTime = Date.now();
    const timeUntilExpiry = tokenExpiresAt - currentTime;
    
    logger.debug('SCHEDULE', `Token expires at: ${new Date(tokenExpiresAt).toISOString()}`);
    logger.debug('SCHEDULE', `Current time: ${new Date(currentTime).toISOString()}`);
    logger.debug('SCHEDULE', `Time until expiry: ${Math.floor(timeUntilExpiry/1000/60)} minutes`);
    
    // Не планируем обновление, если токен уже истек
    if (timeUntilExpiry <= 0) {
      logger.warn('SCHEDULE', 'Token already expired, refreshing immediately');
      // Добавляем небольшую задержку чтобы избежать циклических вызовов
      setTimeout(() => refreshSession(true), 500);
      return;
    }
    
    // Обновляем за 5 минут до истечения или немедленно, если осталось меньше 5 минут
    const refreshTime = Math.max(0, timeUntilExpiry - REFRESH_BEFORE_EXPIRY);
    
    logger.debug('SCHEDULE', `Will refresh token in ${Math.floor(refreshTime/1000/60)} minutes`);
    
    refreshTimeoutRef.current = setTimeout(() => {
      logger.info('SCHEDULE', 'Scheduled refresh time reached, triggering refresh');
      refreshSession(true); // Принудительное обновление по таймауту
    }, refreshTime);
  }, []);
  
  /**
   * Обновление токена
   */
  const refreshSession = useCallback(async (forceRefresh = false) => {
    try {
      // Расширенное логирование
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
      
      logger.debug('REFRESH', `Attempt initiated. Force refresh: ${forceRefresh}`);
      logger.debug('REFRESH', `Time since last refresh: ${Math.round(timeSinceLastRefresh/1000)} seconds`);
      logger.debug('REFRESH', `Current refresh attempts: ${refreshAttemptsRef.current}`);
      
      if (expiresAt) {
        const timeUntilExpiry = expiresAt - now;
        logger.debug('REFRESH', `Token expires at: ${new Date(expiresAt).toISOString()}`);
        logger.debug('REFRESH', `Time until expiry: ${Math.round(timeUntilExpiry/1000/60)} minutes`);
      } else {
        logger.warn('REFRESH', `No expiration time set!`);
      }

      // Предотвращаем слишком частое обновление, если не принудительное
      if (!forceRefresh && timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
        logger.info('REFRESH', 'Skipping - too soon since last refresh');
        
        // Проверка истечения токена, даже если слишком рано для обновления
        if (expiresAt && now >= expiresAt) {
          logger.warn('REFRESH', 'Token has expired but refresh is rate-limited');
          // Планируем повторную попытку через короткий интервал
          setTimeout(() => refreshSession(true), 5000);
        }
        
        return;
      }
      
      // Если превышено количество попыток, сбрасываем счетчик и перенаправляем на логин
      if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
        logger.warn('REFRESH', `Max attempts (${MAX_REFRESH_ATTEMPTS}) reached, redirecting to login`);
        refreshAttemptsRef.current = 0;
        setUser(null);
        setExpiresAt(null);
        router.push('/auth/login');
        return;
      }
      
      // Обновляем время последнего обновления и счетчик попыток
      lastRefreshTimeRef.current = now;
      refreshAttemptsRef.current += 1;
      
      logger.info('REFRESH', 'Sending refresh request to API...');
      const response = await refreshTokenApi();
      
      // Подробное логирование успешного обновления
      logger.info('REFRESH', 'Success! Token refreshed successfully');
      logger.debug('REFRESH', `New expiration time: ${new Date(response.expiresAt).toISOString()}`);
      
      const newTimeUntilExpiry = response.expiresAt - Date.now();
      logger.debug('REFRESH', `New time until expiry: ${Math.round(newTimeUntilExpiry/1000/60)} minutes`);
      
      // Сброс счетчика попыток при успешном обновлении
      refreshAttemptsRef.current = 0;
      
      // Преобразуем пользователя из ответа API
      const responseUser = response.user as any;
      const user: User = {
        id: responseUser.id,
        email: responseUser.email, 
        firstName: responseUser.firstName || '',
        lastName: responseUser.lastName || '',
        role: responseUser.role || 'USER',
        profile: responseUser.profile || {}
      };
      
      // Обновляем пользователя и время истечения токена
      setUser(user);
      setExpiresAt(response.expiresAt);
      
      // Планируем следующее обновление
      scheduleTokenRefresh(response.expiresAt);
    } catch (err: any) {
      logger.error('REFRESH', 'Failed to refresh token:', err);
      
      // Увеличиваем счетчик попыток, но не редиректим сразу
      if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
        // После достижения максимального числа попыток - перенаправляем на логин
        logger.warn('REFRESH', 'Max retry attempts reached, logging out user');
        setUser(null);
        setExpiresAt(null);
        router.push('/auth/login');
      } else {
        // Если ошибка 429 (rate limiting), делаем более длительную паузу
        const isRateLimited = err instanceof Error && err.message.includes('too frequently');
        const retryDelay = isRateLimited ? 60000 : 5000; // 1 минута или 5 секунд
        
        logger.info('REFRESH', `Will retry token refresh in ${retryDelay/1000} seconds`);
        setTimeout(() => refreshSession(true), retryDelay);
      }
    }
  }, [router, expiresAt, setUser, setExpiresAt, scheduleTokenRefresh]);
  
  /**
   * Очистка таймаутов при размонтировании
   */
  const cleanupTimeouts = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  return {
    refreshSession,
    scheduleTokenRefresh,
    cleanupTimeouts,
    refreshTimeoutRef
  };
} 