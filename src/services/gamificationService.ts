
import { supabase } from '@/integrations/supabase/client';
import { Badge, PointsTransaction, UserBadge, Challenge, UserChallenge, LeaderboardEntry } from '@/types/gamification';

/**
 * Fetch user points total
 */
export async function getUserPoints(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data?.points || 0;
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
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as PointsTransaction[];
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
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data as unknown as UserBadge[];
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
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('points_required', { ascending: true });
    
    if (error) throw error;
    return data as unknown as Badge[];
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
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('end_date', { ascending: true });
    
    if (error) throw error;
    return data as unknown as Challenge[];
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
    const { data, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data as unknown as UserChallenge[];
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
    const { error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        is_completed: false
      });
    
    if (error) throw error;
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
    const { error } = await supabase
      .rpc('update_challenge_progress', {
        p_user_id: userId,
        p_challenge_id: challengeId,
        p_progress: progress,
        p_completed: isCompleted
      });
    
    if (error) throw error;
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
    const { data, error } = await supabase
      .rpc('get_leaderboard', { limit_count: limit });
    
    if (error) throw error;
    return data as unknown as LeaderboardEntry[];
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
    const { data, error } = await supabase
      .rpc('get_user_gamification_stats', { p_user_id: userId });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user gamification stats:', error);
    return null;
  }
}
