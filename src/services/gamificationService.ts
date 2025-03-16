import { supabase } from "@/integrations/supabase/client";
import { Badge, UserChallenge, UserLevel, LeaderboardEntry } from "@/types/gamification";

// Get earned badges for a user
export const getUserBadges = async (userId: string, type: 'earned' | 'available' = 'earned'): Promise<Badge[]> => {
  try {
    if (type === 'earned') {
      // Get badges the user has earned
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          earned_at,
          badge:badge_id (
            id,
            name,
            description,
            icon,
            category,
            points_required
          )
        `)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Format the response
      return data.map(item => ({
        id: item.badge.id,
        name: item.badge.name,
        description: item.badge.description,
        icon: item.badge.icon,
        category: item.badge.category,
        pointsRequired: item.badge.points_required,
        earnedAt: item.earned_at,
        isEarned: true
      }));
    } else {
      // Get available badges the user hasn't earned yet
      // First, get all earned badge IDs
      const { data: earnedBadges, error: earnedError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);
        
      if (earnedError) throw earnedError;
      
      const earnedBadgeIds = earnedBadges.map(item => item.badge_id);
      
      // Then get all badges not in that list
      const { data: availableBadges, error: availableError } = await supabase
        .from('badges')
        .select('*')
        .not('id', 'in', earnedBadgeIds.length > 0 ? earnedBadgeIds : ['none']);
        
      if (availableError) throw availableError;
      
      // Format the response
      return availableBadges.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        pointsRequired: badge.points_required,
        isEarned: false,
        progress: 0
      }));
    }
  } catch (error) {
    console.error("Error fetching user badges:", error);
    throw error;
  }
};

// Get user challenges
export const getUserChallenges = async (userId: string, completed = false): Promise<UserChallenge[]> => {
  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenge:challenge_id (
          id,
          title,
          description,
          points
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', completed);
      
    if (error) throw error;
    
    // Format the response
    return data.map(item => ({
      id: item.challenge.id,
      title: item.challenge.title,
      description: item.challenge.description,
      progress: item.progress,
      isCompleted: item.is_completed,
      completedAt: item.completed_at,
      joinedAt: item.joined_at,
      points: item.challenge.points
    }));
  } catch (error) {
    console.error("Error fetching user challenges:", error);
    throw error;
  }
};

// Get available challenges
export const getAvailableChallenges = async (): Promise<UserChallenge[]> => {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true);
      
    if (error) throw error;
    
    // Format the response
    return data.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      progress: 0,
      isCompleted: false,
      points: challenge.points
    }));
  } catch (error) {
    console.error("Error fetching available challenges:", error);
    throw error;
  }
};

// Join a challenge
export const joinChallenge = async (userId: string, challengeId: string): Promise<boolean> => {
  try {
    // Check if already joined
    const { data: existing, error: checkError } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existing) {
      // Already joined
      return true;
    }
    
    // Join the challenge
    const { error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        is_completed: false,
        joined_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    try {
      // Increment user's challenge count using the available increment function
      await supabase
        .rpc('increment', {
          value: 1
        });
    } catch (err) {
      console.error("Error incrementing challenge count (non-critical):", err);
    }
    
    return true;
  } catch (error) {
    console.error("Error joining challenge:", error);
    throw error;
  }
};

// Get user level and progress
export const getUserLevel = async (userId: string): Promise<UserLevel> => {
  try {
    // Get user stats
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('points, level')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      // If no stats found, create a default one
      if (error.code === 'PGRST116') {
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({ user_id: userId, points: 0, level: 1 })
          .select('points, level')
          .single();
          
        if (insertError) throw insertError;
        
        return {
          level: 1,
          title: 'Newbie',
          pointsRequired: 0,
          pointsToNextLevel: 100,
          progressPercentage: 0
        };
      }
      
      throw error;
    }
    
    // Calculate level title, points to next level, etc.
    const level = stats.level || 1;
    const points = stats.points || 0;
    const titles = ['Newbie', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Guru', 'Legend'];
    const title = titles[Math.min(level - 1, titles.length - 1)];
    
    // Calculate points required for next level - this is a simple formula, can be adjusted
    const pointsRequired = (level - 1) * 100;
    const nextLevelPoints = level * 100;
    const pointsToNextLevel = nextLevelPoints - points;
    const progressPercentage = Math.min(100, Math.max(0, ((points - pointsRequired) / (nextLevelPoints - pointsRequired)) * 100));
    
    return {
      level,
      title,
      pointsRequired,
      pointsToNextLevel,
      progressPercentage
    };
  } catch (error) {
    console.error("Error getting user level:", error);
    throw error;
  }
};

// Get leaderboard
export const getLeaderboard = async (limit = 10): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id,
        points,
        level,
        rank,
        badge_count,
        challenge_count,
        user:user_id (
          name,
          avatar
        )
      `)
      .order('points', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Format the response
    return data.map((entry, index) => {
      const user = entry.user || { name: 'Unknown', avatar: null };
      return {
        userId: entry.user_id,
        id: entry.user_id,
        name: user?.name || 'Unknown User',
        avatar: user?.avatar || undefined,
        points: entry.points || 0,
        rank: index + 1,
        level: entry.level || 1,
        badgeCount: entry.badge_count || 0,
        challengeCount: entry.challenge_count || 0
      };
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

const gamificationService = {
  getUserBadges,
  getUserChallenges,
  getAvailableChallenges,
  joinChallenge,
  getUserLevel,
  getLeaderboard
};

export default gamificationService;
