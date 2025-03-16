
export interface Badge {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon: string;
  earnedAt?: string;
  pointsRequired?: number;
  progress?: number;
  isEarned: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  requirements?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface UserChallenge {
  id: string;
  challengeId: string;
  userId: string;
  progress: number;
  isCompleted: boolean;
  joinedAt: string;
  completedAt?: string;
  challenge?: Challenge | null;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  badgeCount: number;
  challengeCount: number;
  completedChallengeCount: number;
}

export interface UserLevel {
  level: number;
  title: string;
  pointsRequired: number;
  pointsToNextLevel: number;
  progressPercentage: number;
}

export interface TwoFactorAuthSetupResponse {
  qrCode: string;
  secret: string;
  success: boolean;
  message?: string;
}

export interface TwoFactorAuthVerifyResponse {
  success: boolean;
  message?: string;
}
