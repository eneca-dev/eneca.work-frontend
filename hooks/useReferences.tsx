import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDepartments, fetchTeams, fetchPositions, fetchCategories } from '@/lib/api/references';

export function useReferences() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(undefined);

  // Запрос на получение списка отделов
  const { 
    data: departments, 
    isLoading: isDepartmentsLoading,
    error: departmentsError 
  } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 30 * 60 * 1000, // 30 минут до устаревания данных
  });

  // Запрос на получение списка команд
  const { 
    data: teams, 
    isLoading: isTeamsLoading,
    error: teamsError,
    refetch: refetchTeams
  } = useQuery({
    queryKey: ['teams', selectedDepartmentId],
    queryFn: () => fetchTeams(selectedDepartmentId),
    staleTime: 30 * 60 * 1000, // 30 минут до устаревания данных
    enabled: true, // Запускаем запрос независимо от наличия departmentId
  });

  // Запрос на получение списка должностей
  const { 
    data: positions, 
    isLoading: isPositionsLoading,
    error: positionsError 
  } = useQuery({
    queryKey: ['positions'],
    queryFn: fetchPositions,
    staleTime: 30 * 60 * 1000, // 30 минут до устаревания данных
  });

  // Запрос на получение списка категорий
  const { 
    data: categories, 
    isLoading: isCategoriesLoading,
    error: categoriesError 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 30 * 60 * 1000, // 30 минут до устаревания данных
  });

  const isLoading = isDepartmentsLoading || isTeamsLoading || isPositionsLoading || isCategoriesLoading;
  const error = departmentsError || teamsError || positionsError || categoriesError;

  // Обновление выбранного отдела и перезагрузка списка команд
  const updateSelectedDepartment = (departmentId: string | undefined) => {
    setSelectedDepartmentId(departmentId);
    // Если изменился отдел, обновляем список команд
    if (departmentId !== selectedDepartmentId) {
      refetchTeams();
    }
  };

  return {
    departments: departments || [],
    teams: teams || [],
    positions: positions || [],
    categories: categories || [],
    isLoading,
    error,
    selectedDepartmentId,
    updateSelectedDepartment,
  };
} 