
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/api";

const getUser = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name || 'Unknown',
      avatar: data.avatar,
      role: data.role || 'user',
      bio: data.bio
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

const getUserFollowers = async (userId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .select(`
        follower:follower_id (
          id,
          name,
          avatar,
          bio,
          role
        )
      `)
      .eq('following_id', userId);
    
    if (error) throw error;
    
    // Check if current user is following these followers
    const currentUser = (await supabase.auth.getUser()).data.user;
    
    // Transform to expected format
    const followers = data.map(item => {
      if (!item.follower) {
        return {
          id: 'unknown',
          name: 'Unknown User',
          avatar: '',
          role: 'user',
          bio: '',
          isFollowing: false
        };
      }
      
      return {
        id: item.follower.id,
        name: item.follower.name || 'Unknown User',
        avatar: item.follower.avatar,
        role: item.follower.role || 'user',
        bio: item.follower.bio || '',
        isFollowing: false // Will be updated below if needed
      };
    });
    
    // If user is logged in, check which followers they are following
    if (currentUser) {
      const { data: followingData } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', currentUser.id);
      
      const followingIds = new Set(followingData?.map(f => f.following_id) || []);
      
      followers.forEach(follower => {
        follower.isFollowing = followingIds.has(follower.id);
      });
    }
    
    return followers;
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
};

const getUserFollowing = async (userId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .select(`
        following:following_id (
          id,
          name,
          avatar,
          bio,
          role
        )
      `)
      .eq('follower_id', userId);
    
    if (error) throw error;
    
    // Transform to expected format
    return data.map(item => {
      if (!item.following) {
        return {
          id: 'unknown',
          name: 'Unknown User',
          avatar: '',
          role: 'user',
          bio: '',
          isFollowing: true
        };
      }
      
      return {
        id: item.following.id,
        name: item.following.name || 'Unknown User',
        avatar: item.following.avatar,
        role: item.following.role || 'user',
        bio: item.following.bio || '',
        isFollowing: true
      };
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
};

const followUser = async (targetUserId: string): Promise<void> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const { error } = await supabase
      .from('user_followers')
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

const unfollowUser = async (targetUserId: string): Promise<void> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const { error } = await supabase
      .from('user_followers')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const userService = {
  getUser,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser
};

export default userService;
