
import { supabase } from '@/integrations/supabase/client';
import { LeaderboardEntry, UserBadge, UserLevel, UserChallenge, Challenge } from '@/types/gamification';
import { safeGetProperty } from '@/utils/supabaseHelpers';

export const getUserLevel = async (userId: string): Promise<UserLevel | null> => {
  try {
    // Get user stats to determine level
    const { data: userStats, error } = await supabase
      .from('user_stats')
      .select('points, level')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user level:', error);
      return null;
    }
    
    if (!userStats) {
      // If no stats found, return default level 1
      return {
        level: 1,
        title: 'Newcomer',
        points: 0,
        nextLevel: 100,
        progress: 0
      };
    }
    
    // Calculate level information
    const points = userStats.points || 0;
    const level = userStats.level || 1;
    
    // Define points needed for next level
    // This is a simple calculation, could be more complex in a real app
    const pointsPerLevel = 100;
    const nextLevelPoints = level * pointsPerLevel;
    const progress = Math.min(Math.floor((points / nextLevelPoints) * 100), 100);
    
    // Define level titles
    const levelTitles: Record<number, string> = {
      1: 'Newcomer',
      2: 'Explorer',
      3: 'Contributor',
      4: 'Advocate',
      5: 'Leader',
      6: 'Mentor',
      7: 'Expert',
      8: 'Visionary',
      9: 'Master',
      10: 'Legend'
    };
    
    return {
      level,
      title: levelTitles[level] || `Level ${level}`,
      points,
      nextLevel: nextLevelPoints,
      progress
    };
  } catch (error) {
    console.error('Error in getUserLevel:', error);
    return null;
  }
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        id,
        earned_at,
        badge:badge_id (
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
    
    // Transform the data
    return (data || []).map(item => ({
      id: item.id,
      earnedAt: item.earned_at,
      name: safeGetProperty(item.badge, 'name', 'Unknown Badge'),
      description: safeGetProperty(item.badge, 'description', ''),
      icon: safeGetProperty(item.badge, 'icon', 'award'),
      category: safeGetProperty(item.badge, 'category', 'general')
    }));
  } catch (error) {
    console.error('Error in getUserBadges:', error);
    return [];
  }
};

export const getLeaderboard = async (period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all'): Promise<LeaderboardEntry[]> => {
  try {
    // Query user stats ordered by points
    let query = supabase
      .from('user_stats')
      .select(`
        user_id,
        points,
        rank,
        level,
        profiles:user_id (
          id, 
          name, 
          avatar, 
          role
        )
      `)
      .order('points', { ascending: false })
      .limit(10);
    
    // Add time period filter if needed
    if (period !== 'all') {
      // In a real app, this would filter by activity within the given period
      // For now, we'll just use the same query for all periods
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    // Transform the data
    return (data || []).map((entry, index) => ({
      id: entry.user_id,
      rank: index + 1,
      name: safeGetProperty(entry.profiles, 'name', 'Unknown User'),
      points: entry.points || 0,
      level: entry.level || 1,
      avatar: safeGetProperty(entry.profiles, 'avatar', ''),
      role: safeGetProperty(entry.profiles, 'role', '')
    }));
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return [];
  }
};

export const getUserChallenges = async (userId: string, status: 'active' | 'completed' = 'active'): Promise<UserChallenge[]> => {
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
        challenge:challenge_id (
          id,
          title,
          description,
          points,
          requirements
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', status === 'completed')
      .order('joined_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user challenges:', error);
      return [];
    }
    
    // Transform the data
    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      challengeId: item.challenge_id,
      progress: item.progress || 0,
      isCompleted: item.is_completed || false,
      joinedAt: item.joined_at,
      completedAt: item.completed_at || null,
      challenge: item.challenge ? {
        id: item.challenge.id,
        title: item.challenge.title,
        description: item.challenge.description,
        points: item.challenge.points,
        requirements: item.challenge.requirements,
        isActive: true
      } : undefined
    }));
  } catch (error) {
    console.error('Error in getUserChallenges:', error);
    return [];
  }
};

export const getAvailableChallenges = async (): Promise<Challenge[]> => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }
    
    // First, get challenges the user is already participating in
    const { data: userChallenges, error: userChallengesError } = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', user.id);
    
    if (userChallengesError) {
      console.error('Error fetching user challenges:', userChallengesError);
      return [];
    }
    
    // Extract challenge IDs the user is already participating in
    const participatingChallengeIds = (userChallenges || []).map(uc => uc.challenge_id);
    
    // Get available challenges that user is not participating in
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .filter('id', 'not.in', participatingChallengeIds.length > 0 ? `(${participatingChallengeIds.join(',')})` : '(null)');
    
    if (error) {
      console.error('Error fetching available challenges:', error);
      return [];
    }
    
    // Transform the data
    return (data || []).map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      points: challenge.points,
      requirements: challenge.requirements,
      isActive: challenge.is_active
    }));
  } catch (error) {
    console.error('Error in getAvailableChallenges:', error);
    return [];
  }
};

export const joinChallenge = async (challengeId: string): Promise<boolean> => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Insert new user challenge
    const { error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: user.id,
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

export const updateChallengeProgress = async (challengeId: string, progress: number): Promise<boolean> => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    // Update the challenge progress
    const { error } = await supabase
      .from('user_challenges')
      .update({
        progress: progress,
        is_completed: progress >= 100,
        completed_at: progress >= 100 ? new Date().toISOString() : null
      })
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId);
    
    if (error) {
      console.error('Error updating challenge progress:', error);
      return false;
    }
    
    // If challenge is completed, award points
    if (progress >= 100) {
      // Get challenge details to determine points
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('points')
        .eq('id', challengeId)
        .single();
      
      if (challengeError || !challenge) {
        console.error('Error fetching challenge details:', challengeError);
        return true; // Return true anyway, we just couldn't award points
      }
      
      // Award points to user
      const { error: pointsError } = await supabase.rpc('award_points', {
        user_uuid: user.id,
        points_amount: challenge.points,
        description_text: `Completed challenge`,
        transaction_type_text: 'challenge_completion',
        ref_id: challengeId,
        ref_type: 'challenge'
      });
      
      if (pointsError) {
        console.error('Error awarding points:', pointsError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateChallengeProgress:', error);
    return false;
  }
};
