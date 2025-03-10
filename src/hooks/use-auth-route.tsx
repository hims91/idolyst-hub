
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook to protect routes that require authentication
 * @param redirectTo The path to redirect to if user is not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to access this page',
        variant: 'destructive',
      });
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo, toast]);
  
  return { user, isLoading };
}

/**
 * Hook to redirect authenticated users away from certain routes (like login)
 * @param redirectTo The path to redirect to if user is authenticated
 */
export function useRedirectIfAuth(redirectTo: string = '/') {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && user) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);
  
  return { user, isLoading };
}
