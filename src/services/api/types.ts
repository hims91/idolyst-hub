
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
