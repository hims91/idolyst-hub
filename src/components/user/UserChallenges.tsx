
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Trophy, Users } from "lucide-react";
import { format } from "date-fns";
import gamificationService from '@/services/gamificationService';

interface UserChallengesProps {
  userId: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  requirements: string;
  isActive: boolean;
  progress?: number;
  isCompleted?: boolean;
  startDate?: string;
  endDate?: string;
  joinedAt?: string;
}

const UserChallenges: React.FC<UserChallengesProps> = ({ userId }) => {
  const [challenges, setChallenges] = React.useState<Challenge[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("active");

  React.useEffect(() => {
    const fetchChallenges = async () => {
      try {
        // Use the gamificationService to fetch challenges
        const data = await gamificationService.getUserChallenges(userId);
        setChallenges(data);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [userId]);

  const activeChallenges = challenges.filter(
    (challenge) => challenge.isActive && !challenge.isCompleted
  );
  
  const completedChallenges = challenges.filter(
    (challenge) => challenge.isCompleted
  );

  const joinChallenge = async (challengeId: string) => {
    try {
      await gamificationService.joinChallenge(userId, challengeId);
      
      // Update challenges state
      setChallenges(
        challenges.map((challenge) =>
          challenge.id === challengeId
            ? { ...challenge, joinedAt: new Date().toISOString(), progress: 0 }
            : challenge
        )
      );
    } catch (error) {
      console.error("Failed to join challenge:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenges</CardTitle>
          <CardDescription>Loading challenges...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5" />
          Challenges
        </CardTitle>
        <CardDescription>
          Participate in challenges to earn points and badges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="active" className="w-1/2">
              Active ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="w-1/2">
              Completed ({completedChallenges.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No active challenges at the moment.
              </div>
            ) : (
              <div className="space-y-4">
                {activeChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <Badge variant="outline">{challenge.points} points</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                    
                    {challenge.startDate && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        Starts: {format(new Date(challenge.startDate), "MMM d, yyyy")}
                      </div>
                    )}
                    
                    {challenge.endDate && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        Ends: {format(new Date(challenge.endDate), "MMM d, yyyy")}
                      </div>
                    )}
                    
                    {challenge.joinedAt ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Progress</span>
                          <span>{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} />
                      </div>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => joinChallenge(challenge.id)}
                      >
                        Join Challenge
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedChallenges.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                You haven't completed any challenges yet.
              </div>
            ) : (
              <div className="space-y-4">
                {completedChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="border rounded-lg p-4 space-y-2 bg-muted/30"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <Badge variant="default">{challenge.points} points</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="mr-1 h-3 w-3" />
                      <span>Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserChallenges;
