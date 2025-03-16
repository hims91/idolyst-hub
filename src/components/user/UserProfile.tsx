
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import UserFollowModal from './UserFollowModal';
import UserChallenges from './UserChallenges';
import ProfileHeader from '../profile/ProfileHeader';
import ProfileSkills from '../profile/ProfileSkills';
import ProfileAchievements from '../profile/ProfileAchievements';
import ProfileEditForm from '../profile/ProfileEditForm';
import { getUserProfile, getUserPosts, followUser, unfollowUser } from '@/services/userService';
import { getUserLevel, getUserBadges } from '@/services/gamificationService';

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const auth = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });

  const { data: userLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['user-level', userId],
    queryFn: () => getUserLevel(userId),
    enabled: !!userId,
  });

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: () => getUserBadges(userId),
    enabled: !!userId,
  });

  const isOwnProfile = auth.user?.id === userId;

  const handleFollow = async () => {
    if (!userId || !auth.user) return;
    
    try {
      await followUser(userId);
      
      toast({
        title: 'Followed successfully',
        description: 'You are now following this user',
      });
      
      refetchProfile();
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to follow user. Please try again.',
      });
    }
  };

  const handleUnfollow = async () => {
    if (!userId || !auth.user) return;
    
    try {
      await unfollowUser(userId);
      
      toast({
        title: 'Unfollowed successfully',
        description: 'You are no longer following this user',
      });
      
      refetchProfile();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to unfollow user. Please try again.',
      });
    }
  };

  const handleProfileSave = async (formData: any) => {
    // In a real application, this would send the data to the API
    console.log('Saving profile data:', formData);
    
    // Mock implementation
    setTimeout(() => {
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
      refetchProfile();
    }, 1000);
  };

  const openFollowersModal = () => {
    setModalType('followers');
    setIsFollowModalOpen(true);
  };

  const openFollowingModal = () => {
    setModalType('following');
    setIsFollowModalOpen(true);
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground">The user you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  if (isEditing && isOwnProfile) {
    return (
      <div className="space-y-6">
        <ProfileEditForm
          initialData={{
            name: profile.name,
            email: profile.email,
            bio: profile.bio || '',
            location: profile.location || '',
            website: profile.website || '',
            company: profile.company || '',
            skills: [], // These would come from the API in a real implementation
            interests: [], // These would come from the API in a real implementation
          }}
          onSubmit={handleProfileSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader
        user={{
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          role: profile.role,
        }}
        profileData={profile}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => setIsEditing(true)}
        isFollowing={profile.isFollowing}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        followersCount={profile.followersCount}
        followingCount={profile.followingCount}
        onFollowersClick={openFollowersModal}
        onFollowingClick={openFollowingModal}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-6">
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{post.content}</p>
                      <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                        <span>{post.timeAgo}</span>
                        <div className="flex items-center space-x-2">
                          <span>{post.upvotes - post.downvotes} votes</span>
                          <span>•</span>
                          <span>{post.commentCount} comments</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts yet.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="challenges" className="mt-6">
              <UserChallenges userId={userId} isOwnProfile={isOwnProfile} />
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-6">
              {badgesLoading || levelLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : (
                <ProfileAchievements
                  badges={badges || []}
                  level={userLevel}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <ProfileSkills
            skills={profile.skills || []}
            interests={[]} // These would come from the API in a real implementation
          />
          
          <ProfileAchievements
            badges={badges || []}
            level={userLevel}
          />
        </div>
      </div>
      
      <UserFollowModal 
        userId={userId}
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        activeTab={modalType}
      />
    </div>
  );
};

export default UserProfile;
