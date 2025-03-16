
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { UserChallenge } from '@/types/gamification';
import { Clock, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { gamificationService } from '@/services/gamificationService';

interface UserChallengesProps {
  userId: string;
}

const UserChallenges: React.FC<UserChallengesProps> = ({ userId }) => {
  const { data: userChallenges, isLoading } = useQuery({
    queryKey: ['user-challenges', userId],
    queryFn: () => gamificationService.getUserChallenges(userId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!userChallenges || userChallenges.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No challenges joined</h3>
          <p className="text-muted-foreground">
            You haven't joined any challenges yet. Check out available challenges below!
          </p>
          
          <Button className="mt-4" onClick={() => window.location.href = '/rewards'}>
            Browse Challenges
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Separate active and completed challenges
  const activeChallenges = userChallenges.filter(uc => !uc.isCompleted);
  const completedChallenges = userChallenges.filter(uc => uc.isCompleted);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderChallenge = (challenge: UserChallenge) => {
    const progress = challenge.progress;
    const isCompleted = challenge.isCompleted;

    return (
      <Card key={challenge.id} className={isCompleted ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{challenge.challenge?.title || 'Challenge'}</CardTitle>
              <CardDescription>{challenge.challenge?.description}</CardDescription>
            </div>
            <Badge variant={isCompleted ? 'success' : 'secondary'}>
              {isCompleted ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <Clock className="h-3 w-3 mr-1" />
              )}
              {isCompleted ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isCompleted && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 text-sm">
              {challenge.challenge?.points && (
                <Badge variant="outline" className="bg-primary/5">
                  <Trophy className="h-3 w-3 mr-1" />
                  {challenge.challenge.points} points
                </Badge>
              )}
              
              {challenge.challenge?.requirements && (
                <Badge variant="outline">
                  {challenge.challenge.requirements}
                </Badge>
              )}
              
              {challenge.challenge?.startDate && (
                <span className="text-xs text-muted-foreground">
                  Starts: {formatDate(challenge.challenge.startDate)}
                </span>
              )}
              
              {challenge.challenge?.endDate && (
                <span className="text-xs text-muted-foreground">
                  Ends: {formatDate(challenge.challenge.endDate)}
                </span>
              )}
              
              {challenge.completedAt && (
                <span className="text-xs text-muted-foreground">
                  Completed: {formatDate(challenge.completedAt)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Challenges</h2>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="active">
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6 space-y-4">
          {activeChallenges.length > 0 ? (
            activeChallenges.map(renderChallenge)
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <XCircle className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No active challenges</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedChallenges.length > 0 ? (
            completedChallenges.map(renderChallenge)
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <XCircle className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No completed challenges yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserChallenges;
