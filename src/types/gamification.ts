
export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  pointsRequired?: number;
  createdAt?: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badge: Badge;
  earnedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  points: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challenge: Challenge;
  progress: number;
  isCompleted: boolean;
  joinedAt: string;
  completedAt?: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  description?: string;
  transactionType: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  points: number;
  level: number;
  badgeCount: number;
  rank: number;
}

export interface UserGamificationStats {
  points: number;
  level: number;
  badgeCount: number;
  challengeCount: number;
  completedChallengeCount: number;
  rank: number;
}
