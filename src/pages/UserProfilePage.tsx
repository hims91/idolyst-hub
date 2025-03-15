
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PostCard } from '@/components/ui/PostCard';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/services/api/types';
import { motion } from 'framer-motion';
import UserFollowModal from '@/components/user/UserFollowModal';
import { CalendarDays, GlobeIcon, Twitter, Linkedin, Github, MapPin, Building, Users, Award, Activity } from 'lucide-react';

// Mock user data
const mockUserData: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  role: 'Founder & CEO',
  avatar: '/images/avatars/alex.jpg',
  email: 'alex@technova.io',
  company: 'TechNova Solutions',
  bio: 'Serial entrepreneur with 10+ years experience in SaaS and AI.',
  location: 'San Francisco, CA',
  website: 'technova.io',
  joinDate: 'Jan 2023',
  badges: [
    { id: 'badge-1', name: 'Verified Founder', icon: 'user' },
    { id: 'badge-2', name: 'Top Contributor', icon: 'award' }
  ],
  skills: ['AI/ML', 'Growth Strategy', 'Fundraising'],
  followers: 1420,
  following: 358,
  posts: 47,
  startups: 3,
  investments: 12,
  socialLinks: {
    twitter: 'alexjtechceo',
    linkedin: 'alexjohnson',
    github: 'alexjtech',
  },
  isFollowing: false,
};

// Mock posts data
const mockPosts = [
  {
    id: 'post-1',
    title: 'How I built a 7-figure SaaS with zero funding',
    excerpt: 'Bootstrapping in the early stages forced us to focus on revenue, not vanity metrics...',
    upvotes: 342,
    comments: 56,
    timeAgo: '2d ago',
    author: { name: 'Alex Johnson', avatar: '/images/avatars/alex.jpg', role: 'Founder & CEO' },
    tags: ['saas', 'bootstrapping', 'entrepreneurship'],
    saved: false,
  },
  {
    id: 'post-2',
    title: 'Three mistakes I made raising our Series A',
    excerpt: 'In hindsight, I would have approached the fundraising process differently...',
    upvotes: 289,
    comments: 42,
    timeAgo: '1w ago',
    author: { name: 'Alex Johnson', avatar: '/images/avatars/alex.jpg', role: 'Founder & CEO' },
    tags: ['fundraising', 'venture-capital', 'startups'],
    saved: false,
  },
];

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      
      try {
        // In real implementation, fetch from API based on userId
        setTimeout(() => {
          setUser(mockUserData);
          setPosts(mockPosts);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId, toast]);
  
  const handleFollow = async () => {
    if (!user) return;
    
    setIsFollowLoading(true);
    
    try {
      // In real implementation, call an API to follow user
      setTimeout(() => {
        setUser(prev => {
          if (!prev) return prev;
          
          // Update following state and counts
          return {
            ...prev,
            isFollowing: !prev.isFollowing,
            followers: prev.isFollowing ? prev.followers! - 1 : prev.followers! + 1,
          };
        });
        
        toast({
          title: user.isFollowing ? 'Unfollowed' : 'Followed',
          description: user.isFollowing 
            ? `You unfollowed ${user.name}` 
            : `You are now following ${user.name}`,
        });
        
        setIsFollowLoading(false);
      }, 600);
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
      setIsFollowLoading(false);
    }
  };
  
  const handleSavePost = (postId: string) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId ? { ...post, saved: !post.saved } : post
      )
    );
    
    const post = posts.find(p => p.id === postId);
    toast({
      title: post?.saved ? 'Post removed' : 'Post saved',
      description: post?.saved 
        ? 'Post removed from your saved items' 
        : 'Post added to your saved items',
    });
  };
  
  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Header title="User Profile" />
          <div className="container py-6 px-4 max-w-5xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-muted-foreground">Loading user profile...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Header title="User Not Found" />
          <div className="container py-6 px-4 max-w-5xl">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The user you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Header title={user.name} />
        
        <main className="container py-6 px-4 max-w-5xl">
          <div className="w-full border-b pb-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 md:items-end">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.role}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleFollow}
                      disabled={isFollowLoading}
                      variant={user.isFollowing ? "outline" : "default"}
                    >
                      {isFollowLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : user.isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                    
                    <Button variant="outline">Message</Button>
                    <Button variant="ghost" size="icon">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  {user.badges?.map(badge => (
                    <Badge key={badge.id} variant="secondary" className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {badge.name}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-8 mt-4">
                  <div 
                    className="flex items-center cursor-pointer hover:text-primary transition-colors" 
                    onClick={() => setShowFollowModal('followers')}
                  >
                    <span className="font-bold mr-1">{user.followers}</span> 
                    Followers
                  </div>
                  <div 
                    className="flex items-center cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setShowFollowModal('following')}
                  >
                    <span className="font-bold mr-1">{user.following}</span> 
                    Following
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold mr-1">{user.posts}</span> 
                    Posts
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold mr-1">{user.startups}</span> 
                    Startups
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold mr-1">{user.investments}</span> 
                    Investments
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-1">About</h3>
                      <p className="text-sm text-muted-foreground">{user.bio}</p>
                    </div>
                    
                    <Separator />
                    
                    {user.company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.company}</span>
                      </div>
                    )}
                    
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.location}</span>
                      </div>
                    )}
                    
                    {user.website && (
                      <div className="flex items-center gap-2">
                        <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                        <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          {user.website}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Joined {user.joinDate}</span>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills?.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">Social</h3>
                      <div className="flex gap-2">
                        {user.socialLinks?.twitter && (
                          <a 
                            href={`https://twitter.com/${user.socialLinks.twitter}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                        
                        {user.socialLinks?.linkedin && (
                          <a 
                            href={`https://linkedin.com/in/${user.socialLinks.linkedin}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        
                        {user.socialLinks?.github && (
                          <a 
                            href={`https://github.com/${user.socialLinks.github}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="startups">Startups</TabsTrigger>
                  <TabsTrigger value="investments">Investments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="posts" className="space-y-6">
                  {posts.length > 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {posts.map(post => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onSave={() => handleSavePost(post.id)}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {userId ? `${user.name} hasn't published any posts yet.` : "You haven't published any posts yet."}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="startups" className="space-y-6">
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      The startups feature is currently in development and will be available soon.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="investments" className="space-y-6">
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      The investments feature is currently in development and will be available soon.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        
        {showFollowModal && (
          <UserFollowModal
            type={showFollowModal}
            userId={user.id}
            userName={user.name}
            onClose={() => setShowFollowModal(null)}
            size="md"
          />
        )}
      </div>
    </PageTransition>
  );
};

export default UserProfilePage;
