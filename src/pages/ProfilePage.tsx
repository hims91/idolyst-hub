
import React from 'react';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import Profile from '@/components/Profile';

const ProfilePage = () => {
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
