export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
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
    };
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
    }));
    
    return latestPosts;
  },
};

export { apiService };
