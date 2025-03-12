
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LoginCredentials, RegisterData, User, apiService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  authStatus: AuthStatus;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AUTH_STORAGE_KEY = 'idolyst_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load session from storage on initial mount
  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
        
        if (storedSession) {
          // Validate token with API
          const userData = await apiService.getCurrentUser();
          setUser(userData);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthStatus('unauthenticated');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  const saveSession = useCallback((userData: User) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      userId: userData.id,
      timestamp: Date.now()
    }));
  }, []);

  const refreshSession = useCallback(async () => {
    if (!user) return;
    
    try {
      const refreshedUser = await apiService.getCurrentUser();
      setUser(refreshedUser);
      saveSession(refreshedUser);
    } catch (error) {
      console.error('Session refresh failed:', error);
      // If refresh fails, log out
      logout();
    }
  }, [user, saveSession]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const user = await apiService.login(credentials);
      setUser(user);
      setAuthStatus('authenticated');
      saveSession(user);
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const user = await apiService.register(data);
      setUser(user);
      setAuthStatus('authenticated');
      saveSession(user);
      
      toast({
        title: 'Registration successful',
        description: `Welcome to Idolyst, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await apiService.updateUserProfile(user.id, data);
      setUser(updatedUser);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setAuthStatus('unauthenticated');
    navigate('/login');
    
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  }, [toast, navigate]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        authStatus,
        login, 
        register, 
        logout, 
        refreshSession,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
