
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { UserChallenge, Challenge } from '@/types/gamification';
import { Target, Check, Clock, Award } from 'lucide-react';

interface UserChallengesProps {
  userChallenges: UserChallenge[];
  availableChallenges?: Challenge[];
  onJoinChallenge?: (challengeId: string) => void;
}

const UserChallenges: React.FC<UserChallengesProps> = ({ 
  userChallenges, 
  availableChallenges = [],
  onJoinChallenge
}) => {
  // Filter challenges
  const activeUserChallenges = userChallenges.filter(
    challenge => !challenge.isCompleted
  );
  const completedUserChallenges = userChallenges.filter(
    challenge => challenge.isCompleted
  );

  // Render no challenges state
  if (userChallenges.length === 0 && availableChallenges.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Challenges Available</h3>
          <p className="text-muted-foreground">
            There are currently no challenges available. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activeUserChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeUserChallenges.map(userChallenge => (
              <div key={userChallenge.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{userChallenge.challenge?.title}</h3>
                    <p className="text-sm text-muted-foreground">{userChallenge.challenge?.description}</p>
                  </div>
                  <div className="bg-primary/10 text-primary font-medium px-2 py-1 rounded text-sm">
                    {userChallenge.challenge?.points} Points
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{userChallenge.progress}%</span>
                  </div>
                  <Progress value={userChallenge.progress} className="h-2" />
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Joined on {new Date(userChallenge.joinedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {completedUserChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedUserChallenges.map(userChallenge => (
              <div key={userChallenge.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <h3 className="font-medium">{userChallenge.challenge?.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{userChallenge.challenge?.description}</p>
                  </div>
                  <div className="bg-primary/10 text-primary font-medium px-2 py-1 rounded text-sm">
                    {userChallenge.challenge?.points} Points
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Joined on {new Date(userChallenge.joinedAt).toLocaleDateString()}</span>
                  {userChallenge.completedAt && (
                    <span>Completed on {new Date(userChallenge.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {availableChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Challenges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableChallenges.map(challenge => (
              <div key={challenge.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  <div className="bg-primary/10 text-primary font-medium px-2 py-1 rounded text-sm">
                    {challenge.points} Points
                  </div>
                </div>
                
                {challenge.requirements && (
                  <div className="mt-2 text-sm">
                    <strong>Requirements:</strong> {challenge.requirements}
                  </div>
                )}
                
                {(challenge.startDate || challenge.endDate) && (
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {challenge.startDate && (
                      <span>Starts: {new Date(challenge.startDate).toLocaleDateString()}</span>
                    )}
                    {challenge.startDate && challenge.endDate && <span className="mx-2">|</span>}
                    {challenge.endDate && (
                      <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                )}
                
                {onJoinChallenge && (
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onJoinChallenge(challenge.id)}
                    >
                      Join Challenge
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserChallenges;
