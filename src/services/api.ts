
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  createdAt: string;
  timeAgo: string;
  upvotes: number;
  downvotes: number;
  replies: Comment[];
}

// Augment the API service with new methods
const apiService = {
  // Authentication methods
  login: async (credentials: LoginCredentials): Promise<User> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation logic
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      return {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'Startup Founder',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User',
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  socialLogin: async (provider: 'email' | 'google' | 'facebook'): Promise<User> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock social login logic
    return {
      id: '2',
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      email: `user@${provider}.com`,
      role: 'Startup Enthusiast',
      avatar: `https://ui-avatars.com/api/?name=${provider}+User`,
    };
  },
  
  register: async (data: RegisterData): Promise<User> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, we would validate and save the user data
    return {
      id: '1',
      name: data.name,
      email: data.email,
      role: 'Startup Founder',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`,
    };
  },
  
  getCurrentUser: async (): Promise<User> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock logic to get current user
    return {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'Startup Founder',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User',
    };
  },
  
  updateUserProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, we would update the user profile in the database
    return {
      id: userId,
      name: data.name || 'Demo User',
      email: data.email || 'demo@example.com',
      role: data.role || 'Startup Founder',
      avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Demo User')}`,
      bio: data.bio,
      location: data.location,
      website: data.website,
      socialLinks: data.socialLinks,
    };
  },
  
  requestPasswordReset: async (email: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock password reset logic
    if (email !== 'demo@example.com') {
      // For demo purposes we'll pretend we sent an email
      console.log(`Password reset requested for: ${email}`);
      return;
    }
    
    return;
  },
  
  verifyPasswordResetToken: async (token: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock token verification logic
    return token === 'valid-token';
  },
  
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock password reset logic
    if (token !== 'valid-token') {
      throw new Error('Invalid or expired token');
    }
    
    console.log(`Password updated to: ${newPassword}`);
    return;
  },
  
  // Posts methods
  getPosts: async (category?: string, page = 1, pageSize = 10): Promise<any[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock posts
    const allPosts = Array.from({ length: 50 }, (_, i) => ({
      id: `post-${i + 1}`,
      title: `Post ${i + 1} Title: ${['Exciting new startup', 'Investment opportunity', 'Tech innovation', 'Industry insights'][i % 4]}`,
      content: `This is the content of post ${i + 1}. It contains information about ${['startups', 'funding', 'tech', 'innovation'][i % 4]} in the ecosystem. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum, nisl nisi consectetur nisi, euismod consectetur nisi nisi vel nisi.`,
      author: {
        id: `user-${(i % 5) + 1}`,
        name: `Author ${(i % 5) + 1}`,
        avatar: `https://ui-avatars.com/api/?name=Author+${(i % 5) + 1}`,
        role: ['Startup Founder', 'Investor', 'Mentor', 'Developer', 'Product Manager'][i % 5],
      },
      category: ['Startup News', 'Expert Opinions', 'Funding Updates', 'Tech Trends', 'Product Launch'][i % 5],
      upvotes: Math.floor(Math.random() * 100),
      downvotes: Math.floor(Math.random() * 20),
      commentCount: Math.floor(Math.random() * 30),
      timeAgo: `${Math.floor(Math.random() * 24) + 1}h ago`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      tags: [`tag-${i % 10 + 1}`, `tag-${(i + 5) % 15 + 1}`],
      imageUrl: i % 3 === 0 ? `https://picsum.photos/seed/${i + 1}/800/400` : undefined,
      status: 'published',
      comments: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
        id: `comment-${i}-${j}`,
        content: `This is comment ${j + 1} on post ${i + 1}. Very insightful post!`,
        author: {
          id: `user-${(j % 5) + 6}`,
          name: `Commenter ${(j % 5) + 1}`,
          avatar: `https://ui-avatars.com/api/?name=Commenter+${(j % 5) + 1}`,
          role: ['Startup Founder', 'Investor', 'Mentor', 'Developer', 'Product Manager'][j % 5],
        },
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)).toISOString(),
        timeAgo: `${Math.floor(Math.random() * 12) + 1}h ago`,
        upvotes: Math.floor(Math.random() * 20),
        downvotes: Math.floor(Math.random() * 5),
        replies: Array.from({ length: Math.floor(Math.random() * 3) }, (_, k) => ({
          id: `reply-${i}-${j}-${k}`,
          content: `This is a reply to comment ${j + 1} on post ${i + 1}.`,
          author: {
            id: `user-${(k % 5) + 11}`,
            name: `Replier ${(k % 5) + 1}`,
            avatar: `https://ui-avatars.com/api/?name=Replier+${(k % 5) + 1}`,
            role: ['Startup Founder', 'Investor', 'Mentor', 'Developer', 'Product Manager'][k % 5],
          },
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
          timeAgo: `${Math.floor(Math.random() * 6) + 1}h ago`,
          upvotes: Math.floor(Math.random() * 10),
          downvotes: Math.floor(Math.random() * 2),
          replies: []
        }))
      }))
    }));
    
    // Filter by category if provided
    const filteredPosts = category
      ? allPosts.filter(post => post.category === category)
      : allPosts;
    
    // Calculate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return filteredPosts.slice(start, end);
  },
  
  getLatestPosts: async (category?: string, limit = 3): Promise<any[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Generate fresh mock posts
    const latestPosts = Array.from({ length: limit }, (_, i) => ({
      id: `latest-post-${Date.now()}-${i}`,
      title: `New Post: ${['Breaking news', 'Hot update', 'Just announced', 'Fresh insight'][i % 4]}`,
      content: `This is a brand new post about ${['startups', 'funding', 'tech', 'innovation'][i % 4]} that just arrived in the feed. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      author: {
        id: `user-${(i % 3) + 1}`,
        name: `Fresh Author ${(i % 3) + 1}`,
        avatar: `https://ui-avatars.com/api/?name=Fresh+Author+${(i % 3) + 1}`,
        role: ['Startup Founder', 'Investor', 'Mentor'][i % 3],
      },
      category: category || ['Startup News', 'Expert Opinions', 'Funding Updates'][i % 3],
      upvotes: Math.floor(Math.random() * 5),
      downvotes: 0,
      commentCount: Math.floor(Math.random() * 3),
      timeAgo: 'Just now',
      createdAt: new Date().toISOString(),
      tags: [`trending`, `new`, `featured`],
      imageUrl: i === 0 ? `https://picsum.photos/seed/latest${i}/800/400` : undefined,
      status: 'published',
      comments: []
    }));
    
    return latestPosts;
  },
  
  addComment: async (postId: string, content: string, parentId?: string): Promise<Comment> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Create a new comment
    return {
      id: `comment-${Date.now()}`,
      content: content,
      author: {
        id: '1',
        name: 'Demo User',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User',
        role: 'Startup Founder',
      },
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
      upvotes: 0,
      downvotes: 0,
      replies: []
    };
  },
  
  // Mock implementations for other parts of the system to fix type errors
  getAdminStats: async () => ({ users: 0, posts: 0, comments: 0, events: 0 }),
  getUserProfile: async (id: string) => ({ id, name: 'User', role: 'Member', avatar: '' }),
  getCommunityDiscussions: async () => [],
  getCommunityMembers: async () => [],
  getCommunityEvents: async () => [],
  getMarketInsights: async () => [],
  getUserActivityInsights: async () => [],
  getFundingInsights: async () => [],
  getAvailableRewards: async () => [],
  getUserBadges: async () => [],
  getPointsLeaderboard: async () => [],
};

export { apiService };
