
export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  createdAt: string;
  transactionType: 'earned' | 'spent' | 'bonus';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'contribution' | 'special';
  pointsRequired: number;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  requirements: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  participants: number;
  completions: number;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  isCompleted: boolean;
  joinedAt: string;
  completedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  badgeCount: number;
  rank: number;
}
