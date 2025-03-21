'use client';

import { useEffect, useRef } from 'react';

export function MockSystemInitializer() {
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Skip if already initialized in this component instance
    if (hasInitialized.current) {
      return;
    }
    
    // Skip if mock auth is disabled
    if (process.env.NEXT_PUBLIC_MOCK_AUTH !== 'true') {
      return;
    }
    
    // Skip if already initialized globally (via window)
    if (typeof window !== 'undefined' && window.__mockSystem?.isInitialized()) {
      hasInitialized.current = true;
      return;
    }

    async function initializeMockSystem() {
      try {
        // Dynamically import the mock system
        const module = await import('@/lib/mocks');
        
        // Initialize the mock system (this adds it to window.__mockSystem)
        module.default.init();
        
        // Mark as initialized in this component instance
        hasInitialized.current = true;
      } catch (error) {
        console.error('[MOCK] Error initializing mock system:', error);
      }
    }

    initializeMockSystem();
    
    // No need for cleanup as initialization should be preserved
  }, []); // Empty dependency array ensures this runs once

  return null; // This component doesn't render anything
} 