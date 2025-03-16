
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Profile from '@/components/Profile';

const ProfilePage = () => {
  const auth = useAuth();
  
  if (!auth.user) {
    return <div>Please log in to view your profile</div>;
  }
  
  return (
    <div className="container mx-auto p-4 flex justify-center">
      <Profile userId={auth.user.id} />
    </div>
  );
};

export default ProfilePage;
