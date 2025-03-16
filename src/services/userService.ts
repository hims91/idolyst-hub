import { supabase } from '@/integrations/supabase/client';
import { User, UserProfile, Post, PaginatedResponse } from '@/types/api';
import { formatDistance } from 'date-fns';
import { safeGetProperty } from '@/utils/supabaseHelpers';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    const { count: followersCount } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact' })
      .eq('following_id', userId);

    const { count: followingCount } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact' })
      .eq('follower_id', userId);

    const email = await getUserEmail(userId);

    return {
      id: profile.id,
      name: profile.name || 'Anonymous User',
      email: email || '',
      avatar: profile.avatar,
      role: profile.role || 'user',
      bio: profile.bio || '',
      company: profile.company || '',
      location: profile.location || '',
      website: profile.website || '',
      joinedOn: profile.join_date,
      skills: [],
      followersCount: followersCount || 0,
      followingCount: followingCount || 0,
      socialLinks: {},
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

const getUserEmail = async (userId: string): Promise<string> => {
  try {
    return '';
  } catch (error) {
    console.error('Error fetching user email:', error);
    return '';
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

    const posts = (data || []).map(post => {
      const createdAt = post.created_at;
      const timeAgo = formatDistance(createdAt, new Date());

      return {
        id: post.id,
        title: post.title || 'Untitled Post',
        content: post.content || '',
        createdAt,
        updatedAt: post.updated_at,
        timeAgo,
        upvotes: post.upvotes || 0,
        downvotes: post.downvotes || 0,
        commentCount: 0,
        category: 'General',
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

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

export const userService = {
  getUserProfile,
  getUserPosts,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser
};

export default userService;
