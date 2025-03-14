
import { supabase } from '@/integrations/supabase/client';
import { Badge, UserBadge, Challenge, UserChallenge, PointsTransaction, LeaderboardEntry, UserGamificationStats } from '@/types/gamification';

/**
 * Get user's current points and level
 * @param userId The user's ID
 * @returns The user's points and level
 */
export const getUserPoints = async (userId: string): Promise<number> => {
  try {
    // Query user points from database
    const { data, error } = await supabase
      .rpc('calculate_user_points', { user_uuid: userId });
    
    if (error) {
      console.error('Error fetching user points:', error);
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    console.error('Error in getUserPoints:', error);
    return 0;
  }
};

/**
 * Get user's point transactions
 * @param userId The user's ID
 * @returns Array of point transactions
 */
export const getPointTransactions = async (userId: string): Promise<PointsTransaction[]> => {
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
    
    return (data || []).map((transaction: any) => ({
      id: transaction.id,
      userId: transaction.user_id,
      amount: transaction.amount,
      description: transaction.description,
      transactionType: transaction.transaction_type,
      referenceId: transaction.reference_id,
      referenceType: transaction.reference_type,
      createdAt: transaction.created_at
    }));
  } catch (error) {
    console.error('Error in getPointTransactions:', error);
    return [];
  }
};

/**
 * Get user's badges
 * @param userId The user's ID
 * @returns Array of user badges
 */
export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        id,
        user_id,
        badge_id,
        earned_at,
        badges:badge_id (
          id,
          name,
          description,
          icon,
          category,
          points_required
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
    
    return (data || []).map((badge: any) => ({
      id: badge.id,
      userId: badge.user_id,
      badge: {
        id: badge.badges.id,
        name: badge.badges.name,
        description: badge.badges.description,
        icon: badge.badges.icon,
        category: badge.badges.category,
        pointsRequired: badge.badges.points_required
      },
      earnedAt: badge.earned_at
    }));
  } catch (error) {
    console.error('Error in getUserBadges:', error);
    return [];
  }
};

/**
 * Get all available badges
 * @returns Array of badges
 */
export const getAllBadges = async (): Promise<Badge[]> => {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('points_required', { ascending: true });
    
    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
    
    return (data || []).map((badge: any) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      pointsRequired: badge.points_required,
      createdAt: badge.created_at
    }));
  } catch (error) {
    console.error('Error in getAllBadges:', error);
    return [];
  }
};

/**
 * Get all available challenges
 * @param activeOnly Whether to fetch only active challenges
 * @returns Array of challenges
 */
export const getAllChallenges = async (activeOnly: boolean = false): Promise<Challenge[]> => {
  try {
    let query = supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
    
    return (data || []).map((challenge: any) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      requirements: challenge.requirements,
      points: challenge.points,
      startDate: challenge.start_date,
      endDate: challenge.end_date,
      isActive: challenge.is_active,
      createdAt: challenge.created_at
    }));
  } catch (error) {
    console.error('Error in getAllChallenges:', error);
    return [];
  }
};

/**
 * Get user's challenges
 * @param userId The user's ID
 * @returns Array of user challenges
 */
export const getUserChallenges = async (userId: string): Promise<UserChallenge[]> => {
  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        id,
        user_id,
        challenge_id,
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
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user challenges:', error);
      return [];
    }
    
    return (data || []).map((uc: any) => ({
      id: uc.id,
      userId: uc.user_id,
      challenge: {
        id: uc.challenges.id,
        title: uc.challenges.title,
        description: uc.challenges.description,
        requirements: uc.challenges.requirements,
        points: uc.challenges.points,
        startDate: uc.challenges.start_date,
        endDate: uc.challenges.end_date,
        isActive: uc.challenges.is_active
      },
      progress: uc.progress,
      isCompleted: uc.is_completed,
      joinedAt: uc.joined_at,
      completedAt: uc.completed_at
    }));
  } catch (error) {
    console.error('Error in getUserChallenges:', error);
    return [];
  }
};

/**
 * Join a challenge
 * @param userId The user's ID
 * @param challengeId The challenge ID
 * @returns Whether the operation was successful
 */
export const joinChallenge = async (userId: string, challengeId: string): Promise<boolean> => {
  try {
    // Check if already joined
    const { data: existing } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();
    
    if (existing) {
      // Already joined
      return true;
    }
    
    // Join challenge
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
    console.error('Error in joinChallenge:', error);
    return false;
  }
};

/**
 * Get leaderboard data
 * @param limit Number of entries to fetch
 * @returns Leaderboard entries
 */
export const getLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_leaderboard', { limit_count: limit });
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    return (data || []).map((entry: any) => ({
      userId: entry.user_id,
      username: entry.username,
      avatarUrl: entry.avatar_url,
      points: entry.points,
      level: entry.level,
      badgeCount: entry.badge_count,
      rank: entry.rank
    }));
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return [];
  }
};

/**
 * Get user's gamification stats
 * @param userId The user's ID
 * @returns The user's gamification stats
 */
export const getUserGamificationStats = async (userId: string): Promise<UserGamificationStats | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_gamification_stats', { user_uuid: userId });
    
    if (error || !data || data.length === 0) {
      console.error('Error fetching user gamification stats:', error);
      return null;
    }
    
    const stats = data[0];
    return {
      points: stats.points,
      level: stats.level,
      badgeCount: stats.badge_count,
      challengeCount: stats.challenge_count,
      completedChallengeCount: stats.completed_challenge_count,
      rank: stats.rank
    };
  } catch (error) {
    console.error('Error in getUserGamificationStats:', error);
    return null;
  }
};
