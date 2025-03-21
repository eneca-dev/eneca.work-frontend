import { Department, Team, Position, Category } from '@/hooks/auth/types';
import { mockDepartments, mockTeams, mockPositions, mockCategories } from './mock-data';

// Флаг для использования mock данных во время разработки
const useMockData = process.env.NODE_ENV === 'development';

/**
 * Получение списка отделов
 */
export async function fetchDepartments(): Promise<Department[]> {
  // В режиме разработки возвращаем mock данные
  if (useMockData) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockDepartments;
  }

  const response = await fetch('/api/references/departments', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка при получении списка отделов');
  }

  return await response.json();
}

/**
 * Получение списка команд (опционально фильтрация по отделу)
 */
export async function fetchTeams(departmentId?: string): Promise<Team[]> {
  // В режиме разработки возвращаем mock данные
  if (useMockData) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Если передан departmentId, фильтруем команды
    if (departmentId) {
      return mockTeams.filter(team => team.department_id === departmentId);
    }
    
    return mockTeams;
  }

  const url = departmentId 
    ? `/api/references/teams?department_id=${departmentId}` 
    : '/api/references/teams';
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка при получении списка команд');
  }

  return await response.json();
}

/**
 * Получение списка должностей
 */
export async function fetchPositions(): Promise<Position[]> {
  // В режиме разработки возвращаем mock данные
  if (useMockData) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockPositions;
  }

  const response = await fetch('/api/references/positions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка при получении списка должностей');
  }

  return await response.json();
}

/**
 * Получение списка категорий
 */
export async function fetchCategories(): Promise<Category[]> {
  // В режиме разработки возвращаем mock данные
  if (useMockData) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCategories;
  }

  const response = await fetch('/api/references/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка при получении списка категорий');
  }

  return await response.json();
} 