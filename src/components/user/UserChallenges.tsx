
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '@/services/gamificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { UserChallenge } from '@/types/gamification';
import { useToast } from '@/components/ui/use-toast';

interface UserChallengesProps {
  userId: string;
}

const UserChallenges: React.FC<UserChallengesProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'active'>('all');
  const { toast } = useToast();

  const { data: availableChallenges, isLoading: availableLoading } = useQuery({
    queryKey: ['challenges', 'available'],
    queryFn: () => gamificationService.getAvailableChallenges(),
    enabled: activeTab === 'all',
  });

  const { data: userChallenges, isLoading: userChallengesLoading } = useQuery({
    queryKey: ['challenges', userId, false],
    queryFn: () => gamificationService.getUserChallenges(userId, false),
    enabled: activeTab === 'active' || activeTab === 'all',
  });

  const { data: completedChallenges, isLoading: completedLoading } = useQuery({
    queryKey: ['challenges', userId, true],
    queryFn: () => gamificationService.getUserChallenges(userId, true),
    enabled: activeTab === 'completed' || activeTab === 'all',
  });

  const isLoading = availableLoading || userChallengesLoading || completedLoading;

  // Function to determine which challenges to display
  const getDisplayChallenges = () => {
    if (activeTab === 'all') {
      const userChallengeIds = new Set((userChallenges || []).map(c => c.id));
      const completedIds = new Set((completedChallenges || []).map(c => c.id));
      
      // Add available challenges not yet joined
      const allChallenges = [
        ...(userChallenges || []),
        ...(completedChallenges || []),
        ...((availableChallenges || [])
          .filter(c => !userChallengeIds.has(c.id) && !completedIds.has(c.id))
          .map(c => ({ ...c, progress: 0, isCompleted: false })))
      ];
      
      return allChallenges;
    } else if (activeTab === 'active') {
      return userChallenges || [];
    } else {
      return completedChallenges || [];
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await gamificationService.joinChallenge(userId, challengeId);
      toast({
        title: 'Challenge Joined',
        description: 'You have successfully joined this challenge.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join the challenge. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getChallengeStatusBadge = (challenge: UserChallenge) => {
    if (challenge.isCompleted) {
      return (
        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Completed
        </Badge>
      );
    } else if (challenge.progress > 0) {
      return (
        <Badge variant="secondary" className="ml-2">
          In Progress ({challenge.progress}%)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="ml-2">
          Not Started
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={activeTab === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          All
        </Button>
        <Button 
          variant={activeTab === 'active' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveTab('active')}
        >
          Active
        </Button>
        <Button 
          variant={activeTab === 'completed' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {getDisplayChallenges().map(challenge => (
            <Card key={challenge.id} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">
                    {challenge.title}
                    {getChallengeStatusBadge(challenge)}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                {challenge.progress > 0 && (
                  <div className="mb-3">
                    <Progress value={challenge.progress} className="h-2" />
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">
                    Reward: {challenge.points} points
                  </div>
                  {!challenge.isCompleted && challenge.progress === 0 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleJoinChallenge(challenge.id)}
                    >
                      Join Challenge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserChallenges;
