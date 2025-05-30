
import { supabase } from '@/integrations/supabase/client';
import { AdminStats, AdminContentState, AdminUser, AdminPost, PaginatedResponse, EmailSettingsForm } from '@/types/api';
import { safeGetProperty } from '@/utils/supabaseHelpers';

// Get admin dashboard stats
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // In a real app, this would fetch from the backend
    // This is mocked data for now
    return {
      users: 1250,
      posts: 3427,
      comments: 8953,
      events: 112,
      summaryCards: [
        { title: 'New Users This Week', value: 87, change: 12, trend: 'up' },
        { title: 'Active Users Today', value: 345, change: 5, trend: 'up' },
        { title: 'Reports', value: 12, change: -3, trend: 'down' },
        { title: 'Uptime', value: 99.98, change: 0.1, trend: 'up' }
      ],
      userActivity: [
        { date: 'Jan', active: 400, new: 200 },
        { date: 'Feb', active: 500, new: 250 },
        { date: 'Mar', active: 700, new: 300 },
        { date: 'Apr', active: 680, new: 280 },
        { date: 'May', active: 740, new: 320 },
        { date: 'Jun', active: 860, new: 350 }
      ],
      contentDistribution: [
        { type: 'Posts', value: 45 },
        { type: 'Events', value: 20 },
        { type: 'Comments', value: 35 }
      ],
      monthlyRevenue: [
        { month: 'Jan', revenue: 4500 },
        { month: 'Feb', revenue: 5200 },
        { month: 'Mar', revenue: 6100 },
        { month: 'Apr', revenue: 5800 },
        { month: 'May', revenue: 6400 },
        { month: 'Jun', revenue: 7200 }
      ],
      // Compatibility with old structure
      usersCount: 1250,
      postsCount: 3427,
      commentsCount: 8953,
      eventsCount: 112,
      newUsersThisWeek: 87,
      activeUsersToday: 345,
      reportsCount: 12,
      uptime: '99.98%',
      userGrowthData: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 500 },
        { name: 'Mar', value: 700 },
        { name: 'Apr', value: 680 },
        { name: 'May', value: 740 },
        { name: 'Jun', value: 860 },
      ],
      postActivityData: [
        { name: 'Mon', value: 120 },
        { name: 'Tue', value: 132 },
        { name: 'Wed', value: 185 },
        { name: 'Thu', value: 156 },
        { name: 'Fri', value: 134 },
        { name: 'Sat', value: 104 },
        { name: 'Sun', value: 98 },
      ],
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Get admin users with filtering, sorting, and pagination
export const getAdminUsers = async (state?: AdminContentState): Promise<AdminUser[]> => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, name, role, created_at');

    if (error) throw error;

    // Transform to expected format with safe property access
    return users.map(user => ({
      id: safeGetProperty(user, 'id', 'unknown'),
      name: safeGetProperty(user, 'name', 'Unknown'),
      email: 'no-email@example.com', // Default since email isn't in profiles table
      role: safeGetProperty(user, 'role', 'user'),
      status: 'active', // Mock status
      createdAt: safeGetProperty(user, 'created_at', new Date().toISOString()),
    }));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

// Get admin content with filtering, sorting, and pagination
export const getAdminContent = async (state?: AdminContentState): Promise<PaginatedResponse<AdminPost>> => {
  try {
    const { page = 1, search = '', status = 'all', sortBy = 'created_at', sortOrder = 'desc' } = state || {};
    
    let query = supabase
      .from('posts')
      .select('id, title, content, user_id, created_at');
    
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }
    
    if (status !== 'all') {
      query = query.eq('visibility', status);
    }
    
    // Add pagination
    const offset = (page - 1) * 10;
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + 9);
    
    if (error) throw error;
    
    // Transform to expected format with safe property access
    const posts: AdminPost[] = data.map(post => ({
      id: safeGetProperty(post, 'id', 'unknown'),
      title: safeGetProperty(post, 'title', post.content?.substring(0, 50) + '...') || 'Untitled Post',
      author: {
        id: safeGetProperty(post, 'user_id', 'unknown'),
        name: 'User ' + safeGetProperty(post, 'user_id', 'unknown').substring(0, 5), // Mock author name
      },
      category: 'General', // Default category
      status: 'public', // Default status
      comments: 0, // Default comment count
      published: safeGetProperty(post, 'created_at', new Date().toISOString()),
    }));
    
    return {
      items: posts,
      currentPage: page,
      totalPages: count ? Math.ceil(count / 10) : 1,
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching admin content:', error);
    throw error;
  }
};

// Update user status (e.g., suspend, activate)
export const updateUserStatus = async (
  userId: string, 
  status: 'active' | 'suspended'
): Promise<boolean> => {
  try {
    // Check if profiles table has status column
    const { data: hasStatusColumn, error: columnCheckError } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'profiles', 
        column_name: 'status' 
      });
    
    if (columnCheckError) {
      console.error("Error checking if status column exists:", columnCheckError);
      return false;
    }
    
    if (!hasStatusColumn) {
      console.log("Status column does not exist in profiles table");
      // Use a safer update method that doesn't include the status property
      const { error } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);
      
      if (error) throw error;
      return true;
    }
    
    // If status column exists, update it
    const { error } = await supabase
      .from('profiles')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    return false;
  }
};

// Update email settings
export const updateEmailSettings = async (
  settings: EmailSettingsForm
): Promise<boolean> => {
  try {
    // In a real app, this would update the settings in the database
    console.log('Email settings updated:', settings);
    return true;
  } catch (error) {
    console.error('Error updating email settings:', error);
    throw error;
  }
};

const adminService = {
  getAdminStats,
  getAdminUsers,
  getAdminContent,
  updateUserStatus,
  updateEmailSettings
};

export default adminService;
