import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, UserBadge } from '@/types/gamification';
import { getAllBadges, getUserBadges } from '@/services/gamificationService';
import { useToast } from '@/hooks/use-toast';
import { Award, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BadgesSectionProps {
  type: 'available' | 'earned';
}

const BadgesSection: React.FC<BadgesSectionProps> = ({ type }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch all badges
        const badgesData = await getAllBadges();
        setBadges(badgesData);
        
        if (user) {
          // Fetch user badges
          const userBadgesData = await getUserBadges(user.id);
          setUserBadges(userBadgesData);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
        toast({
          title: "Error",
          description: "Failed to load badges. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBadges();
  }, [toast]);
  
  // Filter badges based on type (available or earned)
  const filteredBadges = React.useMemo(() => {
    if (type === 'earned') {
      return userBadges.map(ub => ub.badge);
    } else {
      const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
      return badges.filter(badge => !earnedBadgeIds.has(badge.id));
    }
  }, [badges, userBadges, type]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <Card key={index} className="border border-gray-200 animate-pulse">
            <CardHeader className="h-24 bg-gray-100"></CardHeader>
            <CardContent className="h-36 bg-gray-50"></CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (filteredBadges.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">
          {type === 'earned' ? 'No badges earned yet' : 'No available badges'}
        </h3>
        <p className="text-gray-500 mt-2">
          {type === 'earned' 
            ? 'Complete challenges and engage with the community to earn badges.' 
            : 'You\'ve earned all available badges. Check back later for new ones!'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredBadges.map((badge) => (
        <Card key={badge.id} className={`border ${type === 'earned' ? 'border-primary/50' : 'border-gray-200'}`}>
          <CardHeader className={`pb-4 ${type === 'earned' ? 'bg-primary/10' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">{badge.name}</CardTitle>
              {type === 'earned' && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </div>
            <CardDescription>{badge.category}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">{badge.description}</p>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 px-4 py-3 flex justify-between">
            <span className="text-sm font-medium">
              {type === 'earned' ? 'Earned' : `${badge.pointsRequired} points required`}
            </span>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default BadgesSection;
