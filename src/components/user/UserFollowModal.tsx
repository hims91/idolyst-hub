
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/ui/UserAvatar';
import { UserConnection } from '@/types/api';

// Mock data - will be replaced with API calls
const mockFollowers: UserConnection[] = [
  {
    id: 'user1',
    name: 'John Doe',
    role: 'Product Manager',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    company: 'TechCorp',
    isFollowing: true,
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    role: 'Startup Founder',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    company: 'SmartStartup',
    isFollowing: false,
  },
];

const mockFollowing: UserConnection[] = [
  {
    id: 'user3',
    name: 'Alex Johnson',
    role: 'Angel Investor',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson',
    company: 'Johnson Ventures',
    isFollowing: true,
  },
  {
    id: 'user4',
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen',
    company: 'GrowthGenius',
    isFollowing: true,
  },
];

interface UserFollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: 'followers' | 'following';
}

const UserFollowModal = ({ isOpen, onClose, userId, initialTab = 'followers' }: UserFollowModalProps) => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = React.useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = React.useState<UserConnection[]>([]);
  const [following, setFollowing] = React.useState<UserConnection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFollowData = async () => {
      setIsLoading(true);
      
      try {
        // In real implementation, fetch from API based on userId
        setTimeout(() => {
          setFollowers(mockFollowers);
          setFollowing(mockFollowing);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching follow data:', error);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchFollowData();
    }
  }, [isOpen, userId]);

  const toggleFollow = (user: UserConnection) => {
    // Update the user's follow status in the appropriate list
    if (currentTab === 'followers') {
      setFollowers(followers.map(f => 
        f.id === user.id ? { ...f, isFollowing: !f.isFollowing } : f
      ));
    } else {
      setFollowing(following.map(f => 
        f.id === user.id ? { ...f, isFollowing: !f.isFollowing } : f
      ));
    }
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/user/${userId}`);
    onClose();
  };

  const renderUserList = (users: UserConnection[]) => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ));
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No users found.
        </div>
      );
    }

    return users.map(user => (
      <div key={user.id} className="flex items-center justify-between p-3 border-b last:border-0">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigateToProfile(user.id)}
        >
          <UserAvatar name={user.name} src={user.avatar} size="md" />
          <div>
            <h4 className="font-medium">{user.name}</h4>
            <p className="text-xs text-muted-foreground">
              {user.role}{user.company ? ` at ${user.company}` : ''}
            </p>
          </div>
        </div>
        <Button 
          variant={user.isFollowing ? "outline" : "default"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleFollow(user);
          }}
        >
          {user.isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>
        
        <Tabs 
          defaultValue={initialTab} 
          value={currentTab}
          onValueChange={(value) => setCurrentTab(value as 'followers' | 'following')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="max-h-[50vh] overflow-y-auto">
            {renderUserList(followers)}
          </TabsContent>
          
          <TabsContent value="following" className="max-h-[50vh] overflow-y-auto">
            {renderUserList(following)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserFollowModal;
