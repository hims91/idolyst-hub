
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Award, 
  Shield, 
  Trophy, 
  Star, 
  XCircle, 
  BookOpen, 
  MessageSquare,
  Users,
  Heart,
  CalendarDays,
  Sparkles,
  GitPullRequest
} from 'lucide-react';
import { Badge as BadgeType } from '@/types/gamification';
import { getUserBadges } from '@/services/gamificationService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

interface BadgesSectionProps {
  type: 'earned' | 'available';
}

const BadgesSection: React.FC<BadgesSectionProps> = ({ type }) => {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getUserBadges(user.id, type);
        setBadges(data || []);
      } catch (error) {
        console.error(`Error fetching ${type} badges:`, error);
        toast({
          title: "Error",
          description: `Failed to load badges. Please try again later.`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBadges();
  }, [type, user, toast]);
  
  const getBadgeIcon = (iconName: string) => {
    const iconProps = { className: "h-6 w-6" };
    
    switch (iconName?.toLowerCase()) {
      case 'award':
        return <Award {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      case 'trophy':
        return <Trophy {...iconProps} />;
      case 'star':
        return <Star {...iconProps} />;
      case 'book':
        return <BookOpen {...iconProps} />;
      case 'message':
        return <MessageSquare {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'heart':
        return <Heart {...iconProps} />;
      case 'calendar':
        return <CalendarDays {...iconProps} />;
      case 'sparkles':
        return <Sparkles {...iconProps} />;
      case 'git-pull-request':
        return <GitPullRequest {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };
  
  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'achievement':
        return 'text-blue-500';
      case 'contribution':
        return 'text-green-500';
      case 'milestone':
        return 'text-purple-500';
      case 'special':
        return 'text-yellow-500';
      case 'community':
        return 'text-pink-500';
      default:
        return 'text-gray-500';
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="flex flex-col items-center p-6 h-full">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-4" />
            <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }
  
  if (badges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No {type} badges found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {type === 'earned' 
              ? 'Keep participating to earn badges!' 
              : 'You have earned all available badges!'}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map(badge => (
          <Card key={badge.id} className="flex flex-col items-center p-6 h-full">
            <div className={`p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 ${getCategoryColor(badge.category)}`}>
              {getBadgeIcon(badge.icon)}
            </div>
            
            <h3 className="font-semibold text-center mb-2">{badge.name}</h3>
            
            {badge.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {badge.description}
              </p>
            )}
            
            {badge.category && (
              <Badge variant="outline" className="mt-3">
                {badge.category}
              </Badge>
            )}
            
            {badge.pointsRequired && type === 'available' && (
              <div className="mt-3 text-xs text-gray-500">
                {badge.pointsRequired} points required
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
};

export default BadgesSection;
