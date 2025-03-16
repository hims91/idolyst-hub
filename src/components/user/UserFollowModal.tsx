
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { UserCog, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import * as userService from '@/services/userService';

interface UserFollowModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  activeTab?: 'followers' | 'following';
}

const UserFollowModal: React.FC<UserFollowModalProps> = ({
  userId,
  isOpen,
  onClose,
  activeTab = 'followers'
}) => {
  const [tab, setTab] = useState<'followers' | 'following'>(activeTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, tab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (tab === 'followers') {
        const data = await userService.getFollowers(userId);
        setFollowers(data);
      } else {
        const data = await userService.getFollowing(userId);
        setFollowing(data);
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to load ${tab}. Please try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userToFollowId: string) => {
    if (!auth.user) return;
    
    try {
      await userService.followUser(userToFollowId);
      
      toast({
        title: 'Success',
        description: 'You are now following this user',
      });
      
      // Update the followers list
      fetchUsers();
      
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to follow user. Please try again.',
      });
    }
  };

  const handleUnfollow = async (userToUnfollowId: string) => {
    if (!auth.user) return;
    
    try {
      await userService.unfollowUser(userToUnfollowId);
      
      toast({
        title: 'Success',
        description: 'You have unfollowed this user',
      });
      
      // Update the following list
      fetchUsers();
      
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to unfollow user. Please try again.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tab === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
          <DialogDescription>
            {tab === 'followers' 
              ? 'People who follow this user'
              : 'People this user follows'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'followers' | 'following')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : followers.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {followers.map((follower) => (
                  <div key={follower.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={follower.avatar} />
                        <AvatarFallback>
                          {follower.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium leading-none">{follower.name}</p>
                        {follower.role && (
                          <p className="text-sm text-muted-foreground">{follower.role}</p>
                        )}
                      </div>
                    </div>
                    {auth.user && auth.user.id !== follower.id && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => follower.isFollowing 
                          ? handleUnfollow(follower.id)
                          : handleFollow(follower.id)
                        }
                      >
                        {follower.isFollowing ? (
                          <>
                            <UserCheck className="mr-1 h-4 w-4" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserCog className="mr-1 h-4 w-4" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserX className="mx-auto h-12 w-12 mb-3 text-muted-foreground/60" />
                <p>No followers yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : following.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {following.map((follow) => (
                  <div key={follow.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={follow.avatar} />
                        <AvatarFallback>
                          {follow.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium leading-none">{follow.name}</p>
                        {follow.role && (
                          <p className="text-sm text-muted-foreground">{follow.role}</p>
                        )}
                      </div>
                    </div>
                    {auth.user && auth.user.id !== follow.id && (
                      <Button 
                        variant={follow.isFollowing ? "secondary" : "outline"} 
                        size="sm"
                        onClick={() => follow.isFollowing 
                          ? handleUnfollow(follow.id)
                          : handleFollow(follow.id)
                        }
                      >
                        {follow.isFollowing ? (
                          <>
                            <UserCheck className="mr-1 h-4 w-4" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserCog className="mr-1 h-4 w-4" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserX className="mx-auto h-12 w-12 mb-3 text-muted-foreground/60" />
                <p>Not following anyone yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserFollowModal;
