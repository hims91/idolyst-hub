import { AdminStats, User } from './types';

// This is a placeholder for the actual implementation.
// Replace this with your actual API calls to fetch admin data.
// For example, using axios or fetch.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const getAdminStats = async (): Promise<AdminStats> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: AdminStats = {
        users: 1234,
        posts: 5678,
        comments: 9101,
        events: 1121,
        summaryCards: [
          { title: 'Total Users', value: 1234, change: 123, trend: 'up' },
          { title: 'Total Posts', value: 5678, change: -456, trend: 'down' },
          { title: 'Total Comments', value: 9101, change: 789, trend: 'up' },
          { title: 'Total Events', value: 1121, change: 11, trend: 'down' },
        ],
        userActivity: [
          { date: '2023-01-01', active: 123, new: 10 },
          { date: '2023-01-02', active: 456, new: 20 },
          { date: '2023-01-03', active: 789, new: 30 },
        ],
        contentDistribution: [
          { type: 'Posts', value: 50 },
          { type: 'Comments', value: 30 },
          { type: 'Events', value: 20 },
        ],
        monthlyRevenue: [
          { month: 'Jan', revenue: 12345 },
          { month: 'Feb', revenue: 67890 },
          { month: 'Mar', revenue: 23456 },
        ],
      };
      resolve(mockData);
    }, 500);
  });
};

export const getAdminUsers = async (page: number = 1, pageSize: number = 10): Promise<{ users: User[]; total: number }> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUsers: User[] = Array.from({ length: pageSize }, (_, i) => ({
        id: `user-${(page - 1) * pageSize + i + 1}`,
        name: `User ${(page - 1) * pageSize + i + 1}`,
        role: 'user',
        email: `user${(page - 1) * pageSize + i + 1}@example.com`,
        company: 'Example Corp',
        bio: 'A short bio',
        location: 'Some City',
        website: 'https://example.com',
        joinDate: '2023-01-01',
        badges: [],
        skills: [],
        followers: 10,
        following: 5,
        posts: 3,
        startups: 1,
        investments: 0,
      }));
      
      const totalUsers = 50; // Example total number of users
      
      resolve({ users: mockUsers, total: totalUsers });
    }, 500);
  });
};

// Add more admin API calls as needed, e.g., for managing content, settings, etc.
