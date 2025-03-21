import { MockUser } from '../types';

// Dictionary of mock users
export const mockUsers: Record<string, MockUser> = {
  admin: {
    id: 'mock-admin-id',
    email: 'admin@example.com',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      permissions: ['read', 'write', 'admin', 'delete'],
      settings: {
        theme: 'dark',
        notifications: true
      }
    },
    subscription: {
      plan: 'enterprise',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  developer: {
    id: 'mock-dev-id',
    email: 'dev@example.com',
    profile: {
      firstName: 'Developer',
      lastName: 'User',
      role: 'developer',
      permissions: ['read', 'write'],
      settings: {
        theme: 'light',
        notifications: true
      }
    },
    subscription: {
      plan: 'pro',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  user: {
    id: 'mock-user-id',
    email: 'user@example.com',
    profile: {
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      permissions: ['read'],
      settings: {
        theme: 'system',
        notifications: false
      }
    },
    subscription: {
      plan: 'free',
      expiresAt: null
    }
  }
};

// Current active user (default admin)
let currentMockUser = 'admin';

// Functions to manage mock user
export function getCurrentMockUser(): MockUser {
  return { ...mockUsers[currentMockUser] };
}

export function setCurrentMockUser(userType: string): void {
  if (mockUsers[userType]) {
    currentMockUser = userType;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockUserType', userType);
    }
  } else {
    console.error(`[MOCK] Unknown user type: ${userType}`);
  }
}

// Initialize from localStorage if possible
export function initMockUser(): void {
  if (typeof window !== 'undefined') {
    const storedType = localStorage.getItem('mockUserType');
    if (storedType && mockUsers[storedType]) {
      currentMockUser = storedType;
    }
  }
} 