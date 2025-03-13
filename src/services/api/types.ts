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
  emailVerified?: boolean;
  isFollowing?: boolean;
}

// Export these types for use in other components
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

export interface EmailSettingsForm {
  marketingEmails: boolean;
  notificationEmails: boolean;
  weeklyDigest: boolean;
  newFollowerAlert: boolean;
}

export interface UserProfileUpdateData {
  name?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  skills?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetData {
  token: string;
  password: string;
}
