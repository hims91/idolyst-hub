
import { supabase } from '@/integrations/supabase/client';
import { Badge, PointsTransaction, UserBadge, Challenge, UserChallenge, LeaderboardEntry } from '@/types/gamification';

/**
 * Mock data to use until database tables are created
 */
const MOCK_DATA = {
  points: 100,
  pointTransactions: [],
  badges: [],
  userBadges: [],
  challenges: [],
  userChallenges: [],
  leaderboard: []
};

/**
 * Fetch user points total
 */
export async function getUserPoints(userId: string): Promise<number> {
  try {
    // Temporary solution until tables are created
    return MOCK_DATA.points;
  } catch (error) {
    console.error('Error fetching user points:', error);
    return 0;
  }
}

/**
 * Fetch point transactions history for a user
 */
export async function getPointTransactions(userId: string): Promise<PointsTransaction[]> {
  try {
    // Temporary solution until tables are created
    return MOCK_DATA.pointTransactions as PointsTransaction[];
  } catch (error) {
    console.error('Error fetching point transactions:', error);
    return [];
  }
}

/**
 * Fetch badges earned by a user
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  try {
    // Temporary solution until tables are created
    return MOCK_DATA.userBadges as UserBadge[];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

/**
 * Fetch all available badges
 */
export async function getAllBadges(): Promise<Badge[]> {
  try {
    // Temporary solution until tables are created
    return MOCK_DATA.badges as Badge[];
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
}

/**
 * Fetch active challenges 
 */
export async function getActiveChallenges(): Promise<Challenge[]> {
  try {
    // Temporary solution until tables are created
    return MOCK_DATA.challenges as Challenge[];
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }
}

/**
 * Fetch user's challenges
 */
export async function getUserChallenges(userId: string): Promise<UserChallenge[]> {
  try {
    // Temporary solution until tables are created
    return MOCK_DATA.userChallenges as UserChallenge[];
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return [];
  }
}

/**
 * Join a challenge
 */
export async function joinChallenge(userId: string, challengeId: string): Promise<boolean> {
  try {
    // Temporary solution until tables are created
    console.log('Join challenge called with userId:', userId, 'challengeId:', challengeId);
    return true;
  } catch (error) {
    console.error('Error joining challenge:', error);
    return false;
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  userId: string, 
  challengeId: string, 
  progress: number, 
  isCompleted: boolean = false
): Promise<boolean> {
  try {
    // Temporary solution until tables are created
    console.log('Update challenge progress called with userId:', userId, 'challengeId:', challengeId, 'progress:', progress);
    return true;
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return false;
  }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    // Temporary solution until tables are created
    return MOCK_DATA.leaderboard as LeaderboardEntry[];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get user's gamification stats (points, badges, rank, etc.)
 */
export async function getUserGamificationStats(userId: string) {
  try {
    // Temporary solution until tables are created
    return {
      points: 100,
      badge_count: 3,
      challenge_count: 5,
      completed_challenge_count: 2,
      rank: 10
    };
  } catch (error) {
    console.error('Error fetching user gamification stats:', error);
    return null;
  }
}
