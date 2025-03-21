// Check if mock authentication mode is enabled
export const isMockAuthEnabled = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

// Default mock user as fallback
export const defaultMockUser = {
  id: 'default-mock-user',
  email: 'default@mock.user',
  firstName: 'Default',
  lastName: 'User',
  role: 'USER'
};

// Minimum interval between token refreshes (1 minute)
export const MIN_REFRESH_INTERVAL = 60 * 1000;

// Time before expiry to refresh token (5 minutes in ms)
export const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000;

// Maximum attempts to refresh token before redirecting to login
export const MAX_REFRESH_ATTEMPTS = 3; 