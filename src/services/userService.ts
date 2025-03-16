
import { supabase } from "@/integrations/supabase/client";
import { Post, User, UserProfile } from "@/types/api";
import { formatTimeAgo } from "@/lib/utils";

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Fetch the user profile
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error("Error fetching user profile:", userError);
      throw new Error(userError.message);
    }

    if (!userData) {
      // Try to fetch from auth.users if not in profiles
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) {
        console.error("Error fetching auth user:", authError);
        return null;
      }
      
      if (!authUser.user) {
        return null;
      }
      
      return {
        id: authUser.user.id,
        name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
        email: authUser.user.email || '',
        bio: authUser.user.user_metadata?.bio || '',
        avatar: authUser.user.user_metadata?.avatar_url || '',
        role: authUser.user.user_metadata?.role || 'member',
        joinedOn: formatDate(authUser.user.created_at),
        website: authUser.user.user_metadata?.website || '',
        location: authUser.user.user_metadata?.location || '',
        skills: authUser.user.user_metadata?.skills || [],
        interests: authUser.user.user_metadata?.interests || [],
        followersCount: 0,
        followingCount: 0,
        isFollowing: false
      };
    }

    // Get followers count
    const { count: followersCount, error: followersError } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact' })
      .eq('following_id', userId);

    if (followersError) {
      console.error("Error fetching followers count:", followersError);
    }

    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact' })
      .eq('follower_id', userId);

    if (followingError) {
      console.error("Error fetching following count:", followingError);
    }

    // Check if current user is following this profile
    let isFollowing = false;
    const currentUser = (await supabase.auth.getUser()).data.user;
    
    if (currentUser) {
      const { data: followData, error: followError } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId)
        .single();
        
      if (!followError && followData) {
        isFollowing = true;
      }
    }

    return {
      id: userData.id,
      name: userData.name || 'User',
      email: '', // Email is not stored in profiles table for security reasons
      bio: userData.bio || '',
      avatar: userData.avatar || '',
      role: userData.role || 'member',
      joinedOn: formatDate(userData.created_at),
      website: userData.website || '',
      location: userData.location || '',
      skills: userData.skills || [],
      interests: [],
      followersCount: followersCount || 0,
      followingCount: followingCount || 0,
      isFollowing
    };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user posts:", error);
      throw new Error(error.message);
    }

    // Mock posts if none found (for development)
    if (!data || data.length === 0) {
      return [];
    }

    return data.map(post => {
      // Handle the case where author might be null or an error
      let author: User;
      
      if (!post.author || typeof post.author === 'object' && 'code' in post.author) {
        author = {
          id: userId,
          name: 'Unknown',
          avatar: '',
          role: 'member'
        };
      } else {
        author = {
          id: post.author.id || '',
          name: post.author.name || 'Unknown',
          avatar: post.author.avatar || '',
          role: post.author.role || 'member'
        };
      }

      return {
        id: post.id,
        title: post.title || '',
        content: post.content,
        category: 'General',
        author,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        timeAgo: formatTimeAgo(post.created_at),
        upvotes: post.upvotes || 0,
        downvotes: post.downvotes || 0,
        commentCount: 0,
        comments: [],
        isUpvoted: false,
        isDownvoted: false,
        isBookmarked: false
      };
    });
  } catch (error) {
    console.error("Error in getUserPosts:", error);
    throw error;
  }
};

export const getFollowers = async (userId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .select(`
        *,
        follower:follower_id (
          id,
          name,
          avatar,
          role,
          bio
        )
      `)
      .eq('following_id', userId);

    if (error) {
      console.error("Error fetching followers:", error);
      throw new Error(error.message);
    }

    return data.map(item => {
      // Handle the case where follower might be null or an error
      if (!item.follower || typeof item.follower === 'object' && 'code' in item.follower) {
        return {
          id: item.follower_id,
          name: 'Unknown User',
          bio: '',
          avatar: '',
          role: 'member',
          isFollowing: false
        };
      }

      return {
        id: item.follower.id,
        name: item.follower.name || 'Unknown User',
        bio: item.follower.bio || '',
        avatar: item.follower.avatar || '',
        role: item.follower.role || 'member',
        isFollowing: false // Will be set later if needed
      };
    });
  } catch (error) {
    console.error("Error in getFollowers:", error);
    throw error;
  }
};

export const getFollowing = async (userId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .select(`
        *,
        following:following_id (
          id,
          name,
          avatar,
          role,
          bio
        )
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error("Error fetching following:", error);
      throw new Error(error.message);
    }

    return data.map(item => {
      // Handle the case where following might be null or an error
      if (!item.following || typeof item.following === 'object' && 'code' in item.following) {
        return {
          id: item.following_id,
          name: 'Unknown User',
          bio: '',
          avatar: '',
          role: 'member',
          isFollowing: true
        };
      }

      return {
        id: item.following.id,
        name: item.following.name || 'Unknown User',
        bio: item.following.bio || '',
        avatar: item.following.avatar || '',
        role: item.following.role || 'member',
        isFollowing: true
      };
    });
  } catch (error) {
    console.error("Error in getFollowing:", error);
    throw error;
  }
};

export const followUser = async (userId: string): Promise<void> => {
  try {
    const currentUser = (await supabase.auth.getUser()).data.user;
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('user_followers')
      .insert({
        follower_id: currentUser.id,
        following_id: userId
      });

    if (error) {
      console.error("Error following user:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in followUser:", error);
    throw error;
  }
};

export const unfollowUser = async (userId: string): Promise<void> => {
  try {
    const currentUser = (await supabase.auth.getUser()).data.user;
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('user_followers')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', userId);

    if (error) {
      console.error("Error unfollowing user:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    throw error;
  }
};

// Helper functions
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
