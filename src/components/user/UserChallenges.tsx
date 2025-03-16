
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
      requirements: '', // Default value for required field
      isActive: !uc.isCompleted // Convert isCompleted to isActive
    }));
  };
  
  // Example of safe usage
  const updateChallenges = (userChallenges: UserChallenge[]) => {
    const transformedChallenges = transformChallenges(userChallenges);
    setChallenges(transformedChallenges);
  };

  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};

export default UserChallenges;
