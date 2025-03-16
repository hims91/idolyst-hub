
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import userService from '@/services/api/user';

export interface UserFollowModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const UserFollowModal: React.FC<UserFollowModalProps> = ({ userId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  
  const { data: followers, isLoading: followersLoading } = useQuery({
    queryKey: ['userFollowers', userId],
    queryFn: () => userService.getUserFollowers(userId),
    enabled: isOpen && activeTab === 'followers'
  });
  
  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: ['userFollowing', userId],
    queryFn: () => userService.getUserFollowing(userId),
    enabled: isOpen && activeTab === 'following'
  });
  
  const handleFollow = async (targetId: string) => {
    await userService.followUser(targetId);
  };
  
  const handleUnfollow = async (targetId: string) => {
    await userService.unfollowUser(targetId);
  };
  
  const renderUserList = (users: User[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="space-y-4 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    }
    
    if (!users || users.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No {activeTab} found
        </div>
      );
    }
    
    return (
      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name}</div>
                {user.role && (
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
            
            {user.id !== userId && (
              <Button 
                variant={user.isFollowing ? "outline" : "default"} 
                size="sm"
                onClick={() => user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
              >
                {user.isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers">
            {renderUserList(followers, followersLoading)}
          </TabsContent>
          
          <TabsContent value="following">
            {renderUserList(following, followingLoading)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserFollowModal;
