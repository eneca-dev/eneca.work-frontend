'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';
import { defaultMockUser, isMockAuthEnabled } from '../constants';
import logger from '@/lib/logger';

interface UseMockAuthProps {
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setExpiresAt: (expiresAt: number | null) => void;
  setError: (error: string | null) => void;
}

/**
 * Хук для работы с мок-авторизацией
 */
export function useMockAuth({ 
  setUser, 
  setIsLoading, 
  setExpiresAt,
  setError 
}: UseMockAuthProps) {
  const router = useRouter();
  
  /**
   * Получение текущего мок-пользователя
   */
  const getMockUser = useCallback((): User => {
    if (typeof window !== 'undefined' && window.__mockSystem) {
      try {
        // Получаем мок-пользователя из системы
        const mockUserRaw = window.__mockSystem.getCurrentUser();
        
        // Используем промежуточную типизацию
        const mockUser = mockUserRaw as any;
        
        // Преобразуем в наш интерфейс User
        return {
          id: mockUser?.id || defaultMockUser.id,
          email: mockUser?.email || defaultMockUser.email,
          firstName: mockUser?.firstName || defaultMockUser.firstName,
          lastName: mockUser?.lastName || defaultMockUser.lastName,
          role: mockUser?.role || defaultMockUser.role,
          profile: mockUser?.profile || {}
        };
      } catch (error) {
        logger.error('MOCK', 'Error getting mock user:', error);
        return defaultMockUser;
      }
    }
    
    return defaultMockUser;
  }, []);
  
  /**
   * Инициализация мок-аутентификации
   */
  const initMockAuth = useCallback(() => {
    logger.info('MOCK', 'Initializing mock authentication');
    
    try {
      // Set mock expiry time (1 hour from now)
      const mockExpiresAt = Date.now() + 60 * 60 * 1000;
      const mockUser = getMockUser();
      
      setUser(mockUser);
      setExpiresAt(mockExpiresAt);
      setIsLoading(false);
    } catch (error) {
      logger.error('MOCK', 'Error initializing mock authentication:', error);
      setIsLoading(false);
    }
  }, [getMockUser, setExpiresAt, setIsLoading, setUser]);
  
  // Initialize mock auth on mount
  useEffect(() => {
    if (isMockAuthEnabled) {
      initMockAuth();
    }
  }, [initMockAuth]);
  
  /**
   * Мок-логин
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    logger.info('MOCK', 'Logging in with mock credentials');
    
    try {
      // Set mock expiry time (1 hour from now)
      const mockExpiresAt = Date.now() + 60 * 60 * 1000;
      const mockUser = getMockUser();
      
      setUser(mockUser);
      setExpiresAt(mockExpiresAt);
      router.push('/dashboard');
    } catch (error: any) {
      logger.error('MOCK', 'Login failed:', error);
      setError(error.message || 'Failed to login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getMockUser, router, setError, setExpiresAt, setIsLoading, setUser]);
  
  /**
   * Мок-логаут
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    logger.info('MOCK', 'Logging out mock user');
    
    try {
      setUser(null);
      setExpiresAt(null);
      router.push('/auth/login');
    } catch (error: any) {
      logger.error('MOCK', 'Logout error:', error);
      setError(error.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  }, [router, setError, setExpiresAt, setIsLoading, setUser]);
  
  /**
   * Обновление мок-сессии
   */
  const refreshSession = useCallback(async (forceRefresh = false) => {
    logger.info('MOCK', 'Refreshing mock session');
    
    // Set mock expiry time (1 hour from now)
    const mockExpiresAt = Date.now() + 60 * 60 * 1000;
    const mockUser = getMockUser();
    
    setUser(mockUser);
    setExpiresAt(mockExpiresAt);
  }, [getMockUser, setExpiresAt, setUser]);
  
  return { 
    getMockUser, 
    login, 
    logout,
    refreshSession
  };
} 