import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import PostCard from '@/components/ui/PostCard';
import UserFollowModal from '@/components/user/UserFollowModal';
import { useToast } from '@/components/ui/use-toast';
import { User, Post } from '@/types/api';
import { MapPin, Briefcase, Globe, Calendar, Award, Settings, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthSession } from '@/hooks/useAuthSession';
import userService from '@/services/userService';

const ProfileTab: React.FC<{ user: User; currentTab: string }> = ({ user, currentTab }) => {
  return <div>{/* Profile tab content */}</div>;
};

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuthSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');
  const [showFollowModal, setShowFollowModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const userData = await userService.getUser(userId);
        if (!userData) {
          setError('User not found');
          setLoading(false);
          return;
        }
        
        setUser(userData);
        
        const userPosts = await userService.getUserPosts(userId);
        setPosts(userPosts);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load user profile');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const handleFollow = async () => {
    if (!user || !session?.user?.id) return;
    
    try {
      const success = await userService.followUser(session.user.id, user.id);
      if (success) {
        setUser(prev => prev ? { ...prev, isFollowing: true } : null);
        toast({
          title: "Success",
          description: `You are now following ${user.name}`,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async () => {
    if (!user || !session?.user?.id) return;
    
    try {
      const success = await userService.unfollowUser(session.user.id, user.id);
      if (success) {
        setUser(prev => prev ? { ...prev, isFollowing: false } : null);
        toast({
          title: "Success",
          description: `You have unfollowed ${user.name}`,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  const handleOpenFollowModal = (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setShowFollowModal(true);
  };

  const handleCloseFollowModal = () => {
    setShowFollowModal(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !user) {
    return <div>Error: {error || 'User not found'}</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="flex items-center space-x-2 text-gray-500">
              {user.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.company && (
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  <span>{user.company}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          {session?.user?.id !== user.id ? (
            user.isFollowing ? (
              <Button variant="outline" onClick={handleUnfollow}>Unfollow</Button>
            ) : (
              <Button onClick={handleFollow}>Follow</Button>
            )
          ) : (
            <Button asChild>
              <Link to="/settings">
                <Settings className="w-4 h-4 mr-2" />
                <span>Edit Profile</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-4">{user.bio || 'No bio available.'}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-1" />
                  <span>{user.role || 'Member'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-1" />
                  <span>Joined {format(new Date(user.joinDate || ''), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <div>
              <Button variant="secondary" onClick={() => handleOpenFollowModal('followers')}>
                {user.followers} Followers
              </Button>
              <Button variant="secondary" className="ml-2" onClick={() => handleOpenFollowModal('following')}>
                {user.following} Following
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            {/* Display Badges */}
            {/* <h3 className="text-lg font-semibold mb-2">Badges</h3>
            <div className="flex items-center space-x-2">
              <Badge>Early Supporter</Badge>
              <Badge>Active Contributor</Badge>
              <Badge>Community Leader</Badge>
            </div> */}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="projects">
          <div>No projects yet.</div>
        </TabsContent>
        <TabsContent value="events">
          <div>No events yet.</div>
        </TabsContent>
      </Tabs>

      {showFollowModal && (
        <UserFollowModal 
          isOpen={showFollowModal}
          userId={user.id} 
          initialTab={followModalType}
          userName={user.name}
          onClose={handleCloseFollowModal}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
