
import { supabase } from "@/integrations/supabase/client";
import { AdminContentState, AdminPost, AdminStats, AdminUser, PaginatedResponse } from "@/types/api";

// Get admin dashboard statistics
const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // In a real implementation, you would fetch actual stats from the database
    // For now, we'll return mock data
    return {
      usersCount: 245,
      postsCount: 1843,
      commentsCount: 4271,
      eventsCount: 32,
      newUsersThisWeek: 18,
      activeUsersToday: 42,
      reportsCount: 5,
      uptime: "99.8%",
      userGrowthData: [
        { name: "Jan", value: 40 },
        { name: "Feb", value: 45 },
        { name: "Mar", value: 52 },
        { name: "Apr", value: 58 },
        { name: "May", value: 63 },
        { name: "Jun", value: 70 },
        { name: "Jul", value: 76 },
        { name: "Aug", value: 84 },
        { name: "Sep", value: 91 },
        { name: "Oct", value: 98 },
        { name: "Nov", value: 109 },
        { name: "Dec", value: 120 }
      ],
      postActivityData: [
        { name: "Jan", value: 120 },
        { name: "Feb", value: 145 },
        { name: "Mar", value: 162 },
        { name: "Apr", value: 178 },
        { name: "May", value: 193 },
        { name: "Jun", value: 210 },
        { name: "Jul", value: 226 },
        { name: "Aug", value: 234 },
        { name: "Sep", value: 251 },
        { name: "Oct", value: 268 },
        { name: "Nov", value: 279 },
        { name: "Dec", value: 300 }
      ]
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

// Get users for admin management
const getAdminUsers = async (state?: AdminContentState): Promise<AdminUser[]> => {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }
    
    const adminUsers: AdminUser[] = users.users.map(user => ({
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
      email: user.email || '',
      role: user.user_metadata?.role || 'member',
      status: user.banned ? 'suspended' : (user.email_confirmed_at ? 'active' : 'pending'),
      createdAt: new Date(user.created_at).toISOString()
    }));
    
    // Apply filters if state is provided
    if (state) {
      // Filter by search query
      if (state.search) {
        const searchLower = state.search.toLowerCase();
        adminUsers.filter(user => 
          user.name.toLowerCase().includes(searchLower) || 
          user.email.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by status
      if (state.status !== 'all') {
        adminUsers.filter(user => user.status === state.status);
      }
      
      // Sort by selected field
      adminUsers.sort((a, b) => {
        const aValue = a[state.sortBy as keyof AdminUser];
        const bValue = b[state.sortBy as keyof AdminUser];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return state.sortOrder === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
    }
    
    return adminUsers;
  } catch (error) {
    console.error("Error in getAdminUsers:", error);
    throw error;
  }
};

// Get admin content management data
const getAdminContent = async (state?: AdminContentState): Promise<{posts: AdminPost[]}> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        user_id,
        created_at,
        status:visibility
      `);
    
    if (error) {
      console.error("Error fetching admin content:", error);
      throw error;
    }
    
    const adminPosts: AdminPost[] = await Promise.all(data.map(async post => {
      // Get user info for each post
      const { data: userData } = await supabase.auth.admin.getUserById(post.user_id);
      const userName = userData?.user?.user_metadata?.name || 'Unknown';
      
      // Get comment count for each post
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);
      
      return {
        id: post.id,
        title: post.title || 'Untitled',
        author: {
          id: post.user_id,
          name: userName
        },
        category: 'General',
        status: post.status || 'published',
        comments: count || 0,
        published: new Date(post.created_at).toISOString()
      };
    }));
    
    // Apply filters if state is provided
    if (state) {
      // Filter and sort logic similar to getAdminUsers
    }
    
    return { posts: adminPosts };
  } catch (error) {
    console.error("Error in getAdminContent:", error);
    throw error;
  }
};

// Update user status (active, suspended, pending)
const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'pending'): Promise<boolean> => {
  try {
    if (status === 'suspended') {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none'
      });
      
      if (error) {
        console.error("Error banning user:", error);
        return false;
      }
    } else if (status === 'active') {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: null,
        email_confirm: true
      });
      
      if (error) {
        console.error("Error activating user:", error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateUserStatus:", error);
    return false;
  }
};

export const adminService = {
  getAdminStats,
  getAdminUsers,
  getAdminContent,
  updateUserStatus
};
