
// Gamification types
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description?: string;
  category?: string;
  pointsRequired?: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge?: Badge;
  earnedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  points: number;
  startDate?: string; 
  endDate?: string;
  isActive: boolean;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge?: Challenge;
  joinedAt: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  level: number;
  badgeCount: number;
  challengeCount: number;
}

export interface UserStats {
  userId: string;
  points: number;
  level: number;
  badgeCount: number;
  challengeCount: number;
  completedChallengeCount: number;
  rank: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  description?: string;
  transactionType: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}
