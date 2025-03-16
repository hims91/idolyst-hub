
// User types
export interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  bio?: string;
  isFollowing?: boolean;
}

export interface UserProfile extends User {
  email: string;
  joinedOn: string;
  website?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  followersCount: number;
  followingCount: number;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  comments: Comment[];
  isUpvoted: boolean;
  isDownvoted: boolean;
  isBookmarked: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  timeAgo: string;
  upvotes: number;
  downvotes: number;
  isUpvoted: boolean;
  isDownvoted: boolean;
  replies?: Comment[];
}

// Admin types
export interface AdminStats {
  usersCount: number;
  postsCount: number;
  commentsCount: number;
  eventsCount: number;
  newUsersThisWeek: number;
  activeUsersToday: number;
  reportsCount: number;
  uptime: string;
  userGrowthData: DataPoint[];
  postActivityData: DataPoint[];
  [key: string]: any;
}

export interface DataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

// Events types
export interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  isVirtual?: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  category: string;
  imageUrl?: string;
  maxAttendees?: number;
  currentAttendees: number;
  organizer: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventCategory {
  id: string;
  name: string;
}

export interface EventWithDetails extends Event {
  status: 'upcoming' | 'ongoing' | 'past';
  timeAgo: string;
  attendees: number;
  attendeesList?: EventAttendee[];
  isRegistered: boolean;
}

export interface EventAttendee {
  id: string;
  status: string;
  registeredAt: string;
  user: User | null;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

// Crowdfunding types
export interface CrowdfundingProject {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  goal: number;
  current: number;
  currency: string;
  progress: number;
  imageUrl: string;
  creator: User;
  category: string;
  startDate: string;
  endDate: string;
  daysLeft: number;
  backers: number;
  updates: number;
  isBacked: boolean;
  isBookmarked: boolean;
}

export interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  timeAgo: string;
  author: User;
}

export interface ProjectReward {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  claimed: number;
  limit?: number;
  estimatedDelivery: string;
  includes: string[];
}

// Gamification types
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  earnedAt?: string;
  progress?: number;
  isEarned: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  reward: number;
  rewardType: 'points' | 'badge' | 'both';
  progress: number;
  total: number;
  isCompleted: boolean;
  endDate?: string;
  daysLeft?: number;
  badgeReward?: Badge;
}

export interface LeaderboardEntry {
  position: number;
  user: User;
  points: number;
  badges: number;
  streak: number;
  change: number;
}
