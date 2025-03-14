
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Clock, 
  Users, 
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Challenge, UserChallenge } from '@/types/gamification';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const ChallengesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<(Challenge & { userProgress?: UserChallenge })[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      try {
        // In production, this would fetch from Supabase
        // For now, we'll use mock data
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        
        const nextMonth = new Date(now);
        nextMonth.setDate(now.getDate() + 30);

        const mockChallenges: (Challenge & { userProgress?: UserChallenge })[] = [
          {
            id: '1',
            title: 'Networking Champion',
            description: 'Connect with 10 new members in your field',
            points: 150,
            requirements: 'Send connection requests to 10 new members in your industry',
            startDate: now.toISOString(),
            endDate: nextWeek.toISOString(),
            isActive: true,
            participants: 245,
            completions: 37,
            userProgress: {
              id: 'up-1',
              userId: user?.id || '',
              challengeId: '1',
              progress: 60,
              isCompleted: false,
              joinedAt: now.toISOString(),
            }
          },
          {
            id: '2',
            title: 'Content Creator',
            description: 'Publish 5 posts in 7 days',
            points: 200,
            requirements: 'Create and publish 5 original posts within a week',
            startDate: now.toISOString(),
            endDate: nextWeek.toISOString(),
            isActive: true,
            participants: 156,
            completions: 24,
            userProgress: {
              id: 'up-2',
              userId: user?.id || '',
              challengeId: '2',
              progress: 40,
              isCompleted: false,
              joinedAt: now.toISOString(),
            }
          },
          {
            id: '3',
            title: 'Engagement Expert',
            description: 'Comment on 20 posts from your network',
            points: 100,
            requirements: 'Leave thoughtful comments on 20 different posts',
            startDate: now.toISOString(),
            endDate: nextMonth.toISOString(),
            isActive: true,
            participants: 312,
            completions: 78,
          },
          {
            id: '4',
            title: 'Community Builder',
            description: 'Join 3 communities and participate in discussions',
            points: 175,
            requirements: 'Join 3 different communities and post at least once in each',
            startDate: now.toISOString(),
            endDate: nextMonth.toISOString(),
            isActive: true,
            participants: 198,
            completions: 42,
          },
          {
            id: '5',
            title: 'Feedback Master',
            description: 'Provide quality feedback on 5 startup pitches',
            points: 250,
            requirements: 'Give detailed feedback on 5 different startup pitches',
            startDate: now.toISOString(),
            endDate: nextWeek.toISOString(),
            isActive: true,
            participants: 87,
            completions: 19,
            userProgress: {
              id: 'up-3',
              userId: user?.id || '',
              challengeId: '5',
              progress: 100,
              isCompleted: true,
              joinedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              completedAt: now.toISOString(),
            }
          },
        ];

        setChallenges(mockChallenges);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user?.id]);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join challenges",
        variant: "destructive",
      });
      return;
    }

    setJoiningChallenge(challengeId);
    
    try {
      // In production, this would be a Supabase call
      // For now, we'll simulate a delay and update the local state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChallenges(prev => 
        prev.map(challenge => 
          challenge.id === challengeId 
            ? { 
                ...challenge, 
                participants: challenge.participants + 1,
                userProgress: {
                  id: `up-new-${challengeId}`,
                  userId: user.id || '',
                  challengeId,
                  progress: 0,
                  isCompleted: false,
                  joinedAt: new Date().toISOString(),
                }
              } 
            : challenge
        )
      );

      toast({
        title: "Challenge joined",
        description: "You have successfully joined this challenge!",
      });
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Failed to join",
        description: "There was an error joining the challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoiningChallenge(null);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'active') {
      return challenge.userProgress ? !challenge.userProgress.isCompleted : true;
    } else {
      return challenge.userProgress?.isCompleted;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Quests & Challenges</h2>
          <p className="text-muted-foreground">Complete challenges to earn points and badges</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: 'active' | 'completed') => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
                    <div className="h-2 bg-muted rounded w-full mt-4"></div>
                    <div className="flex justify-between mt-4">
                      <div className="h-5 bg-muted rounded w-24"></div>
                      <div className="h-5 bg-muted rounded w-24"></div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <Badge variant="outline" className="mb-2">
                            {challenge.points} points
                          </Badge>
                          {challenge.userProgress && !challenge.userProgress.isCompleted && (
                            <Badge variant="secondary">In Progress</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{challenge.title}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{challenge.requirements}</p>

                        {challenge.userProgress && !challenge.userProgress.isCompleted && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{challenge.userProgress.progress}%</span>
                            </div>
                            <Progress value={challenge.userProgress.progress} className="h-2" />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Ends {formatDistanceToNow(new Date(challenge.endDate), { addSuffix: true })}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{challenge.participants} participants</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {challenge.userProgress ? (
                          <Button className="w-full" variant="outline" disabled>
                            {challenge.userProgress.isCompleted ? (
                              <><CheckCircle className="h-4 w-4 mr-2" /> Completed</>
                            ) : (
                              <>In Progress</>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            className="w-full" 
                            onClick={() => handleJoinChallenge(challenge.id)}
                            disabled={joiningChallenge === challenge.id}
                          >
                            {joiningChallenge === challenge.id ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Joining...</>
                            ) : (
                              <>Join Challenge</>
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2">
                  <Card className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <Trophy className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="mb-2">No active challenges</CardTitle>
                    <CardDescription>
                      You don't have any active challenges at the moment. Join some challenges to earn points and badges!
                    </CardDescription>
                    <Button className="mt-4">Explore All Challenges</Button>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
                    <div className="flex justify-between mt-4">
                      <div className="h-5 bg-muted rounded w-24"></div>
                      <div className="h-5 bg-muted rounded w-24"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <Badge variant="outline" className="mb-2">
                            {challenge.points} points earned
                          </Badge>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{challenge.title}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{challenge.requirements}</p>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            <span>Completed {challenge.userProgress?.completedAt && formatDistanceToNow(new Date(challenge.userProgress.completedAt), { addSuffix: true })}</span>
                          </div>
                          <div className="flex items-center">
                            <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                            <span>{challenge.completions} completed by others</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2">
                  <Card className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="mb-2">No completed challenges yet</CardTitle>
                    <CardDescription>
                      You haven't completed any challenges yet. Join and complete challenges to see them here!
                    </CardDescription>
                    <Button className="mt-4" variant="outline" onClick={() => setActiveTab('active')}>
                      View Active Challenges
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengesSection;
