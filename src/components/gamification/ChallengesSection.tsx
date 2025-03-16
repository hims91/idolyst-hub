import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Trophy, Clock, XCircle } from 'lucide-react';
import { Challenge, UserChallenge } from '@/types/gamification';
import * as gamificationService from '@/services/gamificationService';
import { useToast } from '@/components/ui/use-toast';
import { format, isAfter } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

interface ChallengesSectionProps {
  type: "active" | "available" | "completed";
}

const ChallengesSection: React.FC<ChallengesSectionProps> = ({ type }) => {
  const [challenges, setChallenges] = useState<(Challenge | UserChallenge)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const auth = useAuth();
  
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!auth.user) return;
      
      try {
        setIsLoading(true);
        
        let data;
        if (type === 'available') {
          data = await gamificationService.getAvailableChallenges();
        } else {
          data = await gamificationService.getUserChallenges(auth.user.id);
        }
        
        setChallenges(data || []);
      } catch (error) {
        console.error(`Error fetching ${type} challenges:`, error);
        toast({
          title: "Error",
          description: `Failed to load ${type} challenges. Please try again later.`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChallenges();
  }, [type, auth.user, toast]);
  
  const handleJoinChallenge = async (challengeId: string) => {
    if (!auth.user) return;
    
    try {
      await gamificationService.joinChallenge(auth.user.id, challengeId);
      
      setChallenges(prev => 
        prev.filter(c => 'id' in c ? c.id !== challengeId : true)
      );
      
      toast({
        title: "Challenge Joined",
        description: "You have successfully joined this challenge.",
      });
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="relative">
            <CardHeader className="pb-2">
              <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (challenges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No {type} challenges found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {type === 'available' 
              ? 'Check back later for new challenges' 
              : type === 'active'
                ? 'Join some challenges to get started'
                : 'Complete challenges to see them here'}
          </p>
          {type !== 'available' && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = '/rewards?tab=available'}
            >
              Find Challenges
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {challenges.map(challenge => {
        const isUserChallenge = 'progress' in challenge;
        
        if (!isUserChallenge) {
          const hasStarted = !challenge.startDate || isAfter(new Date(), new Date(challenge.startDate));
          const hasEnded = challenge.endDate && isAfter(new Date(), new Date(challenge.endDate));
          
          return (
            <Card key={challenge.id} className="relative overflow-hidden">
              {!challenge.isActive && (
                <div className="absolute top-0 right-0 m-2">
                  <Badge variant="outline" className="bg-gray-200/80 dark:bg-gray-700/80">
                    Inactive
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Trophy className="h-5 w-5 text-primary mr-2" />
                  {challenge.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {challenge.description}
                </p>
                
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {challenge.startDate && (
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Starts: {format(new Date(challenge.startDate), 'MMM d, yyyy')}
                    </div>
                  )}
                  
                  {challenge.endDate && (
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Ends: {format(new Date(challenge.endDate), 'MMM d, yyyy')}
                    </div>
                  )}
                  
                  <div className="flex items-center ml-auto">
                    <Trophy className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                    {challenge.points} pts
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={!challenge.isActive || hasEnded || !hasStarted}
                  onClick={() => handleJoinChallenge(challenge.id)}
                >
                  {!challenge.isActive 
                    ? 'Challenge Inactive' 
                    : hasEnded 
                      ? 'Challenge Ended' 
                      : !hasStarted 
                        ? 'Coming Soon' 
                        : 'Join Challenge'}
                </Button>
              </CardContent>
            </Card>
          );
        }
        
        const userChallenge = challenge as UserChallenge;
        
        return (
          <Card key={userChallenge.id} className="relative overflow-hidden">
            {userChallenge.isCompleted && (
              <div className="absolute top-0 right-0 m-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 border-green-200 dark:border-green-800">
                  Completed
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 text-primary mr-2" />
                {userChallenge.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {userChallenge.description}
              </p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{userChallenge.progress}%</span>
                </div>
                <Progress value={userChallenge.progress} className="h-2" />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                {userChallenge.completedAt ? (
                  <div className="flex items-center">
                    <Trophy className="h-3.5 w-3.5 mr-1 text-green-500" />
                    Completed on {format(new Date(userChallenge.completedAt), 'MMM d, yyyy')}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Joined on {format(new Date(userChallenge.joinedAt || Date.now()), 'MMM d, yyyy')}
                  </div>
                )}
                
                <div className="flex items-center">
                  <Trophy className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                  {userChallenge.points} pts
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ChallengesSection;
