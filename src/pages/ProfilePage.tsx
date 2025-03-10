
import React from 'react';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import Profile from '@/components/Profile';
import { useRequireAuth } from '@/hooks/use-auth-route';

const ProfilePage = () => {
  // Protect this route - redirect to login if not authenticated
  const { isLoading } = useRequireAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Profile" />
        
        <main className="flex-1 container py-6 max-w-5xl">
          <Profile />
        </main>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
