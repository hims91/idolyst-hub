
export interface TwoFactorAuthSetupResponse {
  success: boolean;
  message?: string;
  qrCode: string;
  secret: string;
}

export interface TwoFactorAuthVerifyResponse {
  success: boolean;
  message?: string;
}

export interface UserLevel {
  level: number;
  title: string;
  pointsRequired: number;
  pointsToNextLevel: number;
  progressPercentage: number;
}

export interface UserChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  joinedAt?: string;
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  requirements?: string;
  isActive: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  pointsRequired: number;
  earnedAt?: string;
  isEarned?: boolean;
  progress?: number;
}

export interface LeaderboardEntry {
  userId: string;
  id?: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  level: number;
  badgeCount?: number;
  challengeCount?: number;
}

export interface PostData {
  id: string;
  title: string;
  content: string;
  category: string;
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
  commentCount: number;
  imageUrl?: string;
}
