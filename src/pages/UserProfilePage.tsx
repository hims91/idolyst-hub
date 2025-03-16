
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/hooks/useAuthSession';
import { getUserProfile, getUserPosts, followUser, unfollowUser } from '@/services/userService';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { User } from '@/types/api';
import UserFollowModal from '@/components/user/UserFollowModal';
import { useToast } from '@/hooks/use-toast';
import Profile from '@/components/Profile';

const UserProfilePage = () => {
  const { id: userId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const auth = useAuthSession();
  const isAuthenticated = Boolean(auth?.isValidSession);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);

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

  const isLoading = profileLoading || postsLoading;

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

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title={`${userProfile.name}'s Profile`} />
        
        <main className="flex-1 container py-6 max-w-6xl">
          <div className="space-y-6">
            {/* User profile header */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-shrink-0">
                <img 
                  src={userProfile.avatar || '/placeholder.svg'} 
                  alt={userProfile.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/10"
                />
              </div>
              
              <div className="flex-grow space-y-2">
                <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="font-semibold">{userProfile.role}</span>
                  </span>
                  <span>•</span>
                  <span>Joined {userProfile.joinedOn}</span>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <button 
                    onClick={() => setFollowModalType('followers')}
                    className="hover:underline"
                  >
                    <span className="font-semibold">{userProfile.followersCount}</span> Followers
                  </button>
                  <button 
                    onClick={() => setFollowModalType('following')}
                    className="hover:underline"
                  >
                    <span className="font-semibold">{userProfile.followingCount}</span> Following
                  </button>
                </div>
                
                {userProfile.bio && (
                  <p className="text-sm mt-2">{userProfile.bio}</p>
                )}
              </div>
              
              <div className="mt-4 md:mt-0">
                {isAuthenticated && (
                  <Button 
                    variant={userProfile.isFollowing ? "secondary" : "default"}
                    onClick={handleFollowUser}
                  >
                    {userProfile.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Tabs for different sections */}
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-6">
                <Profile 
                  profile={userProfile}
                  posts={userPosts || []}
                  viewOnly
                />
              </TabsContent>
              
              <TabsContent value="about" className="mt-6">
                <div className="bg-card rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold">About {userProfile.name}</h2>
                  
                  {userProfile.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
                      <p className="mt-1">{userProfile.bio}</p>
                    </div>
                  )}
                  
                  {userProfile.location && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                      <p className="mt-1">{userProfile.location}</p>
                    </div>
                  )}
                  
                  {userProfile.website && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                      <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="mt-1 text-primary hover:underline">
                        {userProfile.website}
                      </a>
                    </div>
                  )}
                  
                  {userProfile.skills && userProfile.skills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Skills</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {userProfile.skills.map((skill, index) => (
                          <span key={index} className="bg-secondary px-2 py-1 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {userProfile.interests && userProfile.interests.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Interests</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {userProfile.interests.map((interest, index) => (
                          <span key={index} className="bg-secondary px-2 py-1 rounded-full text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-6">
                <div className="bg-card rounded-lg p-6">
                  <h2 className="text-xl font-semibold">Activity</h2>
                  <p className="text-muted-foreground mt-2">Recent activity will be shown here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Followers/Following Modal */}
      {followModalType && (
        <UserFollowModal
          userId={userId || ''}
          type={followModalType}
          isOpen={!!followModalType}
          onClose={() => setFollowModalType(null)}
        />
      )}
    </PageTransition>
  );
};

export default UserProfilePage;
