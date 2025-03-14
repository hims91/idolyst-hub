
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Users, Mail, Link, Calendar, MapPin, Award, Building, AlertCircle } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import PostCard from '@/components/ui/PostCard';
import { Post, ProfileData } from '@/types/api';

// Mock data - replace with API calls
const mockUserProfile: ProfileData = {
  id: 'user1',
  name: 'Sarah Chen',
  role: 'Founder & CEO',
  avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen',
  bio: 'Serial entrepreneur with a passion for SaaS and B2B solutions. Previously founded and sold two startups in the marketing tech space.',
  company: 'GrowthGenius',
  location: 'San Francisco, CA',
  website: 'https://sarahchen.io',
  joinDate: '2022-09-15T00:00:00Z',
  followers: 1280,
  following: 350,
  posts: 24,
  socialLinks: {
    twitter: 'https://twitter.com/sarahchen',
    linkedin: 'https://linkedin.com/in/sarahchen',
    github: 'https://github.com/sarahchen'
  },
  skills: ['SaaS', 'Growth Marketing', 'Product Strategy', 'Fundraising', 'Team Building'],
  badges: [
    { 
      id: 'badge1', 
      name: 'Top Contributor', 
      description: 'Awarded to users whose content consistently receives high engagement',
      icon: 'award', 
      category: 'achievement' 
    },
    { 
      id: 'badge2', 
      name: 'Thought Leader', 
      description: 'Recognized for sharing valuable industry insights',
      icon: 'lightbulb', 
      category: 'expertise' 
    }
  ],
  isFollowing: false
};

const mockUserPosts: Post[] = [
  {
    id: '1',
    title: 'How I scaled my SaaS startup to 10,000 users in 6 months',
    content: 'When I first launched my SaaS product, I had no idea if anyone would use it...',
    author: {
      id: 'user1',
      name: 'Sarah Chen',
      role: 'Founder & CEO',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen',
    },
    category: 'Growth Strategies',
    upvotes: 247,
    downvotes: 5,
    commentCount: 42,
    timeAgo: '2d ago',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['saas', 'growth', 'marketing'],
  },
  {
    id: '2',
    title: 'Lessons from raising our $2M seed round',
    content: 'After 30+ investor meetings and countless pitch deck revisions...',
    author: {
      id: 'user1',
      name: 'Sarah Chen',
      role: 'Founder & CEO',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen',
    },
    category: 'Funding',
    upvotes: 189,
    downvotes: 2,
    commentCount: 28,
    timeAgo: '1w ago',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['fundraising', 'venture-capital', 'pitching'],
  }
];

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      setError(null);
      
      try {
        // In real implementation, fetch from API using userId
        setTimeout(() => {
          setProfile(mockUserProfile);
          setIsLoadingProfile(false);
        }, 800);
      } catch (err) {
        setError('Failed to load user profile. Please try again.');
        setIsLoadingProfile(false);
      }
    };

    const fetchUserPosts = async () => {
      setIsLoadingPosts(true);
      
      try {
        // In real implementation, fetch from API using userId
        setTimeout(() => {
          setPosts(mockUserPosts);
          setIsLoadingPosts(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setIsLoadingPosts(false);
      }
    };

    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [userId]);

  const handleFollowToggle = () => {
    if (!profile) return;
    
    const wasFollowing = profile.isFollowing;
    
    // Update local state
    setProfile(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        isFollowing: !prev.isFollowing,
        followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
      };
    });
    
    // Show toast
    toast({
      title: wasFollowing ? 'Unfollowed' : 'Following',
      description: wasFollowing 
        ? `You are no longer following ${profile.name}` 
        : `You are now following ${profile.name}`,
    });
    
    // In real implementation, send API request to follow/unfollow
  };

  const handleSendMessage = () => {
    if (!profile) return;
    
    // In real implementation, navigate to chat/message page
    toast({
      title: 'Message feature',
      description: `Messaging ${profile.name} is not implemented yet.`,
    });
  };

  if (isLoadingProfile) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="User Profile" />
          
          <main className="flex-1 container py-6 px-4 max-w-5xl">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Card className="overflow-hidden">
              <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-500" />
              
              <div className="relative px-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12">
                  <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
                  
                  <div className="space-y-1 flex-1 pt-4 md:pt-0">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Bio</h3>
                      <Skeleton className="h-20 w-full" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>

                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Badges & Achievements</h3>
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-16 w-24" />
                        <Skeleton className="h-16 w-24" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="py-4">
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="py-4">
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </PageTransition>
    );
  }

  if (error || !profile) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="User Profile" />
          
          <main className="flex-1 container py-6 px-4 max-w-5xl">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "We couldn't find the user you're looking for."}
              </p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title={profile.name} />
        
        <main className="flex-1 container py-6 px-4 max-w-5xl">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-500">
                <div className="absolute right-4 top-4 flex gap-2">
                  <Button 
                    variant={profile.isFollowing ? "default" : "outline"} 
                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={handleFollowToggle}
                  >
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={handleSendMessage}
                  >
                    Message
                  </Button>
                </div>
              </div>
              
              <div className="relative px-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12">
                  <UserAvatar 
                    name={profile.name} 
                    src={profile.avatar}
                    size="xl"
                    className="border-4 border-background relative"
                  />
                  
                  <div className="space-y-1 flex-1 pt-4 md:pt-0">
                    <h2 className="text-2xl md:text-3xl font-bold">{profile.name}</h2>
                    <p className="text-muted-foreground">{profile.role}</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Bio</h3>
                      <p className="text-muted-foreground">{profile.bio}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.company && (
                        <div className="flex items-center text-sm">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{profile.company}</span>
                        </div>
                      )}
                      
                      {profile.location && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      
                      {profile.website && (
                        <div className="flex items-center text-sm">
                          <Link className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a 
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Joined {new Date(profile.joinDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {profile.skills.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">Skills & Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-primary" />
                        Badges & Achievements
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.badges.map(badge => (
                          <div 
                            key={badge.id} 
                            className="flex flex-col items-center bg-primary/10 border border-primary/20 rounded-md p-2 w-24"
                            title={badge.description || badge.name}
                          >
                            <Award className="h-5 w-5 text-yellow-500 mb-1" />
                            <span className="text-xs font-medium text-center">{badge.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="py-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-2xl font-bold">{profile.posts}</div>
                            <div className="text-xs text-muted-foreground">Posts</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{profile.followers.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Followers</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{profile.following.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Following</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="py-4">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Connect
                        </h3>
                        <div className="flex flex-col space-y-3">
                          {Object.entries(profile.socialLinks).map(([platform, url]) => (
                            <a 
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="text-sm hover:underline flex items-center"
                            >
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-2">
                                <span className="capitalize">{platform.charAt(0)}</span>
                              </div>
                              <span className="capitalize">{platform}</span>
                            </a>
                          ))}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={handleSendMessage}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="posts" className="w-full mt-8">
              <TabsList className="flex w-full max-w-md mx-auto bg-muted">
                <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
                <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-6 space-y-6">
                {isLoadingPosts ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  posts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                    />
                  ))
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-lg">
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No posts yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      {profile.name} hasn't published any posts yet.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="comments" className="mt-6">
                <div className="text-center py-10 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No comments yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {profile.name} hasn't made any comments yet.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="saved" className="mt-6">
                <div className="text-center py-10 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Private content</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Saved items are private to each user.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default UserProfilePage;
