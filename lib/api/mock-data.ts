import { Department, Team, Position, Category, UserProfile } from '@/hooks/auth/types';

// Mock данные для отдела
export const mockDepartments: Department[] = [
  { department_id: '1', department_name: 'Разработка' },
  { department_id: '2', department_name: 'Маркетинг' },
  { department_id: '3', department_name: 'Продажи' },
  { department_id: '4', department_name: 'Управление персоналом' },
];

// Mock данные для команд
export const mockTeams: Team[] = [
  { team_id: '1', team_name: 'Frontend', department_id: '1' },
  { team_id: '2', team_name: 'Backend', department_id: '1' },
  { team_id: '3', team_name: 'DevOps', department_id: '1' },
  { team_id: '4', team_name: 'Дизайн', department_id: '2' },
  { team_id: '5', team_name: 'SMM', department_id: '2' },
  { team_id: '6', team_name: 'B2B продажи', department_id: '3' },
  { team_id: '7', team_name: 'B2C продажи', department_id: '3' },
  { team_id: '8', team_name: 'Рекрутинг', department_id: '4' },
];

// Mock данные для должностей
export const mockPositions: Position[] = [
  { position_id: '1', position_name: 'Разработчик' },
  { position_id: '2', position_name: 'Старший разработчик' },
  { position_id: '3', position_name: 'Тимлид' },
  { position_id: '4', position_name: 'Менеджер проекта' },
  { position_id: '5', position_name: 'Дизайнер' },
  { position_id: '6', position_name: 'Менеджер по продажам' },
  { position_id: '7', position_name: 'HR-специалист' },
];

// Mock данные для категорий
export const mockCategories: Category[] = [
  { category_id: '1', category_name: 'Junior' },
  { category_id: '2', category_name: 'Middle' },
  { category_id: '3', category_name: 'Senior' },
  { category_id: '4', category_name: 'Lead' },
];

// Mock профиль пользователя
export const mockUserProfile: UserProfile = {
  user_id: '1',
  first_name: 'Иван',
  last_name: 'Петров',
  email: 'ivan.petrov@example.com',
  department_id: '1',
  team_id: '1',
  position_id: '2',
  category_id: '3',
  role_id: '1',
  role: 'Пользователь',
  permissions: 'Базовые разрешения',
  created_at: '2023-01-01T00:00:00Z',
  departments: {
    department_id: '1',
    department_name: 'Разработка'
  },
  teams: {
    team_id: '1',
    team_name: 'Frontend'
  },
  positions: {
    position_id: '2',
    position_name: 'Старший разработчик'
  },
  categories: {
    category_id: '3',
    category_name: 'Senior'
  }
}; 