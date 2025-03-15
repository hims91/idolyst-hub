import { Badge, Challenge, LeaderboardEntry, UserBadge, UserChallenge } from './gamification';

// General API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  total: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  joinDate?: string;
  emailVerified?: boolean;
  company?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  skills?: string[];
  badges?: Badge[];
}

// Admin types
export interface AdminUserFilter {
  query?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: string;
  joinDate: string;
  lastActive?: string;
  postsCount: number;
  commentsCount: number;
}

export interface AdminContentState {
  page: number;
  search: string;
  status: 'all' | 'active' | 'pending' | 'rejected';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface AdminPost {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
  };
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
}

export interface AdminStats {
  users: {
    total: number;
    new: number;
    active: number;
  };
  content: {
    posts: number;
    comments: number;
  };
  engagement: {
    upvotes: number;
    comments: number;
    shares: number;
  };
  gamification: {
    pointsAwarded: number;
    badgesEarned: number;
    challengesCompleted: number;
  };
}

// Email settings form
export interface EmailSettingsForm {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  enableEmailNotifications: boolean;
}

// Notification settings form
export interface NotificationSettingsForm {
  marketingEmails: boolean;
  notificationEmails: boolean;
  weeklyDigest: boolean;
  newFollowerAlert: boolean;
}

// Post and feed types
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
  tags?: string[];
  imageUrl?: string;
  status?: string;
  comments?: Comment[];
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

// User profile types
export interface ProfileData {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  joinDate: string;
  followers: number;
  following: number;
  posts: number;
  socialLinks: Record<string, string>;
  skills: string[];
  badges: Badge[];
  isFollowing?: boolean;
}

// Single post view
export interface PostDetail extends Post {
  views: number;
  shares: number;
  isSaved: boolean;
  isVoted: 'up' | 'down' | null;
}

// User connections
export interface UserConnection {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  company?: string;
  isFollowing?: boolean;
}
