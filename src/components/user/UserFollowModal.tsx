
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from '@/types/api';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen, userId, activeTab]);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      // Implement actual data fetching here
      const data = Array(5).fill(null).map((_, i) => ({
        id: `user-${i}`,
        name: `Test User ${i}`,
        role: 'Developer',
        email: `test${i}@example.com`,
        avatar: undefined
      }));
      
      if (activeTab === 'followers') {
        setFollowers(data);
      } else {
        setFollowing(data);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'followers' | 'following');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = activeTab === 'followers' 
    ? followers.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : following.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {userName}'s {activeTab === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <div className="relative my-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9"
            />
          </div>
          
          <TabsContent value="followers" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No users match your search' : 'No followers yet'}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No users match your search' : 'Not following anyone yet'}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-gray-500">{user.role}</div>
        </div>
      </div>
      <Button variant="outline" size="sm">
        {user.isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
    </div>
  );
};

export default UserFollowModal;
