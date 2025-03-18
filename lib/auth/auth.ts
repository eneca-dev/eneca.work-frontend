// Auth utility functions for handling login and authentication

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  profile?: any;
}

interface LoginResponse {
  user: User;
  expiresAt: number;
}

/**
 * Login user with credentials
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include', // Important for cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to login');
  }

  return response.json();
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // Important for cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to logout');
  }
}

/**
 * Refresh authentication token
 */
export async function refreshToken(): Promise<LoginResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // Important for cookies
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
}

/**
 * Get current session (to be used on page load or app initialization)
 */
export async function getSession(): Promise<LoginResponse | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/session`, {
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
} 