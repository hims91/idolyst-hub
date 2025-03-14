
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Challenge, UserChallenge } from '@/types/gamification';
import { getAllChallenges, getUserChallenges, joinChallenge } from '@/services/gamificationService';
import { useToast } from '@/components/ui/use-toast';
import { Award, Calendar, CheckCircle, Star, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChallengesSectionProps {
  type: 'active' | 'available' | 'completed';
}

const ChallengesSection: React.FC<ChallengesSectionProps> = ({ type }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view challenges.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        // Fetch all challenges and user challenges
        const [allChallenges, userChallengesData] = await Promise.all([
          getAllChallenges(type === 'available'),
          getUserChallenges(user.id)
        ]);
        
        setChallenges(allChallenges);
        setUserChallenges(userChallengesData);
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
  }, [toast, type]);
  
  const handleJoinChallenge = async (challengeId: string) => {
    try {
      setIsJoining(challengeId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to join challenges.",
          variant: "destructive"
        });
        return;
      }
      
      const success = await joinChallenge(user.id, challengeId);
      
      if (success) {
        // Refetch challenges to update the UI
        const userChallengesData = await getUserChallenges(user.id);
        setUserChallenges(userChallengesData);
        
        toast({
          title: "Challenge Joined",
          description: "You have successfully joined the challenge."
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to join challenge. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(null);
    }
  };
  
  // Filter and process challenges based on type
  const filteredChallenges = React.useMemo(() => {
    if (type === 'available') {
      // Show challenges that user hasn't joined yet
      const joinedChallengeIds = new Set(userChallenges.map(uc => uc.challenge.id));
      return challenges.filter(c => !joinedChallengeIds.has(c.id));
    } else if (type === 'active') {
      // Show joined but not completed challenges
      return userChallenges
        .filter(uc => !uc.isCompleted)
        .map(uc => ({
          ...uc.challenge,
          userChallenge: uc
        }));
    } else {
      // Show completed challenges
      return userChallenges
        .filter(uc => uc.isCompleted)
        .map(uc => ({
          ...uc.challenge,
          userChallenge: uc
        }));
    }
  }, [challenges, userChallenges, type]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="border border-gray-200 animate-pulse">
            <CardHeader className="h-24 bg-gray-100"></CardHeader>
            <CardContent className="h-48 bg-gray-50"></CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (filteredChallenges.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">
          {type === 'available' ? 'No available challenges' : 
           type === 'active' ? 'No active challenges' : 
           'No completed challenges'}
        </h3>
        <p className="text-gray-500 mt-2">
          {type === 'available' ? 'You\'ve joined all available challenges. Check back later for new ones!' : 
           type === 'active' ? 'Join some challenges to get started on your journey!' : 
           'Complete challenges to earn rewards and see them here!'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredChallenges.map((challenge) => (
        <Card key={challenge.id} className="border border-gray-200">
          <CardHeader className={`pb-3 ${type === 'completed' ? 'bg-green-50' : type === 'active' ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">{challenge.title}</CardTitle>
              {type === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {type === 'active' && <Star className="h-5 w-5 text-amber-400" />}
            </div>
            <CardDescription className="text-xs">
              {challenge.startDate && 
                <div className="flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(challenge.startDate).toLocaleDateString()} - 
                  {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : 'Ongoing'}
                </div>
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
              {challenge.requirements && (
                <div className="mt-2 text-xs text-gray-500">
                  <p className="font-medium">Requirements:</p>
                  <p>{challenge.requirements}</p>
                </div>
              )}
            </div>
            
            {type !== 'available' && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{(challenge as any).userChallenge.progress}%</span>
                </div>
                <Progress value={(challenge as any).userChallenge.progress} className="h-2" />
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-gray-50 px-4 py-3 flex justify-between">
            <div className="flex items-center text-sm font-medium">
              <Trophy className="h-4 w-4 mr-2 text-amber-500" />
              {challenge.points} points
            </div>
            
            {type === 'available' && (
              <Button 
                size="sm"
                onClick={() => handleJoinChallenge(challenge.id)}
                disabled={isJoining === challenge.id}
              >
                {isJoining === challenge.id ? 'Joining...' : 'Join'}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ChallengesSection;
