import { UserProfile } from '@/hooks/auth/types';
import { mockUserProfile } from './mock-data';

// Флаг для использования mock данных во время разработки
const useMockData = process.env.NODE_ENV === 'development';

/**
 * Получение профиля пользователя
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  // В режиме разработки возвращаем mock данные
  if (useMockData) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUserProfile;
  }

  const response = await fetch('/api/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка при получении профиля');
  }

  return await response.json();
}

/**
 * Обновление профиля пользователя
 */
export async function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
  // В режиме разработки возвращаем обновленные mock данные
  if (useMockData) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Объединяем существующие данные с новыми
    const updatedProfile = {
      ...mockUserProfile,
      ...profileData,
    };
    
    // Обновляем соответствующие связанные данные
    if (profileData.department_id && profileData.department_id !== mockUserProfile.department_id) {
      updatedProfile.departments = {
        department_id: profileData.department_id,
        department_name: `Department ${profileData.department_id}`, // Упрощенно
      };
    }
    
    return updatedProfile;
  }

  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка при обновлении профиля');
  }

  return await response.json();
} 