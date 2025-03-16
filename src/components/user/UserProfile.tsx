
import React from 'react';
import { Challenge } from '@/types/api';
import UserChallenges from './UserChallenges';

const UserProfile = ({ userId }: { userId: string }) => {
  return (
    <div>
      <UserChallenges userId={userId} />
    </div>
  );
};

export default UserProfile;
