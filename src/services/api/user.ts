
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/api";
import { safeGetProperty, checkColumnExists } from "@/utils/supabaseHelpers";

const getUser = async (userId: string): Promise<User | null> => {
  try {
    // First check if the skills column exists in profiles
    const hasSkills = await checkColumnExists('profiles', 'skills');
    
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name || 'Unknown',
      avatar: data.avatar,
      role: data.role || 'user',
      bio: data.bio,
      // Don't include skills if not present in the data
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
        follower_id
      `)
      .eq('following_id', userId);
    
    if (error) throw error;
    
    // For each follower_id, get the user profile
    const followers: User[] = [];
    
    for (const item of data) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, name, avatar, role, bio')
        .eq('id', item.follower_id)
        .single();
        
      if (!userError && userData) {
        followers.push({
          id: userData.id,
          name: userData.name || 'Unknown User',
          avatar: userData.avatar,
          role: userData.role || 'user',
          bio: userData.bio || '',
          isFollowing: false // Will be updated below if needed
        });
      }
    }
    
    // If user is logged in, check which followers they are following
    const currentUser = (await supabase.auth.getUser()).data.user;
    
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
        following_id
      `)
      .eq('follower_id', userId);
    
    if (error) throw error;
    
    // For each following_id, get the user profile
    const following: User[] = [];
    
    for (const item of data) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, name, avatar, role, bio')
        .eq('id', item.following_id)
        .single();
        
      if (!userError && userData) {
        following.push({
          id: userData.id,
          name: userData.name || 'Unknown User',
          avatar: userData.avatar,
          role: userData.role || 'user',
          bio: userData.bio || '',
          isFollowing: true
        });
      }
    }
    
    return following;
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
