
export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  points: number;
  level: number;
  avatar?: string;
  role?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description?: string;
  icon: string;
  category?: string;
  earnedAt: string;
}

export interface UserLevel {
  level: number;
  title: string;
  points: number;
  nextLevel: number;
  progress: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  requirements: string;
  isActive: boolean;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  isCompleted: boolean;
  joinedAt: string;
  completedAt?: string | null;
  challenge?: Challenge;
}
