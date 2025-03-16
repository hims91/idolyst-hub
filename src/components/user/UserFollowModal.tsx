
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getFollowers, getFollowing, followUser, unfollowUser } from '@/services/userService';
import { User } from '@/types/api';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserFollowModalProps {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

const UserFollowModal: React.FC<UserFollowModalProps> = ({
  userId,
  type,
  isOpen,
  onClose
}) => {
  const auth = useAuthSession();
  const isAuthenticated = Boolean(auth?.isValidSession);
  const currentUserId = auth?.userId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: [`user-${type}`, userId],
    queryFn: () => type === 'followers' ? getFollowers(userId) : getFollowing(userId),
    enabled: isOpen,
    onSuccess: (data) => {
      // Set initial follow status
      const statusMap: Record<string, boolean> = {};
      data.forEach(user => {
        statusMap[user.id] = Boolean(user.isFollowing);
      });
      setFollowStatus(statusMap);
    }
  });

  const handleFollowToggle = async (user: User) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to follow users',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (followStatus[user.id]) {
        await unfollowUser(user.id);
        setFollowStatus(prev => ({ ...prev, [user.id]: false }));
        toast({
          title: 'Unfollowed',
          description: `You no longer follow ${user.name}`
        });
      } else {
        await followUser(user.id);
        setFollowStatus(prev => ({ ...prev, [user.id]: true }));
        toast({
          title: 'Following',
          description: `You are now following ${user.name}`
        });
      }
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive'
      });
    }
  };

  const navigateToProfile = (userId: string) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {users && users.length > 0 ? (
              <ul className="space-y-4">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 cursor-pointer" 
                      onClick={() => navigateToProfile(user.id)}
                    >
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        {user.role && (
                          <p className="text-sm text-muted-foreground">{user.role}</p>
                        )}
                      </div>
                    </div>
                    
                    {currentUserId !== user.id && (
                      <Button
                        variant={followStatus[user.id] ? 'secondary' : 'default'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(user);
                        }}
                      >
                        {followStatus[user.id] ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                No {type} found
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserFollowModal;
