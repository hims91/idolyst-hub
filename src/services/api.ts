
import { PostData } from '@/components/ui/PostCard';
import { CampaignData } from '@/components/ui/CrowdfundingCard';

// Define API base URL - replace with your actual backend API URL
const API_BASE_URL = 'https://api.idolyst.com';

// Define common types for API responses
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Define auth-related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  company?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: string;
  following: number;
  followers: number;
  posts: number;
  startups: number;
  investments: number;
  skills: string[];
  badges: {
    id: string;
    name: string;
  }[];
  status?: 'active' | 'suspended' | 'pending';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// Admin-related types
export interface AdminStats {
  summaryCards: {
    type: 'users' | 'posts' | 'campaigns' | 'revenue';
    title: string;
    value: string | number;
    change: number;
  }[];
  userActivity: {
    date: string;
    signups: number;
    active: number;
  }[];
  contentDistribution: {
    name: string;
    value: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  contactEmail: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
}

export interface EmailSettings {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  senderEmail: string;
  senderName: string;
  enableEmailNotifications: boolean;
}

export interface IntegrationSettings {
  googleAnalyticsId: string;
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  twitterApiKey: string;
  linkedinApiKey: string;
}

// Insights-related types
export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  source: string;
  imageUrl?: string;
}

export interface ActivityInsight {
  id: string;
  period: string;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  postsCreated: number;
  campaignsStarted: number;
  investments: number;
  chart: {
    name: string;
    users: number;
    posts: number;
    investments: number;
  }[];
}

export interface FundingInsight {
  id: string;
  category: string;
  totalFunding: number;
  averageRound: number;
  medianValuation: number;
  numberOfDeals: number;
  topInvestors: {
    name: string;
    deals: number;
    amount: number;
  }[];
  quarterlyTrends: {
    quarter: string;
    amount: number;
    deals: number;
  }[];
}

// Community-related types
export interface CommunityDiscussion {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  category: string;
  tags: string[];
  replies: number;
  views: number;
  lastActivity: string;
  pinned: boolean;
}

export interface CommunityMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  joinDate: string;
  contributions: number;
  badges: {
    id: string;
    name: string;
  }[];
  lastActive: string;
  online: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'meetup' | 'conference' | 'workshop';
  startDate: string;
  endDate: string;
  location: string;
  organizer: {
    id: string;
    name: string;
  };
  attendees: number;
  maxAttendees?: number;
  imageUrl?: string;
}

// Rewards-related types
export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  category: 'achievement' | 'badge' | 'perk';
  unlocked?: boolean;
  progress?: number;
}

export interface UserBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  badges: number;
}

// For now, we'll use mock data and simulate API calls
// In a real app, these would be actual API calls to your backend
class ApiService {
  // Auth-related API calls
  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock response
    if (credentials.email === 'demo@idolyst.com' && credentials.password === 'password') {
      return {
        id: 'user-1',
        name: 'Alex Johnson',
        email: credentials.email,
        role: 'Founder & CEO',
        company: 'TechNova Solutions',
        bio: 'Serial entrepreneur and angel investor with 10+ years in SaaS and fintech.',
        location: 'San Francisco, CA',
        website: 'alexjohnson.dev',
        joinDate: 'January 2022',
        following: 483,
        followers: 1289,
        posts: 67,
        startups: 3,
        investments: 12,
        skills: ['Product Strategy', 'Growth Hacking', 'SaaS', 'Fintech'],
        badges: [
          { id: 'top-contributor', name: 'Top Contributor' },
          { id: 'verified-founder', name: 'Verified Founder' },
        ],
      };
    }
    
