
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Shield, Code, Heart, Coffee, BookOpen, Zap } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description?: string;
  date?: string;
}

interface ProfileAchievementsProps {
  badges: Achievement[];
  level?: {
    level: number;
    title: string;
    points: number;
    nextLevel: number;
    progress: number;
  };
}

const ProfileAchievements: React.FC<ProfileAchievementsProps> = ({
  badges = [],
  level
}) => {
  const getIconComponent = (iconName: string) => {
    const iconProps = { className: "h-5 w-5" };
    switch (iconName.toLowerCase()) {
      case 'trophy': return <Trophy {...iconProps} />;
      case 'award': return <Award {...iconProps} />;
      case 'star': return <Star {...iconProps} />;
      case 'shield': return <Shield {...iconProps} />;
      case 'code': return <Code {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      case 'coffee': return <Coffee {...iconProps} />;
      case 'book': return <BookOpen {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      default: return <Award {...iconProps} />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Achievements & Badges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {level && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <h4 className="text-sm font-medium mr-2">Level {level.level}</h4>
              <Badge variant="secondary">{level.title}</Badge>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${level.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {level.points} / {level.nextLevel} XP to level {level.level + 1}
            </p>
          </div>
        )}
        
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className="flex flex-col items-center text-center p-3 bg-background rounded-md border"
              >
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                  {getIconComponent(badge.icon)}
                </div>
                <span className="text-sm font-medium">{badge.name}</span>
                {badge.description && (
                  <span className="text-xs text-muted-foreground mt-1">{badge.description}</span>
                )}
                {badge.date && (
                  <span className="text-xs text-muted-foreground mt-1">
                    Earned {new Date(badge.date).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No badges earned yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAchievements;
