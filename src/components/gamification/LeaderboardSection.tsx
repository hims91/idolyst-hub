
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderboardEntry } from '@/types/gamification';
import { getLeaderboard } from '@/services/gamificationService';
import { useToast } from '@/components/ui/use-toast';
import { Trophy, Medal, Award } from 'lucide-react';

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
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-700" />;
    return <span className="font-bold text-gray-500">{rank}</span>;
  };
  
  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 animate-pulse rounded-md">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (leaderboard.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No data yet</h3>
            <p className="text-gray-500 mt-2">
              Be the first to earn points and top the leaderboard!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" /> 
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div 
              key={entry.userId} 
              className={`flex items-center p-3 rounded-md ${entry.rank <= 3 ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex items-center flex-1">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={entry.avatarUrl} alt={entry.username} />
                  <AvatarFallback>{entry.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{entry.username}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold">{entry.points} pts</span>
                <span className="text-xs text-gray-500">Level {entry.level}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardSection;
