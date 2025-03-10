
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Gift, Trophy, Star, Clock, Zap, Target, Check } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  category: 'achievement' | 'badge' | 'perk';
  unlocked?: boolean;
  progress?: number;
}

interface UserBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: string;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  badges: number;
}

interface RewardsSectionProps {
  type: 'available' | 'earned' | 'leaderboard';
}

const RewardsSection: React.FC<RewardsSectionProps> = ({ type }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['rewards', type],
    queryFn: () => {
      switch (type) {
        case 'available':
          return apiService.getAvailableRewards();
        case 'earned':
          return apiService.getUserBadges();
        case 'leaderboard':
          return apiService.getPointsLeaderboard();
        default:
          return Promise.resolve([]);
      }
    }
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const renderContent = () => {
    switch (type) {
      case 'available':
        return renderAvailableRewards(data as Reward[]);
      case 'earned':
        return renderEarnedBadges(data as UserBadge[]);
      case 'leaderboard':
        return renderLeaderboard(data as LeaderboardUser[]);
      default:
        return null;
    }
  };
  
  const renderAvailableRewards = (rewards: Reward[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rewards?.map(reward => {
        const IconComponent = 
          reward.icon === 'award' ? Award :
          reward.icon === 'gift' ? Gift :
          reward.icon === 'trophy' ? Trophy :
          reward.icon === 'star' ? Star :
          reward.icon === 'zap' ? Zap :
          Target;
          
        return (
          <Card key={reward.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <IconComponent className="h-6 w-6 text-primary" />
                <span className="font-bold text-primary">{reward.points} pts</span>
              </div>
              <CardTitle className="text-lg mt-2">{reward.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
              {reward.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>{reward.progress}%</span>
                  </div>
                  <Progress value={reward.progress} />
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/50 pt-2">
              <Button className="w-full" variant={reward.unlocked ? "outline" : "default"} disabled={reward.unlocked}>
                {reward.unlocked ? <><Check className="h-4 w-4 mr-1" /> Unlocked</> : 'Unlock'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
  
  const renderEarnedBadges = (badges: UserBadge[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {badges?.map(badge => {
        const IconComponent = 
          badge.icon === 'award' ? Award :
          badge.icon === 'trophy' ? Trophy :
          badge.icon === 'star' ? Star :
          badge.icon === 'zap' ? Zap :
          Target;
          
        return (
          <Card key={badge.id}>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                <IconComponent className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-lg">{badge.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
              <p className="text-xs text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                Earned on {badge.dateEarned}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
  
  const renderLeaderboard = (users: LeaderboardUser[]) => (
    <div className="space-y-4">
      {users?.map((user, index) => (
        <Card key={user.id} className={index < 3 ? "border-primary/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted mr-4 font-semibold">
                {user.rank}
              </div>
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{user.name}</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Award className="h-3 w-3 mr-1" />
                  <span>{user.badges} badges earned</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{user.points.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default RewardsSection;
