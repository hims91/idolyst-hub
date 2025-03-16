
import { supabase } from '@/integrations/supabase/client';
import { safeGetProperty } from '@/utils/supabaseHelpers';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  points: number;
  level: number;
  name: string;
  avatar: string | null;
  badgeCount: number;
  challengeCount: number;
}

// Get user level
export const getUserLevel = async (userId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('level, points')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user level:', error);
      return null;
    }

    return data || { level: 1, points: 0 };
  } catch (error) {
    console.error('Error in getUserLevel:', error);
    return null;
  }
};

// Get user badges
export const getUserBadges = async (userId: string, type = 'earned'): Promise<any[]> => {
  try {
    if (type === 'earned') {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          badge:badge_id (
            id,
            name,
            icon
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user badges:', error);
        return [];
      }

      return data?.map(item => item.badge) || [];
    } else {
      // Get available badges (not yet earned)
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*');

      if (badgesError) {
        console.error('Error fetching badges:', badgesError);
        return [];
      }

      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

      if (userBadgesError) {
        console.error('Error fetching user badges:', userBadgesError);
        return [];
      }

      // Filter out badges the user already has
      const earnedBadgeIds = new Set((userBadges || []).map(ub => ub.badge_id));
      return (allBadges || []).filter(badge => !earnedBadgeIds.has(badge.id));
    }
  } catch (error) {
    console.error('Error in getUserBadges:', error);
    return [];
  }
};

// Get leaderboard
export const getLeaderboard = async (limit = 20): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id,
        points,
        level,
        profile:user_id (name, avatar),
        badge_count,
        challenge_count
      `)
      .order('points', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    const leaderboard = data.map(formatLeaderboardEntry);
    return leaderboard;
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return [];
  }
};

// Replace the problematic code with safer property access
const formatLeaderboardEntry = (entry: any, index: number): LeaderboardEntry => {
  return {
    rank: index + 1,
    userId: entry.user_id,
    points: entry.points || 0,
    level: entry.level || 1,
    name: safeGetProperty(entry.profile, 'name', 'Unknown User'),
    avatar: safeGetProperty(entry.profile, 'avatar', null),
    badgeCount: entry.badge_count || 0,
    challengeCount: entry.challenge_count || 0
  };
};

// Get available challenges
export const getAvailableChallenges = async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true);
  
      if (error) {
        console.error('Error fetching available challenges:', error);
        return [];
      }
  
      return data || [];
    } catch (error) {
      console.error('Error in getAvailableChallenges:', error);
      return [];
    }
  };
  
  // Get user challenges
  export const getUserChallenges = async (userId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          id,
          challenge_id,
          progress,
          is_completed,
          joined_at,
          completed_at,
          challenge:challenge_id (
            id,
            title,
            description,
            points,
            requirements
          )
        `)
        .eq('user_id', userId);
  
      if (error) {
        console.error('Error fetching user challenges:', error);
        return [];
      }
  
      return data || [];
    } catch (error) {
      console.error('Error in getUserChallenges:', error);
      return [];
    }
  };
  
  // Join challenge
  export const joinChallenge = async (userId: string, challengeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          progress: 0,
          is_completed: false,
          joined_at: new Date().toISOString()
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
  
  // Update challenge progress
  export const updateChallengeProgress = async (
    userId: string,
    challengeId: string,
    progress: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({ progress })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);
  
      if (error) {
        console.error('Error updating challenge progress:', error);
        return false;
      }
  
      return true;
    } catch (error) {
      console.error('Error in updateChallengeProgress:', error);
      return false;
    }
  };
  
  // Complete challenge
  export const completeChallenge = async (userId: string, challengeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);
  
      if (error) {
        console.error('Error completing challenge:', error);
        return false;
      }
  
      return true;
    } catch (error) {
      console.error('Error in completeChallenge:', error);
      return false;
    }
  };

// Export all functions together
const gamificationService = {
  getUserLevel,
  getUserBadges,
  getLeaderboard,
  getAvailableChallenges,
  getUserChallenges,
  joinChallenge,
  updateChallengeProgress,
  completeChallenge
};

export default gamificationService;
