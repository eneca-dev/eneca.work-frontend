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

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Login user with credentials
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`/api/auth/login`, {
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
 * Register new user
 */
export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  const response = await fetch(`/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to register');
  }

  // Save email for potential resend
  localStorage.setItem("registerEmail", credentials.email);
  
  return response.json();
}

/**
 * Resend confirmation email
 */
export async function resendConfirmation(email: string): Promise<void> {
  const response = await fetch(`/api/auth/resend-confirmation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to resend confirmation');
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const response = await fetch(`/api/auth/logout`, {
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
  const response = await fetch(`/api/auth/refresh`, {
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
    const response = await fetch(`/api/auth/session`, {
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