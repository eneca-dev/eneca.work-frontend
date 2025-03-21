export interface User {
  id: string;
  email: string;
  profile?: any;
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