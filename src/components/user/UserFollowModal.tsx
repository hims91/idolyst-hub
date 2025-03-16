
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import userService from '@/services/api/user';
import { User } from '@/types/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export interface UserFollowModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const UserFollowModal: React.FC<UserFollowModalProps> = ({ userId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      let data: User[];
      if (activeTab === 'followers') {
        data = await userService.getUserFollowers(userId);
      } else {
        data = await userService.getUserFollowing(userId);
      }
      setUsers(data || []);
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'followers' | 'following');
  };

  const handleFollowToggle = async (targetUserId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(targetUserId);
      } else {
        await userService.followUser(targetUserId);
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === targetUserId 
            ? { ...user, isFollowing: !isFollowing } 
            : user
        )
      );
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center mb-4">
            {activeTab === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <div className="px-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {activeTab === 'followers' 
                  ? 'No followers yet' 
                  : 'Not following anyone yet'}
              </p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {users.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        {user.bio && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollowToggle(user.id, !!user.isFollowing)}
                    >
                      {user.isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserFollowModal;
