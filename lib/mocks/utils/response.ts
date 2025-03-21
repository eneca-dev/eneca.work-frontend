import { ApiResponse } from '../types';
import { delay } from './delay';

// Default configuration
const mockDelayMin = parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MIN || '50', 10);
const mockDelayMax = parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MAX || '300', 10);
const mockErrorRate = parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_RATE || '0');

const defaultConfig = {
  delay: [mockDelayMin, mockDelayMax] as [number, number],
  errorRate: mockErrorRate
};

/**
 * Creates a simulated API response with optional delay and error probability
 */
export async function createResponse<T>(
  data: T,
  config: {
    status?: number;
    delay?: number | [number, number];
    errorRate?: number;
    errorMessage?: string;
  } = {}
): Promise<Response> {
  // Merge with default configuration
  const { 
    status = 200, 
    delay: delayConfig = defaultConfig.delay,
    errorRate = defaultConfig.errorRate,
    errorMessage = 'Something went wrong'
  } = config;
  
  // Simulate network delay
  await delay(delayConfig);
  
  // Simulate random error
  if (errorRate > 0 && Math.random() < errorRate) {
    return new Response(
      JSON.stringify({ error: { message: errorMessage } }),
      { status: 500 }
    );
  }
  
  // Create successful response
  const responseBody: ApiResponse<T> = {
    data,
    status
  };
  
  return new Response(
    JSON.stringify(responseBody),
    { 
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// Standard responses for common cases
export function notFound(message = 'Resource not found'): Response {
  return new Response(
    JSON.stringify({ error: { message, code: 'NOT_FOUND' } }),
    { status: 404 }
  );
}

export function unauthorized(message = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({ error: { message, code: 'UNAUTHORIZED' } }),
    { status: 401 }
  );
}

export function badRequest(message = 'Bad request'): Response {
  return new Response(
    JSON.stringify({ error: { message, code: 'BAD_REQUEST' } }),
    { status: 400 }
  );
} 