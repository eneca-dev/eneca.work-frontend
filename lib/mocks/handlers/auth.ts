import { getCurrentMockUser } from '../data/users';
import { createResponse, unauthorized } from '../utils/response';

/**
 * Handle login request
 */
export async function handleLogin(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    if (!options.body) {
      return unauthorized('No credentials provided');
    }
    
    const body = JSON.parse(options.body as string);
    const { email, password } = body;
    
    // Simple check (in a real app there would be more complex logic)
    if (email && password) {
      const user = getCurrentMockUser();
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
      
      return createResponse({
        user,
        expiresAt
      });
    }
    
    return unauthorized('Invalid credentials');
  } catch (error) {
    console.error('[MOCK] Error in login handler:', error);
    return unauthorized('Invalid request format');
  }
}

/**
 * Handle session request
 */
export async function handleSession(): Promise<Response> {
  const user = getCurrentMockUser();
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return createResponse({
    user,
    expiresAt
  });
}

/**
 * Handle token refresh request
 */
export async function handleRefreshToken(): Promise<Response> {
  const user = getCurrentMockUser();
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return createResponse({
    user,
    expiresAt
  });
}

/**
 * Handle logout request
 */
export async function handleLogout(): Promise<Response> {
  return createResponse({ success: true });
} 