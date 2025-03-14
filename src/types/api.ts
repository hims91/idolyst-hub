export interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email: string;
  company?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate?: string;
  badges?: Array<{ id: string; name: string; icon: string }>;
  skills?: string[];
  followers?: number;
  following?: number;
  posts?: number;
  startups?: number;
  investments?: number;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  status?: string;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface AdminStats {
  users: number;
  posts: number;
  comments: number;
  events: number;
  summaryCards: Array<{
    title: string;
    value: number;
    change: number;
    trend: 'up' | 'down';
  }>;
  userActivity: Array<{
    date: string;
    active: number;
    new: number;
  }>;
  contentDistribution: Array<{
    type: string;
    value: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export interface AdminContentState {
  page: number;
  search: string;
  status: 'all' | 'active' | 'pending' | 'rejected' | 'suspended';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface AdminPost {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
  } | string;
  category: string;
  status: string;
  comments: number;
  published: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
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

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  category: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timeAgo: string;
  createdAt: string;
  tags: string[];
  imageUrl?: string;
  status: string;
  comments: Comment[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  isVirtual: boolean;
  startDate: string;
  endDate: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendees: number;
  maxAttendees?: number;
  imageUrl?: string;
  status: 'upcoming' | 'ongoing' | 'past' | 'canceled';
}

export interface CrowdfundingCampaign {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  goalAmount: number;
  currentAmount: number;
  backers: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'funded' | 'ended' | 'canceled';
  category: string;
  imageUrl?: string;
  progress: number;
}

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

export interface EmailSettingsForm {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  enableEmailNotifications: boolean;
}
