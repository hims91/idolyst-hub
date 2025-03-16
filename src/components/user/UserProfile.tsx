import React from 'react';
import { 
  UserProfile as UserProfileType, 
  Post 
} from '@/types/api';
import { 
  UserLevel, 
  Badge as BadgeType 
} from '@/types/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Link,
  Briefcase,
  Calendar,
  Twitter,
  Linkedin,
  Github,
  Globe,
  Users,
  User,
  Award,
  FileText,
  MessageSquare,
} from 'lucide-react';
import PostCard from '@/components/ui/PostCard';
import UserChallenges from './UserChallenges';

export interface UserProfileProps {
  profile: UserProfileType;
  posts: Post[];
  userLevel: UserLevel;
  badges: BadgeType[];
  isOwnProfile: boolean;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  profile,
  posts,
  userLevel,
  badges,
  isOwnProfile,
  onFollow,
  onUnfollow,
  onFollowersClick,
  onFollowingClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader className="relative pb-0">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center mt-2">
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <p className="text-muted-foreground">{profile.role || "Community Member"}</p>

              {!isOwnProfile && (
                <Button 
                  variant={profile.isFollowing ? "outline" : "default"}
                  size="sm"
                  className="mt-2"
                  onClick={profile.isFollowing ? onUnfollow : onFollow}
                >
                  {profile.isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}

              <div className="mt-3 flex justify-center">
                <Badge variant="outline" className="flex gap-1 py-1.5">
                  <Award className="h-3.5 w-3.5" />
                  <span>Level {userLevel.level} - {userLevel.title}</span>
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4 mt-1">
              <div className="flex justify-between text-xs mb-1">
                <span>{userLevel.pointsRequired} points</span>
                <span>{userLevel.pointsRequired + userLevel.pointsToNextLevel} points</span>
              </div>
              <Progress value={userLevel.progressPercentage} className="h-2" />
              <div className="flex justify-center text-xs text-muted-foreground mt-1">
                {userLevel.pointsToNextLevel} points to next level
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm mb-4">{profile.bio}</p>
            )}

            <div className="space-y-2 text-sm">
              {profile.company && (
                <div className="flex gap-2">
                  <Briefcase className="h-4 w-4 opacity-70" />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 opacity-70" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex gap-2">
                  <Link className="h-4 w-4 opacity-70" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex gap-2">
                <Calendar className="h-4 w-4 opacity-70" />
                <span>Joined {profile.joinedOn}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 border-t pt-3">
              <button onClick={onFollowersClick} className="text-center p-2 hover:bg-gray-50 rounded-md">
                <div className="font-semibold">{profile.followersCount}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </button>
              <button onClick={onFollowingClick} className="text-center p-2 hover:bg-gray-50 rounded-md">
                <div className="font-semibold">{profile.followingCount}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </button>
              <div className="text-center p-2">
                <div className="font-semibold">{posts.length}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>

            {profile.socialLinks && (
              <div className="flex gap-2 justify-center mt-4 border-t pt-3">
                {profile.socialLinks.twitter && (
                  <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" 
                    className="p-2 hover:bg-gray-100 rounded-full">
                    <Twitter size={16} />
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-full">
                    <Linkedin size={16} />
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-full">
                    <Github size={16} />
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-full">
                    <Globe size={16} />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" /> Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No badges earned yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {badges.slice(0, 6).map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center p-2 border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-xs font-medium text-center">{badge.name}</div>
                  </div>
                ))}
                {badges.length > 6 && (
                  <div className="flex flex-col items-center p-2 border rounded-lg">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <span className="text-sm font-medium">+{badges.length - 6}</span>
                    </div>
                    <div className="text-xs font-medium text-center">More</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 space-y-6">
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts" className="flex gap-1">
              <FileText className="h-4 w-4" /> Posts
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex gap-1">
              <Award className="h-4 w-4" /> Challenges
            </TabsTrigger>
            <TabsTrigger value="about" className="flex gap-1">
              <User className="h-4 w-4" /> About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="pt-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center p-6">
                  <MessageSquare className="h-10 w-10 text-muted-foreground opacity-20 mx-auto mb-3" />
                  <p className="text-muted-foreground">No posts yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      id: post.id,
                      title: post.title,
                      content: post.content,
                      author: {
                        id: post.author.id,
                        name: post.author.name,
                        avatar: post.author.avatar || '',
                        role: post.author.role || 'Member',
                      },
                      category: post.category,
                      createdAt: post.createdAt,
                      timeAgo: post.timeAgo,
                      upvotes: post.upvotes,
                      downvotes: post.downvotes,
                      commentCount: post.commentCount,
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="pt-4">
            <UserChallenges userId={profile.id} />
          </TabsContent>

          <TabsContent value="about" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About {profile.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio ? (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Bio</h3>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No bio available</p>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-1">
                      {profile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
