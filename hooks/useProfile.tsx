import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfile, updateUserProfile } from '@/lib/api/profile';
import { UserProfile } from './auth/types';
import { useToast } from './use-toast';

export function useProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Запрос на получение профиля
  const { 
    data: profile, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 минут до устаревания данных
    retry: 2, // Повторять запрос 2 раза при ошибке
  });

  // Мутация для обновления профиля
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onMutate: async (newProfile) => {
      setIsUpdating(true);
      
      // Оптимистичное обновление
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previousProfile = queryClient.getQueryData<UserProfile>(['profile']);
      
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(['profile'], {
          ...previousProfile,
          ...newProfile,
        });
      }
      
      return { previousProfile };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      toast({
        title: 'Профиль обновлен',
        description: 'Ваш профиль успешно обновлен',
        variant: 'default',
      });
    },
    onError: (error: Error, _, context) => {
      // При ошибке восстанавливаем предыдущие данные
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
      
      toast({
        title: 'Ошибка обновления профиля',
        description: error.message || 'Произошла ошибка при обновлении профиля',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsUpdating(false);
      // Обновляем данные после завершения мутации
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const updateProfile = (profileData: Partial<UserProfile>) => {
    updateProfileMutation.mutate(profileData);
  };

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    updateProfile,
    refetch,
  };
} 