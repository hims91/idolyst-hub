
import { supabase } from '@/integrations/supabase/client';
import { AdminStats, AdminContentState, AdminUser, AdminPost, PaginatedResponse, EmailSettingsForm } from '@/types/api';

// Get admin dashboard stats
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // In a real app, this would fetch from the backend
    // This is mocked data for now
    return {
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
      .select('id, name, email, role, created_at');

    if (error) throw error;

    // Transform to expected format
    return users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email || 'no-email@example.com',
      role: user.role || 'user',
      status: 'active', // Mock status
      createdAt: user.created_at,
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
      .select(`
        id,
        title,
        content,
        user_id,
        visibility,
        created_at,
        updated_at,
        category,
        comments:comment_count
      `);
    
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
    
    // Transform to expected format
    const posts: AdminPost[] = data.map(post => ({
      id: post.id,
      title: post.title || post.content.substring(0, 50) + '...',
      author: {
        id: post.user_id,
        name: 'User ' + post.user_id.substring(0, 5), // Mock author name
      },
      category: post.category || 'General',
      status: post.visibility || 'public',
      comments: post.comments || 0,
      published: post.created_at,
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
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
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
