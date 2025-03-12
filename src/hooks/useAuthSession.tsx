
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to handle auth session persistence and refresh tokens
 */
export function useAuthSession() {
  const { user, refreshSession, isLoading } = useAuth();

  useEffect(() => {
    // Check session validity every 5 minutes
    const intervalId = setInterval(() => {
      if (user) {
        refreshSession();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, refreshSession]);

  return { isValidSession: !!user && !isLoading };
}
