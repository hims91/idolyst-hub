
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
  badgeId: string; // Reference to badge
  badge?: Badge; // Joined badge data
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
  challengeId: string; // Reference to challenge
  challenge?: Challenge; // Joined challenge data
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
  userId: string;
  points: number;
  level: number;
  badgeCount: number;
  challengeCount: number;
  completedChallengeCount: number;
  rank: number;
  updatedAt?: string;
}
