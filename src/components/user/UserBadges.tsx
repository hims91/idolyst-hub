
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeType } from '@/types/gamification';
import { Award, Trophy, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UserBadgesProps {
  badges: BadgeType[];
}

const UserBadges: React.FC<UserBadgesProps> = ({ badges }) => {
  // Group badges by category
  const groupedBadges = badges.reduce((acc, badge) => {
    const category = badge.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, BadgeType[]>);

  const getIconForBadge = (badge: BadgeType) => {
    switch (badge.icon) {
      case 'trophy':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'shield':
        return <Shield className="h-6 w-6 text-blue-500" />;
      default:
        return <Award className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Badges & Achievements</h2>
      
      {Object.keys(groupedBadges).length > 0 ? (
        Object.entries(groupedBadges).map(([category, categoryBadges]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryBadges.map(badge => (
                  <div key={badge.id} className="border rounded-lg p-4 flex flex-col items-center text-center">
                    <div className="mb-2">
                      {getIconForBadge(badge)}
                    </div>
                    <h3 className="font-medium">{badge.name}</h3>
                    
                    {badge.description && (
                      <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                    )}
                    
                    {!badge.isEarned && badge.pointsRequired && badge.progress !== undefined && (
                      <div className="w-full mt-2">
                        <Progress value={(badge.progress / badge.pointsRequired) * 100} className="h-2" />
                        <p className="text-xs mt-1 text-muted-foreground">
                          {badge.progress} / {badge.pointsRequired} points
                        </p>
                      </div>
                    )}
                    
                    {badge.isEarned && badge.earnedAt && (
                      <p className="text-xs mt-2 text-muted-foreground">
                        Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No badges yet</h3>
            <p className="text-muted-foreground">
              Complete challenges and engage with the community to earn badges!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserBadges;
