'use client';

import { useEffect } from 'react';
import { User } from './types';
import logger from '@/lib/logger';

interface UseFetchInterceptorProps {
  user: User | null;
  refreshSession: (forceRefresh: boolean) => Promise<void>;
}

/**
 * Хук для перехвата 401 ошибок и автоматического обновления токена
 */
export function useFetchInterceptor({ 
  user, 
  refreshSession 
}: UseFetchInterceptorProps) {
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
            url = input.href;
          } else if (input instanceof Request) {
            url = input.url;
          }
          
          if (url.includes('/api/') && user) {
            logger.info('INTERCEPTOR', `401 response intercepted for URL: ${url}`);
            try {
              logger.info('INTERCEPTOR', 'Attempting to refresh token...');
              // Пытаемся обновить токен
              await refreshSession(true);
              
              // Повторяем оригинальный запрос
              logger.info('INTERCEPTOR', 'Token refreshed, retrying original request');
              return await originalFetch(input, init);
            } catch (refreshError) {
              logger.error('INTERCEPTOR', 'Failed to refresh token during 401 handling:', refreshError);
              // Если обновление не удалось, возвращаем исходный ответ с 401
            }
          }
        }
        
        return response;
      } catch (error) {
        logger.error('INTERCEPTOR', 'Fetch error:', error);
        throw error;
      }
    };
    
    // Восстанавливаем оригинальную функцию при размонтировании
    return () => {
      window.fetch = originalFetch;
    };
  }, [refreshSession, user]);
} 