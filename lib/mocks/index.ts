import { setupMockApi, teardownMockApi } from './mockApi';
import { getCurrentMockUser, setCurrentMockUser, initMockUser } from './data/users';

// Track initialization status
let isInitialized = false;

/**
 * Initialize the entire mock system
 */
export function initMockSystem(): void {
  if (!isMockAuthEnabled() || isInitialized) {
    return;
  }
  
  // Initialize mock user from localStorage
  initMockUser();
  
  // Set up API interception
  setupMockApi();
  
  // Mark as initialized
  isInitialized = true;
  
  // Make the mock system available globally to avoid import cycles
  if (typeof window !== 'undefined') {
    window.__mockSystem = MockSystem;
  }
  
  console.log('[MOCK] Mock system initialized');
}

// Helper function to check if mock auth is enabled
function isMockAuthEnabled(): boolean {
  return typeof window !== 'undefined' && 
         process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
}

/**
 * Public API for the mock system
 */
export const MockSystem = {
  init: initMockSystem,
  teardown: teardownMockApi,
  getCurrentUser: getCurrentMockUser,
  setCurrentUser: setCurrentMockUser,
  isInitialized: () => isInitialized
};

// TypeScript: add global properties to Window interface
declare global {
  interface Window {
    __mockSystemInitialized?: boolean;
    __mockSystem?: typeof MockSystem;
  }
}

export default MockSystem; 