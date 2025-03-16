import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile as UserProfileType } from '@/types/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Trophy, Users, BookOpen, Calendar, MapPin, Globe, Mail } from 'lucide-react';
import { UserLevel, Badge as BadgeType } from '@/types/gamification';
import UserBadges from './UserBadges';
import UserChallenges from './UserChallenges';
import UserLevelProgress from './UserLevelProgress';
import { useToast } from '@/hooks/use-toast';
import { Post } from '@/types/api';
import PostCard from '@/components/ui/PostCard';

interface UserProfileProps {
  profile: UserProfileType;
  posts: Post[];
  userLevel?: UserLevel;
  badges?: BadgeType[];
  isOwnProfile?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  profile,
  posts,
  userLevel,
  badges = [],
  isOwnProfile = false,
  onFollow,
  onUnfollow
}) => {
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleEditProfile = () => {
    navigate('/profile/edit');
  };
  
  const handleFollowAction = () => {
    if (profile.isFollowing) {
      onUnfollow?.();
    } else {
      onFollow?.();
    }
  };
  
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-primary/20 to-primary/40">
          {isOwnProfile && (
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute right-4 top-4"
              onClick={handleEditProfile}
            >
              Edit Profile
            </Button>
          )}
        </div>
        
        <div className="relative px-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 flex-1 pt-4 md:pt-0">
              <h2 className="text-2xl md:text-3xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.role || 'Member'}</p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Website
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined {profile.joinedOn}</span>
                </div>
              </div>
            </div>
            
            {!isOwnProfile && (
              <Button
                variant={profile.isFollowing ? "secondary" : "default"}
                onClick={handleFollowAction}
                className="mt-4 md:mt-0"
              >
                {profile.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {/* Bio Section */}
              <div>
                <h3 className="font-medium mb-2">Bio</h3>
                <p className="text-muted-foreground">{profile.bio || 'No bio provided'}</p>
              </div>
              
              {/* Skills Section */}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Interests Section */}
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Gamification Level Progress */}
              {userLevel && (
                <UserLevelProgress userLevel={userLevel} />
              )}
            </div>
            
            <div className="space-y-4">
              {/* Stats Card */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Stats</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold">{posts.length}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{profile.followersCount}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{profile.followingCount}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{badges.length}</div>
                      <div className="text-xs text-muted-foreground">Badges</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact Card */}
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Contact</CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.email || 'Email not available'}</span>
                  </div>
                  
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        if (!profile.isFollowing && !isOwnProfile) {
                          toast({
                            title: "Cannot send message",
                            description: "You need to follow this user first",
                            variant: "destructive"
                          });
                          return;
                        }
                        navigate(`/messages/${profile.id}`);
                      }}
                    >
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Badges Preview Card */}
              {badges.length > 0 && (
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base flex items-center">
                      <Award className="h-4 w-4 mr-2 text-primary" />
                      Recent Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {badges.slice(0, 3).map(badge => (
                        <div 
                          key={badge.id} 
                          className="flex flex-col items-center bg-primary/10 border border-primary/20 rounded-md p-2 w-24"
                          title={badge.description}
                        >
                          <Trophy className="h-5 w-5 text-primary mb-1" />
                          <span className="text-xs font-medium text-center truncate w-full">{badge.name}</span>
                        </div>
                      ))}
                    </div>
                    
                    {badges.length > 3 && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="px-0 h-auto text-sm mt-2"
                        onClick={() => setActiveTab('badges')}
                      >
                        View all badges
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            {posts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {posts.slice(0, 4).map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={{
                      id: post.id,
                      title: post.title,
                      content: post.content,
                      author: {
                        id: post.author.id,
                        name: post.author.name,
                        avatar: post.author.avatar,
                        role: post.author.role || 'Member'
                      },
                      category: post.category,
                      createdAt: post.createdAt,
                      timeAgo: post.timeAgo,
                      upvotes: post.upvotes,
                      downvotes: post.downvotes,
                      commentCount: post.commentCount
                    }}
                    showCategory
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No posts yet.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="badges" className="mt-6">
          <UserBadges badges={badges} />
        </TabsContent>
        
        <TabsContent value="challenges" className="mt-6">
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Challenges</h2>
            <UserChallenges userId={profile.id} />
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Activity tracking coming soon</h3>
                <p className="text-muted-foreground">
                  We're working on activity tracking features. Check back soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
