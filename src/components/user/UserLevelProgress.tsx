
import React from 'react';
import { UserLevel } from '@/types/gamification';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface UserLevelProgressProps {
  userLevel: UserLevel;
}

const UserLevelProgress: React.FC<UserLevelProgressProps> = ({ userLevel }) => {
  return (
    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <Trophy className="h-5 w-5 text-primary mr-2" />
        <h3 className="font-medium">Level {userLevel.level} - {userLevel.title}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{userLevel.pointsRequired} points</span>
          <span>{userLevel.pointsRequired + userLevel.pointsToNextLevel} points</span>
        </div>
        
        <Progress value={userLevel.progressPercentage} className="h-2" />
        
        <div className="text-xs text-center text-muted-foreground">
          {userLevel.pointsToNextLevel} points needed for Level {userLevel.level + 1}
        </div>
      </div>
    </div>
  );
};

export default UserLevelProgress;
