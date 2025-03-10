
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
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
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
    // For now, we'll return null to simulate no logged-in user
    return null;
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
        content: 'We're thrilled to announce that we've secured $10M in Series A funding led by Sequoia Capital, with participation from Y Combinator and angel investors. This funding will help us scale our platform and bring our solution to more customers globally.',
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
        content: 'Artificial intelligence is fundamentally changing how startups operate and scale. From automating routine tasks to enabling data-driven decision making, AI tools are becoming essential for competitive advantage. Here's my take on how founders should approach AI integration...',
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
        content: 'New regulations coming into effect this quarter will significantly impact how fintech startups operate, particularly around data privacy and open banking. Here's a breakdown of what founders need to know and how to prepare your compliance strategy.',
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
}

// Export a singleton instance
export const apiService = new ApiService();
