export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  team_id: string;
  position_id: string;
  category_id: string;
  role_id: string;
  role?: string;
  permissions?: string;
  created_at: string;
  // Добавляем связанные данные
  departments?: {
    department_id: string;
    department_name: string;
  };
  teams?: {
    team_id: string;
    team_name: string;
  };
  positions?: {
    position_id: string;
    position_name: string;
  };
  categories?: {
    category_id: string;
    category_name: string;
  };
}

export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  refreshSession: (forceRefresh?: boolean) => Promise<void>;
}

export interface SessionData {
  user: User;
  expiresAt: number;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

// Типы для работы со справочниками
export interface Department {
  department_id: string;
  department_name: string;
}

export interface Team {
  team_id: string;
  team_name: string;
  department_id: string;
}

export interface Position {
  position_id: string;
  position_name: string;
}

export interface Category {
  category_id: string;
  category_name: string;
} 