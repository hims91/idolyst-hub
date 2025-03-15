
import { supabase } from '@/integrations/supabase/client';
import { User, UserConnection, Post } from '@/types/api';

/**
 * Get user profile data
 * @param userId User ID to fetch
 * @returns User data or null if not found
 */
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        role,
        avatar,
        bio,
        company,
        location,
        website,
        join_date
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Fetch user badges
    const { data: badges } = await supabase
      .from('user_badges')
      .select(`
        badges (*)
      `)
      .eq('user_id', userId);
    
    return {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      role: data.role || 'user',
      avatar: data.avatar,
      bio: data.bio,
      company: data.company,
      location: data.location,
      website: data.website,
      joinDate: data.join_date,
      badges: badges?.map(item => item.badges) || []
    };
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
};

/**
 * Follow a user
 * @param followerId The ID of the user who is following
 * @param followingId The ID of the user to be followed
 * @returns Whether the follow was successful
 */
export const followUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    // Check if we need to create a followers table
    const { error } = await supabase
      .from('user_followers')
      .insert({
        follower_id: followerId,
        following_id: followingId
      });
    
    if (error) {
      console.error('Error following user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in followUser:', error);
    return false;
  }
};

/**
 * Unfollow a user
 * @param followerId The ID of the user who is unfollowing
 * @param followingId The ID of the user to be unfollowed
 * @returns Whether the unfollow was successful
 */
export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_followers')
      .delete()
      .match({
        follower_id: followerId,
        following_id: followingId
      });
    
    if (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in unfollowUser:', error);
    return false;
  }
};

/**
 * Get a user's posts
 * @param userId User ID to fetch posts for
 * @returns Array of user posts
 */
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
        image_url,
        user_id,
        profiles:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
    
    return data?.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.profiles.id,
        name: post.profiles.name || 'Anonymous',
        avatar: post.profiles.avatar,
        role: post.profiles.role || 'user'
      },
      category: 'general', // Default category
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      commentCount: 0, // We'll need to count comments separately
      timeAgo: new Date(post.created_at).toLocaleDateString(),
      createdAt: post.created_at,
      imageUrl: post.image_url
    })) || [];
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    return [];
  }
};

/**
 * Get a user's followers
 * @param userId User ID to fetch followers for
 * @returns Array of users who follow the given user
 */
export const getUserFollowers = async (userId: string): Promise<UserConnection[]> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .select(`
        follower_id,
        profiles!user_followers_follower_id_fkey (
          id,
          name,
          role,
          avatar,
          company
        )
      `)
      .eq('following_id', userId);
    
    if (error) {
      console.error('Error fetching user followers:', error);
      return [];
    }
    
    return data?.map(item => {
      const profile = item.profiles;
      return {
        id: profile.id,
        name: profile.name || 'Anonymous',
        role: profile.role || 'user',
        avatar: profile.avatar,
        company: profile.company,
        isFollowing: false // We need to check this separately
      };
    }) || [];
  } catch (error) {
    console.error('Error in getUserFollowers:', error);
    return [];
  }
};

/**
 * Get users followed by a user
 * @param userId User ID to fetch following for
 * @returns Array of users followed by the given user
 */
export const getUserFollowing = async (userId: string): Promise<UserConnection[]> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .select(`
        following_id,
        profiles!user_followers_following_id_fkey (
          id,
          name,
          role,
          avatar,
          company
        )
      `)
      .eq('follower_id', userId);
    
    if (error) {
      console.error('Error fetching user following:', error);
      return [];
    }
    
    return data?.map(item => {
      const profile = item.profiles;
      return {
        id: profile.id,
        name: profile.name || 'Anonymous',
        role: profile.role || 'user',
        avatar: profile.avatar,
        company: profile.company,
        isFollowing: true // User is following these profiles
      };
    }) || [];
  } catch (error) {
    console.error('Error in getUserFollowing:', error);
    return [];
  }
};

export default {
  getUser,
  followUser,
  unfollowUser,
  getUserPosts,
  getUserFollowers,
  getUserFollowing
};
