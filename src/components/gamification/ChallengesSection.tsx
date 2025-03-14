
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Challenge, UserChallenge } from '@/types/gamification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChallengesSection: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Fetch active challenges
        const { data: challengesData, error: challengesError } = await supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true)
          .order('end_date', { ascending: true });
        
        if (challengesError) throw challengesError;
        
        // Fetch user challenges
        const { data: userChallengesData, error: userChallengesError } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', user.id);
        
        if (userChallengesError) throw userChallengesError;
        
        setChallenges(challengesData as unknown as Challenge[]);
        setUserChallenges(userChallengesData as unknown as UserChallenge[]);
      } catch (error) {
        console.error('Error fetching challenges:', error);
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
  }, [toast]);
  
  const joinChallenge = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0,
          is_completed: false
        });
      
      if (error) throw error;
      
      // Update local state
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        const newUserChallenge: UserChallenge = {
          id: Math.random().toString(), // Temporary ID until refresh
          userId: user.id,
          challengeId: challengeId,
          progress: 0,
          isCompleted: false,
          joinedAt: new Date().toISOString()
        };
        
        setUserChallenges([...userChallenges, newUserChallenge]);
        
        // Update challenge participant count
        setChallenges(challenges.map(c => 
          c.id === challengeId 
            ? { ...c, participants: c.participants + 1 } 
            : c
        ));
      }
      
      toast({
        title: "Challenge Joined",
        description: "You've successfully joined this challenge!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getUserChallengeProgress = (challengeId: string) => {
    const userChallenge = userChallenges.find(uc => uc.challengeId === challengeId);
    return userChallenge ? userChallenge.progress : 0;
  };
  
  const isUserJoined = (challengeId: string) => {
    return userChallenges.some(uc => uc.challengeId === challengeId);
  };
  
  const isUserCompleted = (challengeId: string) => {
    const userChallenge = userChallenges.find(uc => uc.challengeId === challengeId);
    return userChallenge ? userChallenge.isCompleted : false;
  };
  
  const getTimeRemaining = (endDate: string) => {
    return formatDistanceToNow(new Date(endDate), { addSuffix: true });
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <Card key={index} className="border border-gray-200 animate-pulse">
            <CardHeader className="h-24 bg-gray-100"></CardHeader>
            <CardContent className="h-36 bg-gray-50"></CardContent>
            <CardFooter className="h-16 bg-gray-100"></CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (challenges.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">No active challenges</h3>
        <p className="text-gray-500 mt-2">
          Check back soon for new challenges to participate in!
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {challenges.map((challenge) => {
        const joined = isUserJoined(challenge.id);
        const completed = isUserCompleted(challenge.id);
        const progress = getUserChallengeProgress(challenge.id);
        const timeRemaining = getTimeRemaining(challenge.endDate);
        
        return (
          <Card key={challenge.id} className="border border-gray-200 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{challenge.title}</CardTitle>
                  <CardDescription>
                    <span className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" /> Ends {timeRemaining}
                    </span>
                  </CardDescription>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-primary font-medium text-sm">
                  {challenge.points} points
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
              
              {joined && (
                <div className="mt-2 mb-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              <div className="flex items-center text-xs text-gray-500 mt-3 space-x-4">
                <div className="flex items-center">
                  <Trophy className="h-3 w-3 mr-1" />
                  <span>{challenge.participants} participants</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>{challenge.completions} completions</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 flex justify-between">
              <div className="text-sm">
                <span className="font-medium">Requirements:</span> {challenge.requirements}
              </div>
              {!joined && (
                <Button 
                  onClick={() => joinChallenge(challenge.id)} 
                  size="sm" 
                  variant="outline"
                  className="ml-2"
                >
                  Join Challenge
                </Button>
              )}
              {joined && completed && (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </div>
              )}
              {joined && !completed && (
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  In Progress
                </div>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ChallengesSection;
