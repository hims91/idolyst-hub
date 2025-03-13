
import { AdminStats } from '@/services/api/types';

// Mock admin service
export const adminService = {
  getAllUsers: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i === 0 ? 'admin' : 'user',
      status: i % 5 === 0 ? 'inactive' : 'active',
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    }));
  },
  
  getStats: async (): Promise<AdminStats> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      users: 1254,
      posts: 4521,
      comments: 8795,
      events: 156,
      summaryCards: [
        {
          title: 'New Users',
          value: 127,
          change: 12.5,
          trend: 'up',
        },
        {
          title: 'Page Views',
          value: 54896,
          change: 8.2,
          trend: 'up',
        },
        {
          title: 'Session Duration',
          value: 2.5,
          change: -3.1,
          trend: 'down',
        },
        {
          title: 'Bounce Rate',
          value: 42.1,
          change: -5.8,
          trend: 'up',
        },
      ],
      userActivity: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: Math.floor(Math.random() * 500) + 300,
        new: Math.floor(Math.random() * 50) + 10,
      })),
      contentDistribution: [
        { type: 'Posts', value: 45 },
        { type: 'Comments', value: 30 },
        { type: 'Events', value: 15 },
        { type: 'Other', value: 10 },
      ],
      monthlyRevenue: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
        revenue: Math.floor(Math.random() * 10000) + 5000,
      })),
    };
  },
  
  getSettings: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      emailNotifications: true,
      marketingEmails: false,
      accountVisibility: 'public',
      twoFactorAuth: true,
      theme: 'system',
      language: 'en',
    };
  },
  
  getAdminUsers: async () => {
    return await adminService.getAllUsers();
  },
  
  getAdminPosts: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `post-${i + 1}`,
      title: `Post ${i + 1} Title`,
      author: `Author ${(i % 5) + 1}`,
      category: ['Startup News', 'Expert Opinions', 'Funding Updates', 'Tech Trends', 'Product Launch'][i % 5],
      status: i % 10 === 0 ? 'draft' : i % 7 === 0 ? 'pending' : 'published',
      comments: Math.floor(Math.random() * 30),
      published: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
    }));
  },
  
  updateUserStatus: async (userId: string, newStatus: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`User ${userId} status updated to ${newStatus}`);
    return { success: true };
  },
  
  updateEmailSettings: async (settings: any) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    console.log('Email settings updated:', settings);
    return { success: true };
  },
};
