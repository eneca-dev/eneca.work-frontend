import { handleLogin, handleSession, handleRefreshToken, handleLogout } from './handlers/auth';
import { handleGetProjects, handleGetProject } from './handlers/projects';

// Initialization flag to prevent intercepting twice
let initialized = false;

/**
 * Set up the mock API by intercepting fetch requests
 */
export function setupMockApi(): void {
  // Guard against multiple initialization or server-side
  if (initialized || typeof window === 'undefined') {
    return;
  }
  
  // Save the original fetch
  const originalFetch = window.fetch;
  
  // Override global fetch
  window.fetch = async function(input, init): Promise<Response> {
    const url = typeof input === 'string' ? input : input.url;
    const options = init || {};
    
    // Log request if debug mode enabled
    if (process.env.NEXT_PUBLIC_MOCK_DEBUG === 'true') {
      console.log(`[MOCK] Request: ${options.method || 'GET'} ${url}`);
    }
    
    // Handle authentication endpoints
    if (url.includes('/api/auth/login')) {
      return handleLogin(url, options);
    }
    
    if (url.includes('/api/auth/session')) {
      return handleSession();
    }
    
    if (url.includes('/api/auth/refresh')) {
      return handleRefreshToken();
    }
    
    if (url.includes('/api/auth/logout')) {
      return handleLogout();
    }
    
    // Handle project endpoints
    if (url.match(/\/api\/projects\/[^\/]+$/)) {
      return handleGetProject(url);
    }
    
    if (url.includes('/api/projects')) {
      return handleGetProjects();
    }
    
    // If no mock handler is found, use original fetch
    return originalFetch(input, init);
  };
  
  initialized = true;
  console.log('[MOCK] Mock API initialized');
}

/**
 * Tear down the mock API and restore original fetch
 */
export function teardownMockApi(): void {
  if (!initialized || typeof window === 'undefined') {
    return;
  }
  
  // Restore original fetch if it was intercepted
  const originalFetch = window.fetch;
  
  if (originalFetch && originalFetch.toString().includes('[MOCK]')) {
    window.fetch = originalFetch;
    initialized = false;
    console.log('[MOCK] Mock API disabled');
  }
} 