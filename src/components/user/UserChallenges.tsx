
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Award, 
  Trophy, 
  Calendar,
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ChevronRight 
} from 'lucide-react';
import { UserChallenge, Challenge } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import * as gamificationService from '@/services/gamificationService';

interface UserChallengesProps {
  userId: string;
  isOwnProfile?: boolean;
}

const UserChallenges: React.FC<UserChallengesProps> = ({ 
  userId,
  isOwnProfile = false
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const { toast } = useToast();
  const auth = useAuth();

  const { 
    data: userChallenges,
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['user-challenges', userId, activeTab],
    queryFn: () => gamificationService.getUserChallenges(userId, activeTab),
    enabled: !!userId
  });

  const { 
    data: availableChallenges,
    isLoading: isLoadingAvailable
  } = useQuery({
    queryKey: ['available-challenges'],
    queryFn: () => gamificationService.getAvailableChallenges(),
    enabled: isOwnProfile
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenges</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Failed to load challenges</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading the challenges. Please try again.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleJoinChallenge = async (challengeId: string) => {
    if (!auth.user) return;
    
    try {
      await gamificationService.joinChallenge(challengeId);
      refetch();
      
      toast({
        title: "Challenge Joined",
        description: "You have successfully joined this challenge.",
      });
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join the challenge. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5" />
          Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'active' | 'completed')}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {userChallenges && userChallenges.length > 0 ? (
              userChallenges.map((userChallenge) => (
                <div 
                  key={userChallenge.challengeId} 
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{userChallenge.challenge?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {userChallenge.challenge?.description}
                      </p>
                    </div>
                    <Badge variant={userChallenge.isCompleted ? "success" : "outline"}>
                      {userChallenge.isCompleted ? "Completed" : `${userChallenge.progress}%`}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{userChallenge.progress}%</span>
                    </div>
                    <Progress value={userChallenge.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>Joined {new Date(userChallenge.joinedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="mr-1 h-3 w-3" />
                      <span>{userChallenge.challenge?.points} points</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No active challenges</h3>
                <p className="text-sm text-muted-foreground">
                  {isOwnProfile 
                    ? "Join a challenge to start earning rewards!" 
                    : "This user hasn't joined any challenges yet."}
                </p>
              </div>
            )}
            
            {isOwnProfile && availableChallenges && availableChallenges.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Available Challenges</h3>
                <div className="space-y-3">
                  {isLoadingAvailable ? (
                    <div className="flex justify-center py-4">
                      <Spinner />
                    </div>
                  ) : (
                    availableChallenges.map((challenge: Challenge) => (
                      <div 
                        key={challenge.id} 
                        className="border rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {challenge.description}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <Trophy className="mr-1 h-3 w-3" />
                            <span>{challenge.points} points reward</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJoinChallenge(challenge.id)}
                        >
                          Join
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {userChallenges && userChallenges.length > 0 ? (
              userChallenges.map((userChallenge) => (
                <div 
                  key={userChallenge.challengeId} 
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{userChallenge.challenge?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {userChallenge.challenge?.description}
                      </p>
                    </div>
                    <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      <CheckCircle className="mr-1 h-3 w-3" /> Completed
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress value={100} className="h-2 bg-green-100 dark:bg-green-900" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>Completed {userChallenge.completedAt 
                        ? new Date(userChallenge.completedAt).toLocaleDateString() 
                        : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="mr-1 h-3 w-3" />
                      <span>{userChallenge.challenge?.points} points earned</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No completed challenges</h3>
                <p className="text-sm text-muted-foreground">
                  {isOwnProfile 
                    ? "Complete challenges to earn rewards and see them here." 
                    : "This user hasn't completed any challenges yet."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserChallenges;
