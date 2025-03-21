'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth/auth';
import { User, SessionData } from './types';
import { isMockAuthEnabled } from './constants';
import logger from '@/lib/logger';

interface UseSessionProps {
  user: User | null;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  refreshSession?: (forceRefresh: boolean) => Promise<void>;
  scheduleTokenRefresh?: (expiresAt: number) => void;
}

/**
 * Хук для управления сессией пользователя
 */
export function useSession({ 
  user, 
  setUser, 
  setIsLoading,
  refreshSession,
  scheduleTokenRefresh
}: UseSessionProps) {
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const router = useRouter();
  const initializedRef = useRef<boolean>(false);
  const lastSessionCheckRef = useRef<number>(0);
  const callCountRef = useRef<number>(0);
  const prevUserRef = useRef<User | null>(null);

  /**
   * Сравнение пользователей для определения изменений
   */
  const areUsersEqual = useCallback((user1: User | null, user2: User | null): boolean => {
    if (user1 === user2) return true;
    if (!user1 || !user2) return false;
    return user1.id === user2.id && user1.email === user2.email;
  }, []);

  /**
   * Инициализация сессии при загрузке компонента
   */
  useEffect(() => {
    // Предотвращение бесконечных циклов
    callCountRef.current += 1;
    if (callCountRef.current > 3) {
      logger.error('INIT', 'Detected potential infinite loop in authentication initialization');
      setIsLoading(false);
      return;
    }

    const initSession = async () => {
      // Пропускаем для мок-режима, эта логика будет в useMockAuth
      if (isMockAuthEnabled) {
        // Make sure we set isLoading to false for mock mode
        setIsLoading(false);
        return;
      }
      
      try {
        // Проверяем только если прошло больше 10 секунд с последней проверки
        const now = Date.now();
        const timeSinceLastCheck = now - lastSessionCheckRef.current;
        
        // Пропускаем, если пользователь уже загружен и проверка была недавно
        if (user && timeSinceLastCheck < 10000) {
          logger.info('INIT', 'Skipping redundant session check - user already loaded');
          setIsLoading(false);
          return;
        }
        
        // Пропускаем, если уже инициализировано и проверка была недавно
        if (initializedRef.current && timeSinceLastCheck < 10000) {
          logger.info('INIT', 'Skipping redundant initialization - recent check performed');
          setIsLoading(false);
          return;
        }
        
        // Обновляем время последней проверки
        lastSessionCheckRef.current = now;
        
        logger.info('INIT', 'Starting authentication initialization');
        const session = await getSession();
        
        if (session) {
          logger.info('INIT', `Session found: ${session.user.email}`);
          logger.debug('INIT', `Token expires at: ${new Date(session.expiresAt).toISOString()}`);
          
          const timeUntilExpiry = session.expiresAt - Date.now();
          logger.debug('INIT', `Time until expiry: ${Math.floor(timeUntilExpiry/1000/60)} minutes`);
          
          // Преобразуем user из сессии в наш интерфейс User
          const sessionUser = session.user as any;
          const userObj: User = {
            id: sessionUser.id,
            email: sessionUser.email,
            firstName: sessionUser.firstName || '',
            lastName: sessionUser.lastName || '',
            role: sessionUser.role || 'USER',
            profile: sessionUser.profile || {}
          };
          
          setUser(userObj);
          setExpiresAt(session.expiresAt);
          
          // Проверяем, не истек ли токен
          if (timeUntilExpiry <= 0) {
            logger.warn('INIT', 'Token already expired during initialization, forcing refresh');
            refreshSession && setTimeout(() => refreshSession(true), 1000);
          } else if (scheduleTokenRefresh) {
            // Планируем обновление токена
            scheduleTokenRefresh(session.expiresAt);
          }
        } else {
          logger.info('INIT', 'No active session found');
          setUser(null);
          setExpiresAt(null);
        }
        
        initializedRef.current = true;
      } catch (err) {
        logger.error('INIT', 'Auth initialization error:', err);
        setUser(null);
        setExpiresAt(null);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [refreshSession, scheduleTokenRefresh, setIsLoading, setUser, user]);

  return {
    expiresAt,
    setExpiresAt,
    areUsersEqual,
    prevUserRef
  };
} 