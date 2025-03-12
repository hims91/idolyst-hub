
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, LoginCredentials, RegisterData } from '@/services/api/types';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';
export type AuthProvider = 'email' | 'google' | 'facebook';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  authStatus: AuthStatus;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  socialLogin: (provider: AuthProvider) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyResetToken: (token: string) => Promise<boolean>;
  setNewPassword: (token: string, newPassword: string) => Promise<void>;
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
          // In a real app, validate token with API
          // For now, just mock a user
          const mockUser: User = {
            id: 'user-1',
            name: 'Alex Johnson',
            role: 'Founder & CEO',
            avatar: '/images/avatars/alex.jpg',
            email: 'alex@technova.io',
            company: 'TechNova Solutions',
            bio: 'Serial entrepreneur with 10+ years experience in SaaS and AI.',
            location: 'San Francisco, CA',
            website: 'technova.io',
            joinDate: 'Jan 2023',
            badges: [
              { id: 'badge-1', name: 'Verified Founder', icon: 'user' },
              { id: 'badge-2', name: 'Top Contributor', icon: 'award' }
            ],
            skills: ['AI/ML', 'Growth Strategy', 'Fundraising'],
            followers: 1420,
            following: 358,
            posts: 47,
            startups: 3,
            investments: 12,
          };
          
          setUser(mockUser);
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
      // In a real app, call API
      // For now, just return the current user
      saveSession(user);
    } catch (error) {
      console.error('Session refresh failed:', error);
      // If refresh fails, log out
      logout();
    }
  }, [user, saveSession]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // Mock login for now
      const mockUser: User = {
        id: 'user-1',
        name: 'Alex Johnson',
        role: 'Founder & CEO',
        avatar: '/images/avatars/alex.jpg',
        email: credentials.email,
        company: 'TechNova Solutions',
        bio: 'Serial entrepreneur with 10+ years experience in SaaS and AI.',
        location: 'San Francisco, CA',
        website: 'technova.io',
        joinDate: 'Jan 2023',
        badges: [
          { id: 'badge-1', name: 'Verified Founder', icon: 'user' },
          { id: 'badge-2', name: 'Top Contributor', icon: 'award' }
        ],
        skills: ['AI/ML', 'Growth Strategy', 'Fundraising'],
        followers: 1420,
        following: 358,
        posts: 47,
        startups: 3,
        investments: 12,
      };
      
      setUser(mockUser);
      setAuthStatus('authenticated');
      saveSession(mockUser);
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${mockUser.name}!`,
      });
      
      // Navigate to home page
      navigate('/');
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

  const socialLogin = async (provider: AuthProvider) => {
    setIsLoading(true);
    try {
      // Mock social login
      const mockUser: User = {
        id: 'user-1',
        name: 'Alex Johnson',
        role: 'Founder & CEO',
        avatar: '/images/avatars/alex.jpg',
        email: 'alex@technova.io',
        company: 'TechNova Solutions',
        bio: 'Serial entrepreneur with 10+ years experience in SaaS and AI.',
        location: 'San Francisco, CA',
        website: 'technova.io',
        joinDate: 'Jan 2023',
        badges: [
          { id: 'badge-1', name: 'Verified Founder', icon: 'user' },
          { id: 'badge-2', name: 'Top Contributor', icon: 'award' }
        ],
        skills: ['AI/ML', 'Growth Strategy', 'Fundraising'],
        followers: 1420,
        following: 358,
        posts: 47,
        startups: 3,
        investments: 12,
      };
      
      setUser(mockUser);
      setAuthStatus('authenticated');
      saveSession(mockUser);
      
      toast({
        title: 'Login successful',
        description: `Welcome, ${mockUser.name}!`,
      });
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      toast({
        title: 'Social login failed',
        description: error instanceof Error ? error.message : `Failed to login with ${provider}`,
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
      // Mock registration
      const mockUser: User = {
        id: 'user-1',
        name: data.name,
        role: 'Member',
        avatar: undefined,
        email: data.email,
        company: undefined,
        bio: '',
        location: '',
        website: '',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        badges: [],
        skills: [],
        followers: 0,
        following: 0,
        posts: 0,
        startups: 0,
        investments: 0,
      };
      
      setUser(mockUser);
      setAuthStatus('authenticated');
      saveSession(mockUser);
      
      toast({
        title: 'Registration successful',
        description: `Welcome to Idolyst, ${mockUser.name}!`,
      });
      
      // Navigate to home page
      navigate('/');
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

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Mock password reset request
      toast({
        title: 'Password reset initiated',
        description: 'If an account exists with that email, you will receive a password reset link',
      });
    } catch (error) {
      toast({
        title: 'Reset request failed',
        description: error instanceof Error ? error.message : 'Failed to request password reset',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetToken = async (token: string) => {
    setIsLoading(true);
    try {
      // Mock token verification
      // In a real app, this would validate with the backend
      return true;
    } catch (error) {
      toast({
        title: 'Invalid or expired token',
        description: 'The password reset link is no longer valid. Please request a new one.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setNewPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // Mock password reset
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated. You can now log in with your new password.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Password reset failed',
        description: error instanceof Error ? error.message : 'Failed to reset password',
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
      // Mock profile update
      const updatedUser = { ...user, ...data };
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
    
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    
    navigate('/login');
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
        updateUserProfile,
        socialLogin,
        resetPassword,
        verifyResetToken,
        setNewPassword
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
