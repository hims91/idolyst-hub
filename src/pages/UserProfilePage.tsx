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
import { supabase } from '@/integrations/supabase/client';

const getUser = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data as User;
};

const followUser = async (userId: string): Promise<boolean> => {
  console.log('Following user:', userId);
  return true;
};

const unfollowUser = async (userId: string): Promise<boolean> => {
  console.log('Unfollowing user:', userId);
  return true;
};

const getUserPosts = async (userId: string): Promise<Post[]> => {
  return [];
};

const getUserFollowers = async (userId: string): Promise<User[]> => {
  return [];
};

const getUserFollowing = async (userId: string): Promise<User[]> => {
  return [];
};

const ProfileTab: React.FC<{ user: User; currentTab: string }> = ({ user, currentTab }) => {
  return <div>{/* Profile tab content */}</div>;
};

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');
  const [showFollowModal, setShowFollowModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const userData = await getUser(userId);
        if (!userData) {
          setError('User not found');
          setLoading(false);
          return;
        }
        
        setUser(userData);
        
        const userPosts = await getUserPosts(userId);
        setPosts(userPosts);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load user profile');
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);

  const handleFollow = async () => {
    if (!user) return;
    
    try {
      const success = await followUser(user.id);
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
    if (!user) return;
    
    try {
      const success = await unfollowUser(user.id);
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
      {/* ... keep existing code (user profile header) */}

      {/* ... keep existing code (user profile info) */}

      {/* ... keep existing code (tabs) */}

      {/* User Follow Modal */}
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
