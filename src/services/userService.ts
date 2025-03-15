
import { supabase } from "@/integrations/supabase/client";
import { User, Post, UserStats } from "@/types/api";

/**
 * Get a user by their ID
 */
const getUser = async (userId: string): Promise<User | null> => {
  try {
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }
    
    // Check if user is being followed by the current logged in user
    let isFollowing = false;
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user?.id) {
      const currentUserId = session.data.session.user.id;
      const { data: followData } = await supabase
        .from('user_followers')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single();
      
      isFollowing = !!followData;
    }
    
    // Get follower count
    const { count: followersCount, error: followersError } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    
    if (followersError) {
      console.error('Error fetching followers count:', followersError);
    }
    
    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    
    if (followingError) {
      console.error('Error fetching following count:', followingError);
    }
    
    // Get post count
    const { count: postsCount, error: postsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (postsError) {
      console.error('Error fetching posts count:', postsError);
    }
    
    // Format user data
    const user: User = {
      id: profile.id,
      name: profile.name || '',
      email: '',  // We don't expose email for privacy reasons
      role: profile.role || 'member',
      avatar: profile.avatar || '',
      bio: profile.bio || '',
      company: profile.company || '',
      location: profile.location || '',
      website: profile.website || '',
      joinDate: profile.join_date || new Date().toISOString(),
      followers: followersCount || 0,
      following: followingCount || 0,
      posts: postsCount || 0,
      isFollowing: isFollowing
    };
    
    return user;
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
};

/**
 * Follow a user
 */
const followUser = async (currentUserId: string, userToFollowId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .insert({
        follower_id: currentUserId,
        following_id: userToFollowId
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
 */
const unfollowUser = async (currentUserId: string, userToUnfollowId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_followers')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', userToUnfollowId);
    
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
 */
const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
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
    
    const posts: Post[] = data.map((post) => ({
      id: post.id,
      title: post.title || '',
      content: post.content,
      author: {
        id: post.profiles.id,
        name: post.profiles.name,
        avatar: post.profiles.avatar,
        role: post.profiles.role
      },
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      comments: [],
      isUpvoted: false,
      isDownvoted: false,
      isBookmarked: false
    }));
    
    return posts;
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    return [];
  }
};

/**
 * Get a user's followers
 */
const getUserFollowers = async (userId: string, page: number = 1, limit: number = 10): Promise<{ users: User[], totalCount: number }> => {
  try {
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get followers with pagination
    const { data, error, count } = await supabase
      .from('user_followers')
      .select(`
        follower_id,
        profiles:follower_id (
          id,
          name,
          avatar,
          role,
          bio
        )
      `, { count: 'exact' })
      .eq('following_id', userId)
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching user followers:', error);
      return { users: [], totalCount: 0 };
    }
    
    const followers: User[] = data.map((item) => ({
      id: item.profiles.id,
      name: item.profiles.name || '',
      avatar: item.profiles.avatar || '',
      role: item.profiles.role || 'member',
      bio: item.profiles.bio || '',
      email: '',
      isFollowing: false
    }));
    
    return { 
      users: followers, 
      totalCount: count || 0 
    };
  } catch (error) {
    console.error('Error in getUserFollowers:', error);
    return { users: [], totalCount: 0 };
  }
};

/**
 * Get users that a user is following
 */
const getUserFollowing = async (userId: string, page: number = 1, limit: number = 10): Promise<{ users: User[], totalCount: number }> => {
  try {
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get following with pagination
    const { data, error, count } = await supabase
      .from('user_followers')
      .select(`
        following_id,
        profiles:following_id (
          id,
          name,
          avatar,
          role,
          bio
        )
      `, { count: 'exact' })
      .eq('follower_id', userId)
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching user following:', error);
      return { users: [], totalCount: 0 };
    }
    
    const following: User[] = data.map((item) => ({
      id: item.profiles.id,
      name: item.profiles.name || '',
      avatar: item.profiles.avatar || '',
      role: item.profiles.role || 'member',
      bio: item.profiles.bio || '',
      email: '',
      isFollowing: true
    }));
    
    return { 
      users: following, 
      totalCount: count || 0 
    };
  } catch (error) {
    console.error('Error in getUserFollowing:', error);
    return { users: [], totalCount: 0 };
  }
};

const userService = {
  getUser,
  followUser,
  unfollowUser,
  getUserPosts,
  getUserFollowers,
  getUserFollowing
};

export default userService;
