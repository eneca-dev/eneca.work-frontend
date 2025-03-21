// Types for mock system

export interface MockUser {
  id: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    role?: string;
    permissions?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface MockProject {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  status: number;
}

export type RequestHandler = (url: string, options?: RequestInit) => Promise<Response>;

export type MockConfig = {
  delay?: number | [number, number]; // fixed delay or range [min, max]
  errorRate?: number; // error probability (0-1)
}; 