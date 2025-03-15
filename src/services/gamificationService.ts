
import { supabase } from '@/integrations/supabase/client';
import { 
  Badge, 
  Challenge, 
  LeaderboardEntry,
  UserBadge,
  UserChallenge,
  UserStats,
  PointTransaction
} from '@/types/gamification';

/**
 * Get a user's badges
 * @param userId User ID
 * @param type Type of badges to get (earned or available)
 * @returns Array of badges
 */
export const getUserBadges = async (userId: string, type: 'earned' | 'available'): Promise<Badge[]> => {
  try {
    if (type === 'earned') {
      // Get badges the user has earned
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          badge_id,
          earned_at,
          badges (
            id,
            name,
            icon,
            description,
            category,
            points_required
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user badges:', error);
        return [];
      }
      
      return data?.map(item => ({
        id: item.badges.id,
        name: item.badges.name,
        icon: item.badges.icon,
        description: item.badges.description,
        category: item.badges.category,
        pointsRequired: item.badges.points_required
      })) || [];
    } else {
      // Get available badges that the user hasn't earned yet
      const { data: userBadgeIds, error: userBadgeError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);
      
      if (userBadgeError) {
        console.error('Error fetching user badge IDs:', userBadgeError);
        return [];
      }
      
      const earnedBadgeIds = userBadgeIds?.map(badge => badge.badge_id) || [];
      
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .not('id', 'in', `(${earnedBadgeIds.join(',')})`)
        .is('id', earnedBadgeIds.length > 0 ? null : null);
      
      if (error) {
        console.error('Error fetching available badges:', error);
        return [];
      }
      
      return data?.map(badge => ({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        category: badge.category,
        pointsRequired: badge.points_required
      })) || [];
    }
  } catch (error) {
    console.error('Error in getUserBadges:', error);
    return [];
  }
};

/**
 * Get all available badges
 * @returns Array of all badges
 */
export const getAllBadges = async (): Promise<Badge[]> => {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*');
    
    if (error) {
      console.error('Error fetching all badges:', error);
      return [];
    }
    
    return data?.map(badge => ({
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      category: badge.category,
      pointsRequired: badge.points_required
    })) || [];
  } catch (error) {
    console.error('Error in getAllBadges:', error);
    return [];
  }
};

/**
 * Get all available challenges
 * @returns Array of challenges
 */
export const getAvailableChallenges = async (): Promise<Challenge[]> => {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
    
    return data?.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      requirements: challenge.requirements,
      points: challenge.points,
      startDate: challenge.start_date,
      endDate: challenge.end_date,
      isActive: challenge.is_active
    })) || [];
  } catch (error) {
    console.error('Error in getAvailableChallenges:', error);
    return [];
  }
};

/**
 * Get user's challenges
 * @param userId User ID
 * @param isCompleted Whether to get completed or active challenges
 * @returns Array of user challenges
 */
export const getUserChallenges = async (userId: string, isCompleted = false): Promise<UserChallenge[]> => {
  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        id,
        user_id,
        challenge_id,
        joined_at,
        progress,
        is_completed,
        completed_at,
        challenges (
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
      .eq('is_completed', isCompleted)
      .order('joined_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user challenges:', error);
      return [];
    }
    
    return data?.map(item => ({
      id: item.id,
      userId: item.user_id,
      challengeId: item.challenge_id,
      joinedAt: item.joined_at,
      progress: item.progress,
      isCompleted: item.is_completed,
      completedAt: item.completed_at,
      challenge: item.challenges ? {
        id: item.challenges.id,
        title: item.challenges.title,
        description: item.challenges.description,
        requirements: item.challenges.requirements,
        points: item.challenges.points,
        startDate: item.challenges.start_date,
        endDate: item.challenges.end_date,
        isActive: item.challenges.is_active
      } : undefined
    })) || [];
  } catch (error) {
    console.error('Error in getUserChallenges:', error);
    return [];
  }
};

/**
 * Join a challenge
 * @param userId User ID
 * @param challengeId Challenge ID
 * @returns The created user challenge
 */
export const joinChallenge = async (userId: string, challengeId: string): Promise<UserChallenge> => {
  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        is_completed: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error joining challenge:', error);
      throw new Error('Failed to join challenge');
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      challengeId: data.challenge_id,
      joinedAt: data.joined_at,
      progress: data.progress,
      isCompleted: data.is_completed,
      completedAt: data.completed_at
    };
  } catch (error) {
    console.error('Error in joinChallenge:', error);
    throw error;
  }
};

/**
 * Get the leaderboard
 * @param limit Number of entries to return
 * @returns Array of leaderboard entries
 */
export const getLeaderboard = async (limit = 10): Promise<LeaderboardEntry[]> => {
  try {
    // Query user stats and join with profiles table
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id,
        points,
        level,
        badge_count,
        challenge_count,
        rank,
        profiles:user_id (
          name,
          avatar
        )
      `)
      .order('points', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    return data?.map((item, index) => {
      // Handle the profiles data safely
      const profile = item.profiles as any || {};
      
      return {
        id: item.user_id,
        name: profile.name || 'Anonymous User',
        avatar: profile.avatar,
        points: item.points,
        level: item.level,
        badgeCount: item.badge_count,
        challengeCount: item.challenge_count,
        // If rank is 0 (not set), use the position in the results
        rank: item.rank || index + 1
      };
    }) || [];
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return [];
  }
};

/**
 * Get user stats
 * @param userId User ID
 * @returns User stats
 */
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      userId: data.user_id,
      points: data.points,
      level: data.level,
      badgeCount: data.badge_count,
      challengeCount: data.challenge_count,
      completedChallengeCount: data.completed_challenge_count,
      rank: data.rank
    };
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return null;
  }
};

/**
 * Get point transactions for a user
 * @param userId User ID
 * @param limit Number of transactions to return
 * @returns Array of point transactions
 */
export const getPointTransactions = async (userId: string, limit = 10): Promise<PointTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching point transactions:', error);
      return [];
    }
    
    return data?.map(transaction => ({
      id: transaction.id,
      userId: transaction.user_id,
      amount: transaction.amount,
      description: transaction.description,
      transactionType: transaction.transaction_type,
      referenceId: transaction.reference_id,
      referenceType: transaction.reference_type,
      createdAt: transaction.created_at
    })) || [];
  } catch (error) {
    console.error('Error in getPointTransactions:', error);
    return [];
  }
};
