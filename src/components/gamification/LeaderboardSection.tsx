
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { Award, Trophy, Medal, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { LeaderboardEntry } from '@/types/gamification';
import * as gamificationService from '@/services/gamificationService';

const LeaderboardSection: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => gamificationService.getLeaderboard(period),
  });

  // Function to get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            There was an error loading the leaderboard. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={period} 
          onValueChange={(value) => setPeriod(value as 'daily' | 'weekly' | 'monthly' | 'all')}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value={period} className="mt-0">
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className={`flex items-center justify-between p-3 rounded-md ${
                      index < 3 ? 'bg-primary/5 border' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 text-center">
                        {index === 0 ? (
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="h-6 w-6 text-gray-400" /> 
                        ) : index === 2 ? (
                          <Medal className="h-6 w-6 text-amber-600" />
                        ) : (
                          <span className="text-muted-foreground">{entry.rank}</span>
                        )}
                      </div>
                      
                      <Avatar>
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium">{entry.name}</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">Level {entry.level}</span>
                          {entry.role && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {entry.role}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="font-medium">{entry.points.toLocaleString()} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No data available</h3>
                <p className="text-muted-foreground">
                  The leaderboard for this period is currently empty.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LeaderboardSection;
