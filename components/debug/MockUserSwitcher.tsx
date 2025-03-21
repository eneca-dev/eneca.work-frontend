'use client';

import { useState, useEffect } from 'react';
import { mockUsers } from '@/lib/mocks/data/users';

/**
 * UI component for switching between mock users during development
 */
export function MockUserSwitcher() {
  const [currentUser, setCurrentUser] = useState<string>('admin');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  // Initialization
  useEffect(() => {
    // Show only in mock auth mode
    if (process.env.NEXT_PUBLIC_MOCK_AUTH !== 'true') {
      return;
    }
    
    const storedUser = localStorage.getItem('mockUserType') || 'admin';
    setCurrentUser(storedUser);
    setIsVisible(true);
  }, []);
  
  // If mock mode is disabled, don't render the component
  if (!isVisible) {
    return null;
  }
  
  // Switch user function
  const switchToUser = (userType: string) => {
    if (typeof window !== 'undefined' && window.__mockSystem) {
      window.__mockSystem.setCurrentUser(userType);
      setCurrentUser(userType);
      
      // Reload page to apply changes
      window.location.reload();
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg shadow-lg z-50">
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-bold text-yellow-800">Mock User</h3>
        
        <div className="flex flex-col space-y-1">
          {Object.keys(mockUsers).map(userType => (
            <button
              key={userType}
              onClick={() => switchToUser(userType)}
              className={`px-2 py-1 text-xs rounded ${
                currentUser === userType 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
              }`}
            >
              {userType} ({mockUsers[userType].profile?.role})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MockUserSwitcher; 