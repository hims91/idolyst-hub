
import React from 'react';
import UserChallenges from './UserChallenges';

const UserProfile = ({ userId }: { userId: string }) => {
  return (
    <div>
      <UserChallenges />
    </div>
  );
};

export default UserProfile;
