
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing, followUser, unfollowUser } from '@/services/userService';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/api';

interface UserFollowModalProps {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

const UserFollowModal = ({ userId, type, isOpen, onClose }: UserFollowModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useAuthSession();
  const isAuthenticated = Boolean(auth?.isValidSession);
  const currentUserId = auth?.isValidSession ? auth.session?.user.id : null;

  const { data, isLoading, refetch } = useQuery({
    queryKey: [type, userId],
    queryFn: () => type === 'followers' ? getFollowers(userId) : getFollowing(userId),
    enabled: isOpen,
  });

  const handleFollowToggle = async (user: User) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (user.isFollowing) {
        await unfollowUser(user.id);
        toast({
          title: "Unfollowed",
          description: `You no longer follow ${user.name}`,
        });
      } else {
        await followUser(user.id);
        toast({
          title: "Following",
          description: `You are now following ${user.name}`,
        });
      }
      refetch();
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const navigateToProfile = (id: string) => {
    navigate(`/user/${id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : data && data.length > 0 ? (
            <ul className="space-y-4">
              {data.map((user) => (
                <li key={user.id} className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded-md flex-grow"
                    onClick={() => navigateToProfile(user.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {isAuthenticated && user.id !== currentUserId && (
                    <Button 
                      variant={user.isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollowToggle(user);
                      }}
                    >
                      {user.isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserFollowModal;
