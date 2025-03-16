import React, { useState, useEffect } from 'react';
import { Challenge } from '@/types/api';

interface UserChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  isCompleted: boolean;
}

const UserChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  // Transform UserChallenge[] to Challenge[] safely
  const transformChallenges = (userChallenges: UserChallenge[]): Challenge[] => {
    return userChallenges.map(uc => ({
      id: uc.id,
      title: uc.title,
      description: uc.description,
      points: uc.points,
      requirements: '',
      isActive: true,
      // Add any other required properties
    }));
  };
  
  // Example of safe usage
  const updateChallenges = (userChallenges: UserChallenge[]) => {
    setChallenges(transformChallenges(userChallenges));
  };

  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};

export default UserChallenges;
