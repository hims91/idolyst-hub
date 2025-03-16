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

// Event types
export interface EventFilter {
  category?: string;
  location?: string;
  dateRange?: [Date | null, Date | null];
  isVirtual?: boolean;
  searchQuery?: string;
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
  tags?: string[];
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

// Gamification
export interface UserLevel {
  level: number;
  title: string;
  pointsRequired: number;
  pointsToNextLevel: number;
  progressPercentage: number;
}
