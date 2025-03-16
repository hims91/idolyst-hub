
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import UserProfile from '@/components/user/UserProfile';
import UserFollowModal from '@/components/user/UserFollowModal';
import { getUserProfile, getUserPosts } from '@/services/userService';
import gamificationService from '@/services/gamificationService';
import userService from '@/services/api/user';

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const auth = useAuth();
  const { toast } = useToast();
  const [followModal, setFollowModal] = useState<{
    isOpen: boolean;
    type: 'followers' | 'following';
  }>({
    isOpen: false,
    type: 'followers',
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId || ''),
    enabled: !!userId,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => getUserPosts(userId || ''),
    enabled: !!userId,
  });

  const { data: userLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['userLevel', userId],
    queryFn: () => gamificationService.getUserLevel(userId || ''),
    enabled: !!userId,
  });

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['userBadges', userId],
    queryFn: () => gamificationService.getUserBadges(userId || ''),
    enabled: !!userId,
  });

  const isOwnProfile = auth.user?.id === userId;

  const handleUnfollow = async () => {
    if (!userId || !auth.user) return;
    
    try {
      await userService.unfollowUser(userId);
      
      toast({
        title: 'Unfollowed successfully',
        description: 'You are no longer following this user',
      });
      
      // Invalidate queries to refresh data
      // queryClient.invalidateQueries(['userProfile', userId]);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to unfollow user. Please try again.',
      });
    }
  };

  const handleFollow = async () => {
    if (!userId || !auth.user) return;
    
    try {
      await userService.followUser(userId);
      
      toast({
        title: 'Followed successfully',
        description: 'You are now following this user',
      });
      
      // Invalidate queries to refresh data
      // queryClient.invalidateQueries(['userProfile', userId]);
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to follow user. Please try again.',
      });
    }
  };

  const handleFollowersClick = () => {
    setFollowModal({
      isOpen: true,
      type: 'followers',
    });
  };

  const handleFollowingClick = () => {
    setFollowModal({
      isOpen: true,
      type: 'following',
    });
  };

  const closeModal = () => {
    setFollowModal({
      ...followModal,
      isOpen: false,
    });
  };

  if (profileLoading || postsLoading || levelLoading || badgesLoading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfile
        profile={profile}
        posts={posts || []}
        userLevel={userLevel || { level: 1, title: 'Newbie', pointsRequired: 0, pointsToNextLevel: 100, progressPercentage: 0 }}
        badges={badges || []}
        isOwnProfile={isOwnProfile}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onFollowersClick={handleFollowersClick}
        onFollowingClick={handleFollowingClick}
      />

      {userId && auth.user && (
        <UserFollowModal
          userId={userId}
          isOpen={followModal.isOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
