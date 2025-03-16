
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { Award, Star, Shield, Trophy, AlertCircle } from 'lucide-react';
import * as gamificationService from '@/services/gamificationService';

interface BadgesProps {
  type: 'available' | 'earned';
}

const BadgesSection: React.FC<BadgesProps> = ({ type }) => {
  const auth = useAuth();
  const { data: badges, isLoading, error } = useQuery({
    queryKey: ['user-badges', auth.user?.id],
    queryFn: () => gamificationService.getUserBadges(auth.user?.id || ''),
    enabled: !!auth.user?.id,
  });

  // Mock available badges (in a real app, this would come from the API)
  const availableBadges = [
    {
      id: 'badge-1',
      name: 'First Post',
      description: 'Create your first post',
      icon: 'award',
      category: 'participation'
    },
    {
      id: 'badge-2',
      name: 'Social Butterfly',
      description: 'Follow 10 users',
      icon: 'users',
      category: 'social'
    },
    {
      id: 'badge-3',
      name: 'Event Attender',
      description: 'Attend your first event',
      icon: 'calendar',
      category: 'events'
    },
    {
      id: 'badge-4',
      name: 'Commenter',
      description: 'Leave 5 comments',
      icon: 'message-square',
      category: 'engagement'
    },
    {
      id: 'badge-5',
      name: 'Upvoter',
      description: 'Upvote 20 posts',
      icon: 'thumbs-up',
      category: 'engagement'
    }
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'award': return <Award className="h-8 w-8" />;
      case 'star': return <Star className="h-8 w-8" />;
      case 'shield': return <Shield className="h-8 w-8" />;
      case 'trophy': return <Trophy className="h-8 w-8" />;
      default: return <Award className="h-8 w-8" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
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
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            There was an error loading badges. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayBadges = type === 'earned' ? badges : availableBadges;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === 'earned' ? 'Earned Badges' : 'Available Badges'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="participation">Participation</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {displayBadges && displayBadges.length > 0 ? (
                displayBadges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center text-center p-4 border rounded-md">
                    <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                      {getIconComponent(badge.icon)}
                    </div>
                    <h3 className="font-medium">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {badge.description}
                    </p>
                    {type === 'earned' && 'earnedAt' in badge && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {type === 'earned' ? 'No badges earned yet' : 'No badges available'}
                  </h3>
                  <p className="text-muted-foreground">
                    {type === 'earned' 
                      ? 'Complete challenges and stay active to earn badges.' 
                      : 'Check back later for new badges to earn.'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {['participation', 'social', 'events', 'engagement'].map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayBadges && displayBadges.filter(b => b.category === category).length > 0 ? (
                  displayBadges
                    .filter(b => b.category === category)
                    .map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center text-center p-4 border rounded-md">
                        <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                          {getIconComponent(badge.icon)}
                        </div>
                        <h3 className="font-medium">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {badge.description}
                        </p>
                        {type === 'earned' && 'earnedAt' in badge && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No {category} badges {type === 'earned' ? 'earned' : 'available'}
                    </h3>
                    <p className="text-muted-foreground">
                      {type === 'earned'
                        ? `Complete ${category} activities to earn badges in this category.`
                        : `Check back later for new ${category} badges to earn.`}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BadgesSection;
