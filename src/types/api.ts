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
  company?: string;
  skills?: string[];
  interests?: string[];
  followersCount: number;
  followingCount: number;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
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
  tags?: string[];
  imageUrl?: string;
  views?: number;
  shares?: number;
}

// Update the Comment type to ensure role is required
export interface Comment {
  id: string;
  content: string;
  author: User & { role: string }; // Ensure role is required
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
  [key: string]: any;
}

export interface DataPoint {
  name: string;
  value: number;
  [key: string]: any;
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
  published: string;
  comments: number;
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
  marketingEmails?: boolean;
  notificationEmails?: boolean;
  weeklyDigest?: boolean;
  newFollowerAlert?: boolean;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;
  enableEmailNotifications?: boolean;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  isVirtual: boolean;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  imageUrl?: string;
  maxAttendees?: number;
  currentAttendees: number;
  organizer: User;
  status: string;
  createdAt: string;
  updatedAt: string;
  isRegistered?: boolean;
  timeAgo?: string;
}

export interface EventWithDetails extends Event {
  attendees?: User[];
}

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  total: number;
  hasMore?: boolean;
}

export interface EventFilter {
  category?: string;
  location?: string;
  dateRange?: [Date | null, Date | null];
  isVirtual?: boolean;
  searchQuery?: string;
  page?: number;
  status?: string;
  query?: string;
  limit?: number;
}

export interface EventFormData {
  title: string;
  description: string;
  location?: string;
  isVirtual: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  category: string;
  imageUrl?: string;
  maxAttendees?: number;
}

// Post Details
export interface PostDetail extends Post {
  relatedPosts?: Post[];
}

// Message System
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  participants: User[];
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'follow' | 'like' | 'comment' | 'message' | 'event' | 'badge' | 'system';
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
  sender?: User;
}

// Component props
export interface EventsProps {
  eventData: Event[];
  categories: string[];
  totalEvents: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface UserProfileProps {
  profile: UserProfile;
  posts: Post[];
  userLevel: any;
  badges: any[];
  isOwnProfile: boolean;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

// Add Challenge type definition
export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  requirements: string;
  isActive: boolean;
}

// Add UserChallenge interface if needed 
export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  isCompleted: boolean;
  joinedAt: string;
  completedAt?: string;
  challenge?: Challenge;
}
