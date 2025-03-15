import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderboardEntry } from '@/types/gamification';
import { getLeaderboard } from '@/services/gamificationService';
import { useToast } from '@/components/ui/use-toast';
import { Trophy, Medal, Award, User, Shield } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const LeaderboardSection: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        // Fetch leaderboard data
        const data = await getLeaderboard(20);
        setLeaderboard(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast({
          title: "Error",
          description: "Failed to load leaderboard. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [toast]);
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <Award className="h-6 w-6 text-blue-500" />;
  };
  
  const getRankClass = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (rank === 2) return "bg-gray-100 text-gray-600 dark:bg-gray-600/30 dark:text-gray-300";
    if (rank === 3) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500";
    return "bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400";
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4 space-y-2 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }
  
  if (leaderboard.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No leaderboard data yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Start participating to see yourself on the leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Top 3 users in special cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((entry, index) => (
          <Card 
            key={entry.id} 
            className={`${index === 0 ? 'md:col-span-1 md:order-2 ring-2 ring-yellow-400 dark:ring-yellow-600' : 
              index === 1 ? 'md:col-span-1 md:order-1' : 'md:col-span-1 md:order-3'}`}
          >
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                {getRankIcon(index + 1)}
              </div>
              
              <Avatar className="h-16 w-16 mx-auto mb-4 border-2 border-primary">
                <AvatarImage src={entry.avatar} alt={entry.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {entry.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-lg font-semibold mb-1">{entry.name}</h3>
              
              <div className="flex items-center justify-center mb-4">
                <div className="font-bold text-2xl mr-1">{entry.points}</div>
                <div className="text-xs text-muted-foreground mt-1">points</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div>
                  <div className="font-semibold text-sm">Level</div>
                  <div>{entry.level}</div>
                </div>
                <div>
                  <div className="font-semibold text-sm">Badges</div>
                  <div>{entry.badgeCount}</div>
                </div>
                <div>
                  <div className="font-semibold text-sm">Challenges</div>
                  <div>{entry.challengeCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Rest of the users in a list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.slice(3).map((entry) => (
              <div 
                key={entry.id} 
                className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 ${getRankClass(entry.rank)}`}>
                  {entry.rank}
                </div>
                
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={entry.avatar} alt={entry.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {entry.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="font-medium">{entry.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Level {entry.level} • {entry.badgeCount} Badges
                  </div>
                </div>
                
                <div className="font-bold">{entry.points}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardSection;
