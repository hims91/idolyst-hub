
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Award,
  Medal
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LeaderboardEntry } from '@/types/gamification';
import { supabase } from '@/integrations/supabase/client';

const LeaderboardSection = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'allTime'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // In production, this would fetch from Supabase
        // For now, we'll use mock data
        const mockLeaderboard: LeaderboardEntry[] = [
          {
            userId: 'user-1',
            userName: 'Alex Johnson',
            userAvatar: 'https://ui-avatars.com/api/?name=Alex+Johnson',
            points: 2450,
            badgeCount: 12,
            rank: 1,
          },
          {
            userId: 'user-2',
            userName: 'Sarah Williams',
            userAvatar: 'https://ui-avatars.com/api/?name=Sarah+Williams',
            points: 1980,
            badgeCount: 10,
            rank: 2,
          },
          {
            userId: 'user-3',
            userName: 'Michael Chen',
            userAvatar: 'https://ui-avatars.com/api/?name=Michael+Chen',
            points: 1750,
            badgeCount: 9,
            rank: 3,
          },
          {
            userId: 'user-4',
            userName: 'Emma Rodriguez',
            userAvatar: 'https://ui-avatars.com/api/?name=Emma+Rodriguez',
            points: 1620,
            badgeCount: 8,
            rank: 4,
          },
          {
            userId: 'user-5',
            userName: 'David Kim',
            userAvatar: 'https://ui-avatars.com/api/?name=David+Kim',
            points: 1510,
            badgeCount: 7,
            rank: 5,
          },
          {
            userId: 'user-6',
            userName: 'Lisa Patel',
            userAvatar: 'https://ui-avatars.com/api/?name=Lisa+Patel',
            points: 1350,
            badgeCount: 6,
            rank: 6,
          },
          {
            userId: 'user-7',
            userName: 'James Wilson',
            userAvatar: 'https://ui-avatars.com/api/?name=James+Wilson',
            points: 1240,
            badgeCount: 6,
            rank: 7,
          },
          {
            userId: 'user-8',
            userName: 'Olivia Brown',
            userAvatar: 'https://ui-avatars.com/api/?name=Olivia+Brown',
            points: 1120,
            badgeCount: 5,
            rank: 8,
          },
          {
            userId: 'user-9',
            userName: 'Daniel Martinez',
            userAvatar: 'https://ui-avatars.com/api/?name=Daniel+Martinez',
            points: 980,
            badgeCount: 5,
            rank: 9,
          },
          {
            userId: 'user-10',
            userName: 'Sophia Lee',
            userAvatar: 'https://ui-avatars.com/api/?name=Sophia+Lee',
            points: 870,
            badgeCount: 4,
            rank: 10,
          },
        ];

        // Current user's rank (if they're not in the top 10)
        const mockUserRank: LeaderboardEntry = {
          userId: user?.id || '',
          userName: user?.name || 'Demo User',
          userAvatar: user?.avatar,
          points: 350,
          badgeCount: 2,
          rank: 32,
        };

        setLeaderboard(mockLeaderboard);
        setUserRank(mockUserRank);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeRange, user]);

  const getTopRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          badge: <Trophy className="h-5 w-5 text-yellow-500" />,
          rowClass: "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500",
        };
      case 2:
        return {
          badge: <Trophy className="h-5 w-5 text-gray-400" />,
          rowClass: "bg-gray-50 dark:bg-gray-800/50 border-l-4 border-gray-400",
        };
      case 3:
        return {
          badge: <Trophy className="h-5 w-5 text-amber-600" />,
          rowClass: "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600",
        };
      default:
        return {
          badge: <span className="font-semibold text-muted-foreground">{rank}</span>,
          rowClass: "",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Leaderboard</h2>
          <p className="text-muted-foreground">Top users based on points and contributions</p>
        </div>
        <Select 
          value={timeRange} 
          onValueChange={(value: 'week' | 'month' | 'allTime') => setTimeRange(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="allTime">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center animate-pulse h-16 px-4 rounded-md bg-muted/50">
                  <div className="w-8 h-8 bg-muted rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                  <div className="w-16 h-6 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Badges</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`${getTopRankStyles(entry.rank).rowClass}`}
                    >
                      <TableCell className="font-medium">
                        {getTopRankStyles(entry.rank).badge}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={entry.userAvatar} alt={entry.userName} />
                            <AvatarFallback>{entry.userName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{entry.userName}</div>
                            {entry.userId === user?.id && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{entry.points.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <Award className="h-4 w-4 mr-1 text-primary" />
                          <span>{entry.badgeCount}</span>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>

              {/* Current user's rank if not in top 10 */}
              {userRank && !leaderboard.some(entry => entry.userId === user?.id) && (
                <div className="mt-4 pt-4 border-t">
                  <Table>
                    <TableBody>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-primary/5 border-l-4 border-primary"
                      >
                        <TableCell className="font-medium">
                          {userRank.rank}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={userRank.userAvatar} alt={userRank.userName} />
                              <AvatarFallback>{userRank.userName.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{userRank.userName}</div>
                              <Badge variant="outline" className="text-xs">You</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{userRank.points.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <Award className="h-4 w-4 mr-1 text-primary" />
                            <span>{userRank.badgeCount}</span>
                          </div>
                        </TableCell>
                      </motion.tr>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardSection;
