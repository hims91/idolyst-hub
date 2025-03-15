
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from '@/types/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';
import userService from '@/services/userService';

export interface UserFollowModalProps {
  isOpen: boolean;
  userId: string;
  initialTab: 'followers' | 'following';
  userName: string;
  onClose: () => void;
}

const UserFollowModal: React.FC<UserFollowModalProps> = ({
  isOpen,
  userId,
  initialTab,
  userName,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { toast } = useToast();
  const { session } = useAuthSession();

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch followers
        const followerData = await userService.getUserFollowers(userId);
        setFollowers(followerData.users);
        setFollowerCount(followerData.totalCount);
        
        // Fetch following
        const followingData = await userService.getUserFollowing(userId);
        setFollowing(followingData.users);
        setFollowingCount(followingData.totalCount);
      } catch (error) {
        console.error('Error fetching follow data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load follow data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      fetchFollowData();
    }
  }, [userId, isOpen, toast]);

  const handleFollow = async (userToFollowId: string) => {
    if (!session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to follow users',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const success = await userService.followUser(session.user.id, userToFollowId);
      
      if (success) {
        // Update followers list
        setFollowers(prevFollowers => 
          prevFollowers.map(follower => 
            follower.id === userToFollowId 
              ? { ...follower, isFollowing: true }
              : follower
          )
        );
        
        // Update following list
        setFollowing(prevFollowing => 
          prevFollowing.map(following => 
            following.id === userToFollowId 
              ? { ...following, isFollowing: true }
              : following
          )
        );
        
        toast({
          title: 'Success',
          description: 'You are now following this user'
        });
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow user',
        variant: 'destructive'
      });
    }
  };

  const handleUnfollow = async (userToUnfollowId: string) => {
    if (!session?.user?.id) return;
    
    try {
      const success = await userService.unfollowUser(session.user.id, userToUnfollowId);
      
      if (success) {
        // Update followers list
        setFollowers(prevFollowers => 
          prevFollowers.map(follower => 
            follower.id === userToUnfollowId 
              ? { ...follower, isFollowing: false }
              : follower
          )
        );
        
        // Update following list
        setFollowing(prevFollowing => 
          prevFollowing.map(following => 
            following.id === userToUnfollowId 
              ? { ...following, isFollowing: false }
              : following
          )
        );
        
        toast({
          title: 'Success',
          description: 'You have unfollowed this user'
        });
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfollow user',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{userName}'s Network</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="followers">Followers ({followerCount})</TabsTrigger>
            <TabsTrigger value="following">Following ({followingCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-4">
            {isLoading ? (
              <div className="text-center py-4">Loading followers...</div>
            ) : followers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No followers yet</div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {followers.map(follower => (
                    <div key={follower.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={follower.avatar} alt={follower.name} />
                          <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{follower.name}</h4>
                          <p className="text-sm text-gray-500">{follower.role}</p>
                        </div>
                      </div>
                      
                      {session?.user?.id !== follower.id && (
                        follower.isFollowing ? (
                          <Button variant="outline" size="sm" onClick={() => handleUnfollow(follower.id)}>
                            Unfollow
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleFollow(follower.id)}>
                            Follow
                          </Button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            {isLoading ? (
              <div className="text-center py-4">Loading following...</div>
            ) : following.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Not following anyone yet</div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {following.map(following => (
                    <div key={following.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={following.avatar} alt={following.name} />
                          <AvatarFallback>{following.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{following.name}</h4>
                          <p className="text-sm text-gray-500">{following.role}</p>
                        </div>
                      </div>
                      
                      {session?.user?.id !== following.id && (
                        <Button variant="outline" size="sm" onClick={() => handleUnfollow(following.id)}>
                          Unfollow
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserFollowModal;
