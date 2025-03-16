
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import gamificationService from '@/services/gamificationService';
import { UserChallenge } from '@/types/gamification';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export interface UserChallengesProps {
  userId: string;
}

const UserChallenges: React.FC<UserChallengesProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoading(true);
        const data = await gamificationService.getUserChallenges(
          userId, 
          activeTab === 'completed'
        );
        setChallenges(data || []);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [userId, activeTab]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="active" onValueChange={(val) => setActiveTab(val as 'active' | 'completed')}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {challenges.length === 0 ? (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No active challenges found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map(challenge => (
                <Card key={challenge.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-md">{challenge.title}</CardTitle>
                      <Badge variant="secondary">
                        {challenge.points} points
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-3">{challenge.description}</p>
                    <div className="mb-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                    <div className="text-xs text-gray-500 mt-3">
                      Joined on {format(new Date(challenge.joinedAt || Date.now()), 'MMM d, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {challenges.length === 0 ? (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No completed challenges found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map(challenge => (
                <Card key={challenge.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-md">{challenge.title}</CardTitle>
                      <Badge>
                        {challenge.points} points earned
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-2">{challenge.description}</p>
                    <div className="text-xs text-gray-500 mt-3">
                      Completed on {format(new Date(challenge.completedAt || Date.now()), 'MMM d, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserChallenges;
