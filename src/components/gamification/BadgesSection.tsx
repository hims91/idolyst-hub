
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Award, 
  Trophy, 
  Star, 
  Crown, 
  Shield,
  Gift,
  ThumbsUp,
  MessageSquare,
  Users,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge as BadgeType } from '@/types/gamification';
import { supabase } from '@/integrations/supabase/client';

interface BadgesSectionProps {
  type: 'available' | 'earned';
}

const badgeIcons: Record<string, React.ReactNode> = {
  'award': <Award className="h-8 w-8" />,
  'trophy': <Trophy className="h-8 w-8" />,
  'star': <Star className="h-8 w-8" />,
  'crown': <Crown className="h-8 w-8" />,
  'shield': <Shield className="h-8 w-8" />,
  'gift': <Gift className="h-8 w-8" />,
  'thumbs-up': <ThumbsUp className="h-8 w-8" />,
  'message-square': <MessageSquare className="h-8 w-8" />,
  'users': <Users className="h-8 w-8" />,
  'lightbulb': <Lightbulb className="h-8 w-8" />,
};

const BadgesSection: React.FC<BadgesSectionProps> = ({ type }) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In production, this would fetch from Supabase
        // For now, we'll use mock data
        const mockBadges: BadgeType[] = [
          {
            id: '1',
            name: 'First Post',
            description: 'Created your first post',
            icon: 'award',
            category: 'achievement',
            pointsRequired: 10,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Influencer',
            description: 'Reached 100 followers',
            icon: 'crown',
            category: 'achievement',
            pointsRequired: 500,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Thought Leader',
            description: 'Received 50 upvotes on a post',
            icon: 'star',
            category: 'contribution',
            pointsRequired: 200,
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Connector',
            description: 'Joined 5 communities',
            icon: 'users',
            category: 'contribution',
            pointsRequired: 150,
            createdAt: new Date().toISOString(),
          },
          {
            id: '5',
            name: 'Active Commenter',
            description: 'Made 25 comments',
            icon: 'message-square',
            category: 'contribution',
            pointsRequired: 100,
            createdAt: new Date().toISOString(),
          },
          {
            id: '6',
            name: 'Idea Machine',
            description: 'Created 10 posts',
            icon: 'lightbulb',
            category: 'achievement',
            pointsRequired: 300,
            createdAt: new Date().toISOString(),
          },
        ];

        // Filter badges based on the type
        if (type === 'earned') {
          // In production, this would check which badges the user has earned
          setBadges(mockBadges.slice(0, 2)); // Assume user has earned the first two badges
        } else {
          setBadges(mockBadges);
        }

        // Mock user points
        setUserPoints(350);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching badges:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [type, user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-8 w-8 rounded-full bg-muted mb-2"></div>
              <div className="h-5 bg-muted rounded w-2/3 mb-1"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-muted rounded w-full mt-4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {type === 'available' && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Your Points</h3>
            <p className="text-3xl font-bold text-primary">{userPoints}</p>
          </div>
          <Button variant="outline">How to Earn Points</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`overflow-hidden ${type === 'earned' ? 'border-primary/30 bg-primary/5' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-full ${type === 'earned' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {badgeIcons[badge.icon]}
                  </div>
                  <Badge variant={type === 'earned' ? 'default' : 'outline'}>
                    {badge.category.charAt(0).toUpperCase() + badge.category.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-3">{badge.name}</CardTitle>
                <CardDescription className="text-sm">
                  {badge.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {type === 'available' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{Math.min(userPoints, badge.pointsRequired)}/{badge.pointsRequired} points</span>
                    </div>
                    <Progress value={(userPoints / badge.pointsRequired) * 100} className="h-2" />
                  </div>
                )}
                {type === 'earned' && (
                  <div className="mt-4 flex items-center justify-center">
                    <Badge variant="outline" className="px-3 py-1">
                      Earned on {new Date().toLocaleDateString()}
                    </Badge>
                  </div>
                )}
              </CardContent>
              {type === 'available' && (
                <CardFooter className="pt-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          disabled={userPoints < badge.pointsRequired}
                        >
                          {userPoints >= badge.pointsRequired ? "Claim Badge" : "Keep Earning"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {userPoints >= badge.pointsRequired 
                          ? "You've earned enough points to claim this badge!" 
                          : `Earn ${badge.pointsRequired - userPoints} more points to unlock this badge`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {badges.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">
            {type === 'earned' ? "No badges earned yet" : "No badges available"}
          </CardTitle>
          <CardDescription>
            {type === 'earned' 
              ? "Complete activities to earn badges and showcase your achievements." 
              : "Check back later for new badges to earn!"}
          </CardDescription>
          {type === 'earned' && (
            <Button className="mt-4">Explore Available Badges</Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default BadgesSection;
