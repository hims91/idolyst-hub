
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/hooks/useAuthSession';
import { getUserProfile, getUserPosts } from '@/services/userService';
import gamificationService from '@/services/gamificationService';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';
import { Spinner } from '@/components/ui/spinner';
import UserFollowModal from '@/components/user/UserFollowModal';
import { useToast } from '@/hooks/use-toast';
import UserProfile from '@/components/user/UserProfile';

const UserProfilePage = () => {
  const { id: userId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const auth = useAuthSession();
  const isAuthenticated = Boolean(auth?.isValidSession);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

  const { data: userProfile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId || ''),
    enabled: !!userId,
  });

  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => getUserPosts(userId || ''),
    enabled: !!userId,
  });

  const { data: userLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['user-level', userId],
    queryFn: () => gamificationService.getUserLevel(userId || ''),
    enabled: !!userId && !!isAuthenticated,
  });

  const { data: userBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: () => gamificationService.getUserBadges(userId || ''),
    enabled: !!userId && !!isAuthenticated,
  });

  const isLoading = profileLoading || postsLoading || levelLoading || badgesLoading;

  const handleFollowUser = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (userProfile?.isFollowing) {
        await unfollowUser(userId || '');
        toast({
          title: "Unfollowed",
          description: `You no longer follow ${userProfile.name}`,
        });
      } else {
        await followUser(userId || '');
        toast({
          title: "Following",
          description: `You are now following ${userProfile?.name}`,
        });
      }
      refetchProfile();
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const openFollowModal = (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setFollowModalOpen(true);
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="User Profile" />
          <main className="flex-1 container py-6 max-w-6xl">
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  if (!userProfile) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="User Not Found" />
          <main className="flex-1 container py-6 max-w-6xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold">User Not Found</h2>
              <p className="mt-2">The user you're looking for doesn't exist or has been removed.</p>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  const isOwnProfile = auth?.user?.id === userProfile.id;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title={`${userProfile.name}'s Profile`} />
        
        <main className="flex-1 container py-6 max-w-6xl">
          <UserProfile 
            profile={userProfile}
            posts={userPosts || []}
            userLevel={userLevel}
            badges={userBadges || []}
            isOwnProfile={isOwnProfile}
            onFollow={handleFollowUser}
            onUnfollow={handleFollowUser}
            onFollowersClick={() => openFollowModal('followers')}
            onFollowingClick={() => openFollowModal('following')}
          />
        </main>
      </div>
      
      {/* Followers/Following Modal */}
      {followModalOpen && (
        <UserFollowModal
          userId={userId || ''}
          isOpen={followModalOpen}
          onClose={() => setFollowModalOpen(false)}
          type={followModalType}
        />
      )}
    </PageTransition>
  );
};

export default UserProfilePage;
