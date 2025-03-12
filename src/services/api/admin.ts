
import { AdminStats } from './types';

// Mock admin statistics data
const mockAdminStats: AdminStats = {
  users: 2547,
  posts: 8976,
  comments: 23598,
  events: 145,
  summaryCards: [
    {
      title: 'New Users',
      value: 127,
      change: 12.5,
      trend: 'up',
    },
    {
      title: 'Active Users',
      value: 1845,
      change: 8.2,
      trend: 'up',
    },
    {
      title: 'Engagement Rate',
      value: 27,
      change: -3.1,
      trend: 'down',
    },
    {
      title: 'Revenue',
      value: 18650,
      change: 14.3,
      trend: 'up',
    },
  ],
  userActivity: [
    { date: '2023-01', active: 1250, new: 85 },
    { date: '2023-02', active: 1320, new: 92 },
    { date: '2023-03', active: 1480, new: 105 },
    { date: '2023-04', active: 1590, new: 120 },
    { date: '2023-05', active: 1680, new: 118 },
    { date: '2023-06', active: 1790, new: 132 },
  ],
  contentDistribution: [
    { type: 'Posts', value: 45 },
    { type: 'Comments', value: 28 },
    { type: 'Events', value: 15 },
    { type: 'Other', value: 12 },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 13200 },
    { month: 'Mar', revenue: 14800 },
    { month: 'Apr', revenue: 15900 },
    { month: 'May', revenue: 16800 },
    { month: 'Jun', revenue: 17900 },
  ],
};

const getAllUsers = async () => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i === 0 ? 'Admin' : 'User',
    status: i % 5 === 0 ? 'Inactive' : 'Active',
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
};

const getStats = async (): Promise<AdminStats> => {
  return mockAdminStats;
};

const getSettings = async () => {
  return {
    generalSettings: {
      siteName: 'Idolyst',
      siteDescription: 'Startup ecosystem platform',
      contactEmail: 'admin@idolyst.com',
      supportPhone: '+1 (555) 123-4567',
    },
    emailSettings: {
      smtpServer: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'notifications@idolyst.com',
      senderName: 'Idolyst Notifications',
      senderEmail: 'notifications@idolyst.com',
    },
    integrationSettings: {
      googleAnalyticsId: 'UA-123456789-1',
      recaptchaKey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
      mailchimpApiKey: '*****************************',
      stripePublicKey: 'pk_test_***********************',
    },
  };
};

export const adminService = {
  getAllUsers,
  getStats,
  getSettings,
};
