
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
      .single();
    
    if (error) {
      console.error('Error fetching user points:', error);
      return 0;
    }
    
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
    
    if (error) {
      console.error('Error fetching point transactions:', error);
      return [];
    }
    
    return data as PointsTransaction[];
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
      .select(`
        id,
        earned_at,
        badges:badge_id (
          id,
          name,
          description,
          icon,
          category
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      userId,
      badge: item.badges,
      earnedAt: item.earned_at
    })) as UserBadge[];
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
    
    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
    
    return data as Badge[];
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
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      requirements: item.requirements,
      points: item.points,
      startDate: item.start_date,
      endDate: item.end_date,
      isActive: item.is_active
    })) as Challenge[];
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
      .select(`
        id,
        progress,
        is_completed,
        joined_at,
        completed_at,
        challenges:challenge_id (
          id,
          title,
          description,
          requirements,
          points,
          start_date,
          end_date,
          is_active
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user challenges:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      userId,
      challenge: {
        id: item.challenges.id,
        title: item.challenges.title,
        description: item.challenges.description,
        requirements: item.challenges.requirements,
        points: item.challenges.points,
        startDate: item.challenges.start_date,
        endDate: item.challenges.end_date,
        isActive: item.challenges.is_active
      },
      progress: item.progress,
      isCompleted: item.is_completed,
      joinedAt: item.joined_at,
      completedAt: item.completed_at
    })) as UserChallenge[];
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
    
    if (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
    
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
      .from('user_challenges')
      .update({
        progress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId);
    
    if (error) {
      console.error('Error updating challenge progress:', error);
      return false;
    }
    
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
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    return data.map(item => ({
      userId: item.user_id,
      username: item.username,
      avatarUrl: item.avatar_url,
      points: item.points,
      level: item.level,
      badgeCount: item.badge_count,
      rank: item.rank
    })) as LeaderboardEntry[];
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
      .rpc('get_user_gamification_stats', { user_uuid: userId });
    
    if (error) {
      console.error('Error fetching user gamification stats:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return {
        points: 0,
        level: 1,
        badge_count: 0,
        challenge_count: 0,
        completed_challenge_count: 0,
        rank: 0
      };
    }
    
    return data[0];
  } catch (error) {
    console.error('Error fetching user gamification stats:', error);
    return null;
  }
}
