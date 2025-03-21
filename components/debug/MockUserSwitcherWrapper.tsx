'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { MockSystemInitializer } from './MockSystemInitializer';

// Dynamically import the MockUserSwitcher with SSR disabled
const MockUserSwitcher = dynamic(() => import('./MockUserSwitcher'), {
  ssr: false,
});

// Client component wrapper for MockUserSwitcher and MockSystemInitializer
export default function MockUserSwitcherWrapper({ children }: { children: ReactNode }) {
  const isMockAuthEnabled = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

  if (!isMockAuthEnabled) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Initialize the mock system first */}
      <MockSystemInitializer />
      
      {/* Then render the UI components */}
      <MockUserSwitcher />
      {children}
    </>
  );
} 