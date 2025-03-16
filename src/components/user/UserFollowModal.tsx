
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useToast } from '@/components/ui/use-toast';

interface UserFollowModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  type?: 'followers' | 'following';
}

const UserFollowModal: React.FC<UserFollowModalProps> = ({
  userId,
  isOpen,
  onClose,
  type = 'followers'
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(type);
  const auth = useAuthSession();
  const { toast } = useToast();
  const currentUserIsAuthenticated = auth?.isValidSession || false;

  const { data: followers, isLoading: followersLoading } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => userService.getFollowers(userId),
    enabled: isOpen && activeTab === 'followers'
  });

  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => userService.getFollowing(userId),
    enabled: isOpen && activeTab === 'following'
  });

  const handleFollow = async (targetUserId: string) => {
    if (!currentUserIsAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive"
      });
      return;
    }

    try {
      await userService.followUser(targetUserId);
      toast({
        title: "Success",
        description: "You are now following this user"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive"
      });
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    if (!currentUserIsAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to unfollow users",
        variant: "destructive"
      });
      return;
    }

    try {
      await userService.unfollowUser(targetUserId);
      toast({
        title: "Success",
        description: "You have unfollowed this user"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {activeTab === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-4">
            {followersLoading ? (
              <div className="flex justify-center p-4">
                <Spinner />
              </div>
            ) : followers && followers.length > 0 ? (
              <div className="space-y-4">
                {followers.map(follower => (
                  <div key={follower.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={follower.avatar} />
                        <AvatarFallback>{follower.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{follower.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{follower.bio || 'No bio'}</p>
                      </div>
                    </div>
                    
                    {currentUserIsAuthenticated && (
                      <Button 
                        size="sm" 
                        variant={follower.isFollowing ? "outline" : "default"}
                        onClick={() => follower.isFollowing 
                          ? handleUnfollow(follower.id) 
                          : handleFollow(follower.id)
                        }
                      >
                        {follower.isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-4">No followers yet</p>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            {followingLoading ? (
              <div className="flex justify-center p-4">
                <Spinner />
              </div>
            ) : following && following.length > 0 ? (
              <div className="space-y-4">
                {following.map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{user.bio || 'No bio'}</p>
                      </div>
                    </div>
                    
                    {currentUserIsAuthenticated && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUnfollow(user.id)}
                      >
                        Unfollow
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-4">Not following anyone yet</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserFollowModal;
