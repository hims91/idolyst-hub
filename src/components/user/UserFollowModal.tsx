
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import userService from '@/services/api/user';
import { User } from '@/types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

export interface UserFollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

const UserFollowModal: React.FC<UserFollowModalProps> = ({ 
  isOpen, 
  onClose, 
  userId,
  type 
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(type);
  const { toast } = useToast();
  
  const { data: followers, isLoading: followersLoading } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => userService.getUserFollowers(userId),
    enabled: isOpen
  });

  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => userService.getUserFollowing(userId),
    enabled: isOpen
  });

  useEffect(() => {
    setActiveTab(type);
  }, [type]);

  const handleFollow = async (targetUserId: string) => {
    try {
      await userService.followUser(targetUserId);
      toast({
        title: "Success",
        description: "User followed successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      await userService.unfollowUser(targetUserId);
      toast({
        title: "Success",
        description: "User unfollowed successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activeTab === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'followers' | 'following')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="space-y-4 mt-4 max-h-96 overflow-y-auto">
            {followersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : followers && followers.length > 0 ? (
              followers.map((follower) => (
                <UserItem 
                  key={follower.id}
                  user={follower}
                  isFollowing={follower.isFollowing}
                  onFollow={() => handleFollow(follower.id)}
                  onUnfollow={() => handleUnfollow(follower.id)}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No followers yet.</p>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="space-y-4 mt-4 max-h-96 overflow-y-auto">
            {followingLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : following && following.length > 0 ? (
              following.map((followedUser) => (
                <UserItem 
                  key={followedUser.id}
                  user={followedUser}
                  isFollowing={true}
                  onFollow={() => handleFollow(followedUser.id)}
                  onUnfollow={() => handleUnfollow(followedUser.id)}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Not following anyone yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface UserItemProps {
  user: User;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, isFollowing, onFollow, onUnfollow }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.name}</p>
          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-1">{user.bio}</p>
          )}
        </div>
      </div>
      
      {isFollowing ? (
        <Button variant="outline" size="sm" onClick={onUnfollow}>
          <UserMinus className="h-4 w-4 mr-1" />
          Unfollow
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={onFollow}>
          <UserPlus className="h-4 w-4 mr-1" />
          Follow
        </Button>
      )}
    </div>
  );
};

export default UserFollowModal;
