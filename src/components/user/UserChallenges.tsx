
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Challenge, UserChallenge } from "@/types/api";
import { getUserChallenges, getAvailableChallenges, joinChallenge, updateChallengeProgress, completeChallenge } from "@/services/gamificationService";

interface UserChallengesProps {
  userId: string;
}

const UserChallenges: React.FC<UserChallengesProps> = ({ userId }) => {
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoading(true);
        
        // Fetch challenges the user has joined
        const userChallengesData = await getUserChallenges(userId);
        setUserChallenges(userChallengesData);
        
        // Fetch available challenges that the user hasn't joined yet
        const availableChallengesData = await getAvailableChallenges();
        
        // Filter out challenges the user has already joined
        const userChallengeIds = new Set(userChallengesData.map(uc => uc.challengeId));
        const filteredAvailableChallenges = availableChallengesData.filter(
          (challenge) => !userChallengeIds.has(challenge.id)
        );
        
        setAvailableChallenges(filteredAvailableChallenges);
      } catch (error) {
        console.error("Error fetching challenges:", error);
        toast({
          title: "Error",
          description: "Failed to load challenges. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChallenges();
  }, [userId, toast]);
  
  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to join challenges.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = await joinChallenge(user.id, challengeId);
      
      if (success) {
        toast({
          title: "Challenge Joined",
          description: "You have successfully joined this challenge!",
          variant: "default"
        });
        
        // Refresh the challenges lists
        const userChallengesData = await getUserChallenges(userId);
        setUserChallenges(userChallengesData);
        
        // Remove the joined challenge from available challenges
        setAvailableChallenges(availableChallenges.filter(c => c.id !== challengeId));
      } else {
        toast({
          title: "Error",
          description: "Failed to join challenge. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateProgress = async (challengeId: string, progress: number) => {
    if (!user) return;
    
    try {
      const success = await updateChallengeProgress(user.id, challengeId, progress);
      
      if (success) {
        // Update local state
        setUserChallenges(userChallenges.map(uc => 
          uc.challengeId === challengeId ? { ...uc, progress } : uc
        ));
        
        toast({
          title: "Progress Updated",
          description: "Challenge progress has been updated.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) return;
    
    try {
      const success = await completeChallenge(user.id, challengeId);
      
      if (success) {
        // Update local state
        setUserChallenges(userChallenges.map(uc => 
          uc.challengeId === challengeId ? { 
            ...uc, 
            isCompleted: true,
            completedAt: new Date().toISOString()
          } : uc
        ));
        
        toast({
          title: "Challenge Completed!",
          description: "Congratulations on completing this challenge!",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error completing challenge:", error);
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Active Challenges */}
      {userChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Your Active Challenges</span>
              <Badge variant="outline">{userChallenges.length} Challenge(s)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userChallenges.map(userChallenge => (
                <div key={userChallenge.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{userChallenge.challenge?.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {userChallenge.challenge?.description}
                      </p>
                    </div>
                    <Badge variant={userChallenge.isCompleted ? "outline" : "outline"}>
                      {userChallenge.isCompleted ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress: {userChallenge.progress}%</span>
                      <span>{userChallenge.challenge?.points} points</span>
                    </div>
                    <Progress value={userChallenge.progress} className="h-2" />
                  </div>
                  
                  {!userChallenge.isCompleted && user && user.id === userId && (
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateProgress(
                          userChallenge.challengeId, 
                          Math.min(userChallenge.progress + 10, 100)
                        )}
                      >
                        Update Progress
                      </Button>
                      
                      {userChallenge.progress >= 100 && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleCompleteChallenge(userChallenge.challengeId)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Available Challenges */}
      {availableChallenges.length > 0 && user && user.id === userId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Available Challenges</span>
              <Badge variant="outline">{availableChallenges.length} Challenge(s)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableChallenges.map(challenge => (
                <div key={challenge.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{challenge.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {challenge.description}
                      </p>
                    </div>
                    <Badge variant="outline">{challenge.points} points</Badge>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleJoinChallenge(challenge.id)}
                  >
                    Join Challenge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {userChallenges.length === 0 && availableChallenges.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="py-12 text-muted-foreground">
              No challenges available at this time. Check back later!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserChallenges;