    throw new Error('Invalid credentials');
  }
  
  async register(data: RegisterData): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration
    return {
      id: 'new-user',
      name: data.name,
      email: data.email,
      role: 'Member',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      following: 0,
      followers: 0,
      posts: 0,
      startups: 0,
      investments: 0,
      skills: [],
      badges: [],
    };
  }
  
  async getCurrentUser(): Promise<User | null> {
    // In a real app, this would check for an auth token and return the current user
    // For demo purposes, we'll return a mock user
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: 'user-1',
      name: 'Alex Johnson',
      email: 'demo@idolyst.com',
      role: 'Founder & CEO',
      company: 'TechNova Solutions',
      bio: 'Serial entrepreneur and angel investor with 10+ years in SaaS and fintech.',
      location: 'San Francisco, CA',
      website: 'alexjohnson.dev',
      joinDate: 'January 2022',
      following: 483,
      followers: 1289,
      posts: 67,
      startups: 3,
      investments: 12,
      skills: ['Product Strategy', 'Growth Hacking', 'SaaS', 'Fintech'],
      badges: [
        { id: 'top-contributor', name: 'Top Contributor' },
        { id: 'verified-founder', name: 'Verified Founder' },
      ],
    };
  }
  
  // Posts-related API calls
  async getPosts(category?: string): Promise<PostData[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data (using the same data as in Feed.tsx)
    const posts = [
      {
        id: '1',
        title: 'Announcing our $10M Series A funding round',
        content: "We're thrilled to announce that we've secured $10M in Series A funding led by Sequoia Capital, with participation from Y Combinator and angel investors. This funding will help us scale our platform and bring our solution to more customers globally.",
        author: {
          name: 'Sarah Johnson',
          role: 'Founder & CEO at TechFlow',
        },
        category: 'Funding Updates',
        upvotes: 124,
        downvotes: 4,
        commentCount: 28,
        timeAgo: '3h ago',
      },
      {
        id: '2',
        title: 'The future of AI in startup ecosystems',
        content: "Artificial intelligence is fundamentally changing how startups operate and scale. From automating routine tasks to enabling data-driven decision making, AI tools are becoming essential for competitive advantage. Here's my take on how founders should approach AI integration...",
        author: {
          name: 'David Chen',
          role: 'Tech Analyst',
        },
        category: 'Expert Opinions',
        upvotes: 87,
        downvotes: 12,
        commentCount: 15,
        timeAgo: '6h ago',
      },
      {
        id: '3',
        title: 'Regulatory changes impacting fintech startups in 2023',
        content: "New regulations coming into effect this quarter will significantly impact how fintech startups operate, particularly around data privacy and open banking. Here's a breakdown of what founders need to know and how to prepare your compliance strategy.",
        author: {
          name: 'Miguel Rodriguez',
          role: 'Fintech Investor',
        },
        category: 'Startup News',
        upvotes: 56,
        downvotes: 3,
        commentCount: 12,
        timeAgo: '12h ago',
      },
    ];
    
    // Filter by category if provided
    if (category && category !== 'all') {
      return posts.filter(post => post.category === category);
    }
    
    return posts;
  }
  
  // Campaigns-related API calls
  async getCampaigns(category?: string, searchQuery?: string): Promise<CampaignData[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get campaigns from Crowdfunding.tsx
    const campaigns = [
      {
        id: '1',
        title: 'EcoHarvest: Revolutionizing urban farming with AI and IoT',
        shortDescription: 'Smart city farming solution using AI and IoT technology',
        description: 'EcoHarvest is developing a revolutionary urban farming solution that leverages AI and IoT technology to optimize crop growth in urban environments. Our smart vertical farming units can be installed in office buildings, restaurants, and homes, reducing food miles and providing fresh produce year-round.',
        founders: [
          {
            name: 'Jennifer Kim',
            role: 'CEO & Founder',
          },
          {
            name: 'Michael Chen',
            role: 'CTO',
          }
        ],
        category: 'CleanTech',
        tags: ['Sustainable', 'AgTech', 'IoT', 'AI'],
        raisedAmount: 420000,
        goalAmount: 750000,
        investorCount: 142,
        daysLeft: 21,
        timeline: [
          { name: 'Week 1', value: 125000 },
          { name: 'Week 2', value: 210000 },
          { name: 'Week 3', value: 290000 },
          { name: 'Week 4', value: 380000 },
          { name: 'Week 5', value: 420000 },
        ],
        featured: true,
        trending: true,
      },
      {
        id: '2',
        title: 'MediConnect: Blockchain-based health record platform',
        shortDescription: 'Secure health records platform using blockchain technology',
        description: 'MediConnect is building a secure, transparent platform for health records using blockchain technology. Our solution enables patients to control their medical data while allowing authorized healthcare providers seamless access to critical information. This improves care coordination and reduces medical errors.',
        founders: [
          {
            name: 'Dr. James Wilson',
            role: 'CEO',
          }
        ],
        category: 'HealthTech',
        tags: ['Blockchain', 'HealthTech', 'Data Privacy'],
        raisedAmount: 850000,
        goalAmount: 1000000,
        investorCount: 230,
        daysLeft: 12,
        timeline: [
          { name: 'Week 1', value: 300000 },
          { name: 'Week 2', value: 450000 },
          { name: 'Week 3', value: 600000 },
          { name: 'Week 4', value: 720000 },
          { name: 'Week 5', value: 850000 },
        ],
      },
      {
        id: '3',
        title: 'QuantumSec: Next-gen quantum-resistant encryption',
        shortDescription: 'Future-proof encryption resistant to quantum computing threats',
        description: 'QuantumSec is developing encryption solutions that can withstand attacks from quantum computers. As quantum computing advances, traditional encryption methods will become vulnerable. Our technology ensures that sensitive data remains secure in the post-quantum computing era.',
        founders: [
          {
            name: 'Alex Rahman',
            role: 'Founder & Chief Scientist',
          }
        ],
        category: 'CyberSecurity',
        tags: ['Quantum', 'Encryption', 'Security', 'Enterprise'],
        raisedAmount: 1200000,
        goalAmount: 1500000,
        investorCount: 85,
        daysLeft: 45,
        timeline: [
          { name: 'Week 1', value: 250000 },
          { name: 'Week 2', value: 500000 },
          { name: 'Week 3', value: 750000 },
          { name: 'Week 4', value: 950000 },
          { name: 'Week 5', value: 1200000 },
        ],
        featured: true,
      },
      {
        id: '4',
        title: 'CircleLoop: Subscription-based electric vehicle sharing',
        shortDescription: 'Monthly subscription for unlimited EV access',
        description: 'CircleLoop offers a monthly subscription service that provides unlimited access to a fleet of electric vehicles. Members can pick up and drop off vehicles at convenient locations throughout the city, eliminating the hassles of car ownership while reducing carbon emissions.',
        founders: [
          {
            name: 'Olivia Martinez',
            role: 'Co-Founder & CEO',
          }
        ],
        category: 'Mobility',
        tags: ['Electric Vehicles', 'Subscription', 'Sharing Economy'],
        raisedAmount: 680000,
        goalAmount: 1200000,
        investorCount: 170,
        daysLeft: 18,
        timeline: [
          { name: 'Week 1', value: 180000 },
          { name: 'Week 2', value: 320000 },
          { name: 'Week 3', value: 450000 },
          { name: 'Week 4', value: 590000 },
          { name: 'Week 5', value: 680000 },
        ],
        trending: true,
      },
    ];
    
    let filteredCampaigns = [...campaigns];
    
    // Filter by category
    if (category === 'featured') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.featured);
    } else if (category === 'trending') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.trending);
    } else if (category === 'ending') {
      filteredCampaigns = filteredCampaigns.sort((a, b) => a.daysLeft - b.daysLeft);
    } else if (category === 'new') {
      filteredCampaigns = [...filteredCampaigns].reverse();
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(
        campaign =>
          campaign.title.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query) ||
          campaign.category.toLowerCase().includes(query) ||
          campaign.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filteredCampaigns;
  }
  
  // User profile-related API calls
  async getUserProfile(userId: string): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock user data
    return {
      id: userId,
      name: 'Alex Johnson',
      email: 'alex@technova.io',
      role: 'Founder & CEO',
      company: 'TechNova Solutions',
      bio: 'Serial entrepreneur and angel investor with 10+ years in SaaS and fintech. Currently building TechNova Solutions, a B2B platform helping startups optimize growth strategies.',
      location: 'San Francisco, CA',
      website: 'alexjohnson.dev',
      joinDate: 'January 2022',
      following: 483,
      followers: 1289,
      posts: 67,
      startups: 3,
      investments: 12,
      skills: ['Product Strategy', 'Growth Hacking', 'SaaS', 'Fintech', 'Team Building', 'Fundraising'],
      badges: [
        { id: 'top-contributor', name: 'Top Contributor' },
        { id: 'verified-founder', name: 'Verified Founder' },
        { id: 'angel-investor', name: 'Angel Investor' },
      ],
    };
  }
  
  // Admin-related API calls
  async getAdminStats(): Promise<AdminStats> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      summaryCards: [
        { type: 'users', title: 'Total Users', value: 1824, change: 12.3 },
        { type: 'posts', title: 'Total Posts', value: 4567, change: 8.7 },
        { type: 'campaigns', title: 'Active Campaigns', value: 48, change: 15.2 },
        { type: 'revenue', title: 'Monthly Revenue', value: '$18,245', change: -3.1 },
      ],
      userActivity: [
        { date: 'Jan', signups: 120, active: 840 },
        { date: 'Feb', signups: 140, active: 950 },
        { date: 'Mar', signups: 160, active: 1100 },
        { date: 'Apr', signups: 190, active: 1300 },
        { date: 'May', signups: 220, active: 1450 },
        { date: 'Jun', signups: 240, active: 1600 },
      ],
      contentDistribution: [
        { name: 'Posts', value: 45 },
        { name: 'Campaigns', value: 20 },
        { name: 'Resources', value: 15 },
        { name: 'Events', value: 10 },
        { name: 'Other', value: 10 },
      ],
      monthlyRevenue: [
        { month: 'Jan', revenue: 12000 },
        { month: 'Feb', revenue: 14500 },
        { month: 'Mar', revenue: 16800 },
        { month: 'Apr', revenue: 15600 },
        { month: 'May', revenue: 17200 },
        { month: 'Jun', revenue: 18245 },
      ],
    };
  }
  
  async getAdminPosts(): Promise<PostData[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.getPosts();
  }
  
  async getAdminCampaigns(): Promise<CampaignData[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.getCampaigns();
  }
  
  async deletePost(postId: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Deleted post with ID: ${postId}`);
    return { success: true };
  }
  
  async deleteCampaign(campaignId: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Deleted campaign with ID: ${campaignId}`);
    return { success: true };
  }
  
  async updatePostStatus(postId: string, status: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Updated post ${postId} status to: ${status}`);
    return { success: true };
  }
  
  async updateCampaignStatus(campaignId: string, status: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Updated campaign ${campaignId} status to: ${status}`);
    return { success: true };
  }
  
  async getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'user-1',
        name: 'Alex Johnson',
        email: 'alex@technova.io',
        role: 'Admin',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        joinDate: 'January 2022',
        following: 483,
        followers: 1289,
        posts: 67,
        startups: 3,
        investments: 12,
        skills: [],
        badges: [],
        status: 'active',
      },
      {
        id: 'user-2',
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        role: 'Founder',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        joinDate: 'March 2022',
        following: 215,
        followers: 589,
        posts: 32,
        startups: 1,
        investments: 5,
        skills: [],
        badges: [],
        status: 'active',
      },
      {
        id: 'user-3',
        name: 'Michael Chen',
        email: 'michael@example.com',
        role: 'Investor',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
        joinDate: 'June 2022',
        following: 104,
        followers: 327,
        posts: 12,
        startups: 0,
        investments: 14,
        skills: [],
        badges: [],
        status: 'suspended',
      },
      {
        id: 'user-4',
        name: 'Emily Rodriguez',
        email: 'emily@example.com',
        role: 'Member',
        avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
        joinDate: 'September 2022',
        following: 87,
        followers: 123,
        posts: 8,
        startups: 0,
        investments: 1,
        skills: [],
        badges: [],
        status: 'pending',
      },
    ];
  }
  
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Deleted user with ID: ${userId}`);
    return { success: true };
  }
  
  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'pending'): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Updated user ${userId} status to: ${status}`);
    return { success: true };
  }
  
  async getGeneralSettings(): Promise<GeneralSettings> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      siteName: 'Idolyst',
      siteDescription: 'A platform connecting startups, founders, and investors',
      logoUrl: '/logo.svg',
      contactEmail: 'support@idolyst.com',
      allowRegistration: true,
      requireEmailVerification: true,
      defaultUserRole: 'Member',
    };
  }
  
  async getEmailSettings(): Promise<EmailSettings> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      smtpServer: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'notifications@idolyst.com',
      smtpPassword: '********',
      senderEmail: 'no-reply@idolyst.com',
      senderName: 'Idolyst Team',
      enableEmailNotifications: true,
    };
  }
  
  async getIntegrationSettings(): Promise<IntegrationSettings> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      googleAnalyticsId: 'UA-XXXXXXXXX-X',
      recaptchaSiteKey: '6LcXXXXXXXXXXXXXXXXXXXX',
      recaptchaSecretKey: '6LcXXXXXXXXXXXXXXXXXXXX',
      stripePublishableKey: 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX',
      stripeSecretKey: 'sk_test_XXXXXXXXXXXXXXXXXXXXXXXX',
      twitterApiKey: 'XXXXXXXXXXXXXXXXXXXXXXXXX',
      linkedinApiKey: 'XXXXXXXXXXXXXXXXXXXXXXXXX',
    };
  }
  
  async updateGeneralSettings(settings: Partial<GeneralSettings>): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Updated general settings:', settings);
    return { success: true };
  }
  
  async updateEmailSettings(settings: Partial<EmailSettings>): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Updated email settings:', settings);
    return { success: true };
  }
  
  async updateIntegrationSettings(settings: Partial<IntegrationSettings>): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Updated integration settings:', settings);
    return { success: true };
  }
  
  // Insights API calls
  async getMarketInsights(): Promise<MarketInsight[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'insight-1',
        title: 'AI Startups Received Record Funding in Q2',
        description: 'Venture capital investments in AI-focused startups reached $12.4B in Q2 2023, up 28% from the previous quarter. The sector continues to attract significant attention amid advances in generative AI.',
        category: 'Venture Capital',
        date: 'July 15, 2023',
        source: 'CB Insights',
        imageUrl: 'https://images.unsplash.com/photo-1677442135029-0243d29e6427',
      },
      {
        id: 'insight-2',
        title: 'Fintech Valuation Reset Continues',
        description: 'Down rounds continue for fintech startups as the sector readjusts after the pandemic-fueled boom. Average valuation multiples are down 40% from their 2021 peak.',
        category: 'Fintech',
        date: 'July 10, 2023',
        source: 'PitchBook',
      },
      {
        id: 'insight-3',
        title: 'Climate Tech Investments Show Resilience',
        description: 'Despite the overall slowdown in venture funding, climate tech investments have shown remarkable resilience, with only a 5% YoY decrease compared to 30% across all sectors.',
        category: 'CleanTech',
        date: 'July 5, 2023',
        source: 'Climate Tech VC',
        imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e',
      },
    ];
  }
  
  async getUserActivityInsights(): Promise<ActivityInsight> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: 'activity-1',
      period: 'Last 30 Days',
      totalUsers: 4328,
      activeUsers: 1872,
      newUsers: 342,
      postsCreated: 892,
      campaignsStarted: 37,
      investments: 124,
      chart: [
        { name: 'Week 1', users: 1720, posts: 210, investments: 28 },
        { name: 'Week 2', users: 1840, posts: 235, investments: 32 },
        { name: 'Week 3', users: 1910, posts: 242, investments: 30 },
        { name: 'Week 4', users: 1872, posts: 205, investments: 34 },
      ],
    };
  }
  
  async getFundingInsights(): Promise<FundingInsight[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'funding-1',
        category: 'SaaS',
        totalFunding: 4500000000,
        averageRound: 18000000,
        medianValuation: 85000000,
        numberOfDeals: 218,
        topInvestors: [
          { name: 'Sequoia Capital', deals: 24, amount: 420000000 },
          { name: 'Andreessen Horowitz', deals: 22, amount: 380000000 },
          { name: 'Accel', deals: 18, amount: 310000000 },
        ],
        quarterlyTrends: [
          { quarter: 'Q3 2022', amount: 1200000000, deals: 58 },
          { quarter: 'Q4 2022', amount: 1050000000, deals: 51 },
          { quarter: 'Q1 2023', amount: 980000000, deals: 48 },
          { quarter: 'Q2 2023', amount: 1270000000, deals: 61 },
        ],
      },
      {
        id: 'funding-2',
        category: 'Fintech',
        totalFunding: 3800000000,
        averageRound: 22000000,
        medianValuation: 95000000,
        numberOfDeals: 172,
        topInvestors: [
          { name: 'Tiger Global', deals: 15, amount: 380000000 },
          { name: 'Ribbit Capital', deals: 14, amount: 320000000 },
          { name: 'Insight Partners', deals: 12, amount: 290000000 },
        ],
        quarterlyTrends: [
          { quarter: 'Q3 2022', amount: 1100000000, deals: 48 },
          { quarter: 'Q4 2022', amount: 950000000, deals: 42 },
          { quarter: 'Q1 2023', amount: 820000000, deals: 38 },
          { quarter: 'Q2 2023', amount: 930000000, deals: 44 },
        ],
      },
    ];
  }
  
  // Community API calls
  async getCommunityDiscussions(): Promise<CommunityDiscussion[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'discussion-1',
        title: 'Tips for founder mental health during fundraising',
        author: {
          id: 'user-12',
          name: 'Jessica Park',
          avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
          role: 'Founder',
        },
        category: 'Founder Resources',
        tags: ['Mental Health', 'Fundraising', 'Founder Journey'],
        replies: 24,
        views: 342,
        lastActivity: '2 hours ago',
        pinned: true,
      },
      {
        id: 'discussion-2',
        title: 'B2B SaaS pricing strategies that actually work',
        author: {
          id: 'user-28',
          name: 'Daniel Roberts',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
          role: 'Growth Advisor',
        },
        category: 'Marketing & Sales',
        tags: ['Pricing', 'SaaS', 'Revenue', 'Growth'],
        replies: 18,
        views: 276,
        lastActivity: '5 hours ago',
        pinned: false,
      },
      {
        id: 'discussion-3',
        title: 'Navigating technical co-founder relationships',
        author: {
          id: 'user-36',
          name: 'Rachel Thompson',
          avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
          role: 'Founder & CEO',
        },
        category: 'Team Building',
        tags: ['Co-Founders', 'Technical', 'Relationships'],
        replies: 32,
        views: 415,
        lastActivity: '1 day ago',
        pinned: false,
      },
      {
        id: 'discussion-4',
        title: 'Recession-proof startup ideas for 2023',
        author: {
          id: 'user-41',
          name: 'Mark Wilson',
          avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
          role: 'Venture Partner',
        },
        category: 'Ideas & Opportunities',
        tags: ['Recession', 'Ideas', 'Market Trends'],
        replies: 42,
        views: 528,
        lastActivity: '1 day ago',
        pinned: false,
      },
    ];
  }
  
  async getCommunityMembers(): Promise<CommunityMember[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'member-1',
        name: 'Alex Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        role: 'Founder & CEO',
        joinDate: 'January 2022',
        contributions: 67,
        badges: [
          { id: 'top-contributor', name: 'Top Contributor' },
          { id: 'verified-founder', name: 'Verified Founder' },
        ],
        lastActive: '10 minutes ago',
        online: true,
      },
      {
        id: 'member-2',
        name: 'Jessica Park',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        role: 'Founder',
        joinDate: 'March 2022',
        contributions: 43,
        badges: [
          { id: 'verified-founder', name: 'Verified Founder' },
        ],
        lastActive: '2 hours ago',
        online: true,
      },
      {
        id: 'member-3',
        name: 'David Chen',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        role: 'Tech Analyst',
        joinDate: 'February 2022',
        contributions: 38,
        badges: [
          { id: 'expert-analyst', name: 'Expert Analyst' },
        ],
        lastActive: '1 day ago',
        online: false,
      },
      {
        id: 'member-4',
        name: 'Sarah Williams',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        role: 'Investor',
        joinDate: 'April 2022',
        contributions: 25,
        badges: [
          { id: 'verified-investor', name: 'Verified Investor' },
        ],
        lastActive: '3 days ago',
        online: false,
      },
    ];
  }
  
  async getCommunityEvents(): Promise<CommunityEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'event-1',
        title: 'Founder Fireside Chat: Scaling Your SaaS',
        description: 'Join us for an intimate conversation with successful SaaS founders who have scaled their companies from zero to $10M+ ARR. Learn about their journey, challenges, and strategies.',
        type: 'webinar',
        startDate: '2023-08-15T18:00:00Z',
        endDate: '2023-08-15T19:30:00Z',
        location: 'Online (Zoom)',
        organizer: {
          id: 'user-1',
          name: 'Idolyst Team',
        },
        attendees: 145,
        maxAttendees: 200,
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      },
      {
        id: 'event-2',
        title: 'Silicon Valley Networking Mixer',
        description: 'Connect with fellow founders, investors, and startup enthusiasts in the heart of Silicon Valley. Perfect opportunity to expand your network and discover potential collaborations.',
        type: 'meetup',
        startDate: '2023-08-22T17:30:00Z',
        endDate: '2023-08-22T20:00:00Z',
        location: 'Palo Alto, CA',
        organizer: {
          id: 'user-28',
          name: 'Daniel Roberts',
        },
        attendees: 78,
        maxAttendees: 100,
        imageUrl: 'https://images.unsplash.com/photo-1511795409834-432fc417e5c5',
      },
      {
        id: 'event-3',
        title: 'Startup Funding Masterclass',
        description: 'A hands-on workshop covering everything from preparing your pitch deck to negotiating term sheets. Get practical advice from VCs and successfully funded founders.',
        type: 'workshop',
        startDate: '2023-09-05T15:00:00Z',
        endDate: '2023-09-05T18:00:00Z',
        location: 'Online (Zoom)',
        organizer: {
          id: 'user-41',
          name: 'Mark Wilson',
        },
        attendees: 210,
        maxAttendees: 250,
        imageUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d',
      },
    ];
  }
  
  // Rewards API calls
  async getAvailableRewards(): Promise<Reward[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'reward-1',
        title: 'First Post',
        description: 'Create your first post on the platform',
        points: 10,
        icon: 'award',
        category: 'achievement',
        unlocked: true,
        progress: 100,
      },
      {
        id: 'reward-2',
        title: 'Networking Starter',
        description: 'Connect with 5 other members',
        points: 25,
        icon: 'users',
        category: 'achievement',
        unlocked: false,
        progress: 60,
      },
      {
        id: 'reward-3',
        title: 'Content Creator',
        description: 'Create 10 posts that receive at least 5 upvotes each',
        points: 50,
        icon: 'star',
        category: 'badge',
        unlocked: false,
        progress: 30,
      },
      {
        id: 'reward-4',
        title: 'Community Leader',
        description: 'Have your posts or comments receive a total of 100 upvotes',
        points: 75,
        icon: 'trophy',
        category: 'badge',
        unlocked: false,
        progress: 45,
      },
      {
        id: 'reward-5',
        title: 'Premium Webinar Access',
        description: 'Unlock access to exclusive premium webinars',
        points: 100,
        icon: 'gift',
        category: 'perk',
        unlocked: false,
      },
      {
        id: 'reward-6',
        title: 'Featured Profile',
        description: 'Get your profile featured on the homepage for 1 week',
        points: 150,
        icon: 'zap',
        category: 'perk',
        unlocked: false,
      },
    ];
  }
  
  async getUserBadges(): Promise<UserBadge[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'badge-1',
        title: 'First Post',
        description: 'Created your first post on the platform',
        icon: 'award',
        dateEarned: 'June 15, 2023',
      },
      {
        id: 'badge-2',
        title: 'Verified Founder',
        description: 'Confirmed as a startup founder with a verified company',
        icon: 'trophy',
        dateEarned: 'June 18, 2023',
      },
      {
        id: 'badge-3',
        title: 'Early Adopter',
        description: 'Joined during the platform\'s beta phase',
        icon: 'star',
        dateEarned: 'May 10, 2023',
      },
    ];
  }
  
  async getPointsLeaderboard(): Promise<LeaderboardUser[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'user-28',
        name: 'Daniel Roberts',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        points: 1850,
        rank: 1,
        badges: 8,
      },
      {
        id: 'user-12',
        name: 'Jessica Park',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        points: 1720,
        rank: 2,
        badges: 7,
      },
      {
        id: 'user-1',
        name: 'Alex Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        points: 1650,
        rank: 3,
        badges: 6,
      },
      {
        id: 'user-41',
        name: 'Mark Wilson',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        points: 1480,
        rank: 4,
        badges: 5,
      },
      {
        id: 'user-36',
        name: 'Rachel Thompson',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        points: 1420,
        rank: 5,
        badges: 5,
      },
    ];
  }
}

// Export a singleton instance
export const apiService = new ApiService();
