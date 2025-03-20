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
 * Выполнение запроса к API с обработкой ошибок
 */
async function fetchWithErrorHandling(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Пытаемся получить сообщение об ошибке из JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      } catch (jsonError) {
        // Если не удалось разобрать JSON, используем статус
        throw new Error(`Request failed with status ${response.status}`);
      }
    }
    
    return response;
  } catch (error) {
    // Улучшаем сообщение об ошибке для сетевых проблем
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error:', error);
      throw new Error('Network error: Cannot connect to server. Please check your internet connection and try again.');
    }
    
    throw error;
  }
}

/**
 * Login user with credentials
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetchWithErrorHandling(`/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include', // Important for cookies
  });

  return response.json();
}

/**
 * Register new user
 */
export async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  const response = await fetchWithErrorHandling(`/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  // Save email for potential resend
  localStorage.setItem("registerEmail", credentials.email);
  
  return response.json();
}

/**
 * Resend confirmation email
 */
export async function resendConfirmation(email: string): Promise<void> {
  const response = await fetchWithErrorHandling(`/api/auth/resend-confirmation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
    credentials: 'include',
  });

  await response.json(); // Только для проверки, что ответ получен
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await fetchWithErrorHandling(`/api/auth/logout`, {
    method: 'POST',
    credentials: 'include', // Important for cookies
  });
}

/**
 * Refresh authentication token
 */
export async function refreshToken(): Promise<LoginResponse> {
  const response = await fetchWithErrorHandling(`/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // Important for cookies
  });

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

    // Если ответ не 2xx, возвращаем null (нет активной сессии)
    if (!response.ok) {
      console.warn(`Session check failed with status ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
} 