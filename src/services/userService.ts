
import { supabase } from "@/integrations/supabase/client";
import { Post, User, UserProfile } from "@/types/api";
import { formatTimeAgo } from "@/lib/utils";

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const followersCount = await getFollowersCount(userId);
    const followingCount = await getFollowingCount(userId);

    // Transform to UserProfile format
    const profile: UserProfile = {
      id: data.id,
      name: data.name || 'Anonymous',
      email: data.email || '',
      avatar: data.avatar || '',
      role: data.role || 'user',
      bio: data.bio || '',
      location: data.location || '',
      company: data.company || '',
      website: data.website || '',
      joinedOn: data.join_date || data.created_at || new Date().toISOString(),
      skills: [],  // Default empty array since skills column might not exist
      followersCount,
      followingCount,
      socialLinks: {
        // Add default social links or extract them from data if available
      }
    };

    return profile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        upvotes,
        downvotes,
        author:user_id(id, name, avatar, role)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }

    // Transform and add computed properties
    const posts = (data || []).map(post => {
      const createdAt = post.created_at;
      const timeAgo = formatTimeAgo(createdAt);
      
      return {
        id: post.id,
        title: post.title || 'Untitled Post',
        content: post.content || '',
        createdAt,
        updatedAt: post.updated_at,
        timeAgo,
        upvotes: post.upvotes || 0,
        downvotes: post.downvotes || 0,
        commentCount: 0, // Would need another query to get this
        category: 'General', // Default category
        comments: [],
        author: {
          id: safeGetProperty(post.author, 'id', ''),
          name: safeGetProperty(post.author, 'name', 'Unknown User'),
          avatar: safeGetProperty(post.author, 'avatar', ''),
          role: safeGetProperty(post.author, 'role', 'user')
        },
        isUpvoted: false,
        isDownvoted: false,
        isBookmarked: false
      };
    });

    return posts;
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    return [];
  }
};

export const getFollowers = async (userId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .select(`
        follower:follower_id(id, name, bio, avatar, role)
      `)
      .eq('following_id', userId);

    if (error) {
      console.error('Error fetching followers:', error);
      return [];
    }

    // Transform and handle null follower
    const followers = (data || [])
      .map(item => {
        if (!item.follower) return null;
        
        return {
          id: safeGetProperty(item.follower, 'id', ''),
          name: safeGetProperty(item.follower, 'name', 'Unknown User'),
          bio: safeGetProperty(item.follower, 'bio', ''),
          avatar: safeGetProperty(item.follower, 'avatar', ''),
          role: safeGetProperty(item.follower, 'role', 'user')
        };
      })
      .filter(Boolean) as User[];

    return followers;
  } catch (error) {
    console.error('Error in getFollowers:', error);
    return [];
  }
};

export const getFollowing = async (userId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .select(`
        following:following_id(id, name, bio, avatar, role)
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error('Error fetching following:', error);
      return [];
    }

    // Transform and handle null following
    const following = (data || [])
      .map(item => {
        if (!item.following) return null;
        
        return {
          id: safeGetProperty(item.following, 'id', ''),
          name: safeGetProperty(item.following, 'name', 'Unknown User'),
          bio: safeGetProperty(item.following, 'bio', ''),
          avatar: safeGetProperty(item.following, 'avatar', ''),
          role: safeGetProperty(item.following, 'role', 'user')
        };
      })
      .filter(Boolean) as User[];

    return following;
  } catch (error) {
    console.error('Error in getFollowing:', error);
    return [];
  }
};

export const followUser = async (userId: string): Promise<void> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('user_followers')
      .insert({
        follower_id: userData.user.id,
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
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('user_followers')
      .delete()
      .eq('follower_id', userData.user.id)
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

// Safe property getter
const safeGetProperty = (obj: any, key: string, defaultValue: any): any => {
  return obj && obj[key] !== undefined ? obj[key] : defaultValue;
};

const getFollowersCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('user_followers')
    .select('*', { count: 'exact' })
    .eq('following_id', userId);

  if (error) {
    console.error("Error fetching followers count:", error);
    return 0;
  }

  return count || 0;
};

const getFollowingCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('user_followers')
    .select('*', { count: 'exact' })
    .eq('follower_id', userId);

  if (error) {
    console.error("Error fetching following count:", error);
    return 0;
  }

  return count || 0;
};

// Export all functions
export const userService = {
  getUserProfile,
  getUserPosts,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser
};

export default userService;
