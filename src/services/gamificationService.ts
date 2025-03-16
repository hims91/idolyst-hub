
import { supabase } from "@/integrations/supabase/client";
import { Badge, Challenge, UserChallenge, LeaderboardEntry, UserLevel } from "@/types/gamification";
import { formatTimeAgo } from "@/lib/utils";

// Get user badges
export const getUserBadges = async (
  userId: string,
  type: 'earned' | 'available' = 'earned'
): Promise<Badge[]> => {
  try {
    if (type === 'earned') {
      // Get badges the user has earned
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          earned_at,
          badge:badge_id(
            id,
            name,
            description,
            category,
            icon,
            points_required
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error fetching user badges:", error);
        throw error;
      }
      
      return data.map(item => {
        // Handle case where badge might be null or an error
        if (!item.badge || (typeof item.badge === 'object' && 'code' in item.badge)) {
          return {
            id: item.badge_id,
            name: 'Unknown Badge',
            description: '',
            category: '',
            icon: 'award',
            isEarned: true
          };
        }
        
        return {
          id: item.badge.id,
          name: item.badge.name,
          description: item.badge.description || '',
          category: item.badge.category || '',
          icon: item.badge.icon || 'award',
          earnedAt: item.earned_at,
          isEarned: true
        };
      });
    } else {
      // Get all badges that the user hasn't earned yet
      // First, get all badges the user has earned
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);
      
      if (userBadgesError) {
        console.error("Error fetching user badges:", userBadgesError);
        throw userBadgesError;
      }
      
      // Get user's points to determine which badges are achievable
      const { data: userStats, error: userStatsError } = await supabase
        .from('user_stats')
        .select('points')
        .eq('user_id', userId)
        .single();
      
      if (userStatsError && userStatsError.code !== 'PGRST116') {
        console.error("Error fetching user stats:", userStatsError);
        throw userStatsError;
      }
      
      const userPoints = userStats?.points || 0;
      const earnedBadgeIds = userBadges.map(badge => badge.badge_id);
      
      // Get all available badges that the user hasn't earned yet
      const { data: availableBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .not('id', 'in', `(${earnedBadgeIds.join(',')})`)
        .order('points_required', { ascending: true });
      
      if (badgesError) {
        console.error("Error fetching available badges:", badgesError);
        throw badgesError;
      }
      
      return availableBadges.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description || '',
        category: badge.category || '',
        icon: badge.icon || 'award',
        pointsRequired: badge.points_required || 0,
        progress: badge.points_required ? Math.min(100, Math.floor((userPoints / badge.points_required) * 100)) : 0,
        isEarned: false
      }));
    }
  } catch (error) {
    console.error("Error in getUserBadges:", error);
    throw error;
  }
};

// Get user challenges
export const getUserChallenges = async (
  userId: string,
  completed: boolean = false
): Promise<UserChallenge[]> => {
  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenge:challenge_id(
          id,
          title,
          description,
          points,
          requirements,
          start_date,
          end_date,
          is_active
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', completed);
    
    if (error) {
      console.error("Error fetching user challenges:", error);
      throw error;
    }
    
    return data.map(item => {
      // Handle case where challenge might be null or an error
      let challenge = null;
      if (item.challenge && !(typeof item.challenge === 'object' && 'code' in item.challenge)) {
        challenge = {
          id: item.challenge.id,
          title: item.challenge.title,
          description: item.challenge.description || '',
          points: item.challenge.points,
          requirements: item.challenge.requirements || '',
          startDate: item.challenge.start_date,
          endDate: item.challenge.end_date,
          isActive: item.challenge.is_active
        };
      }
      
      return {
        id: item.id,
        challengeId: item.challenge_id,
        userId: item.user_id,
        progress: item.progress || 0,
        isCompleted: item.is_completed,
        joinedAt: item.joined_at,
        completedAt: item.completed_at,
        challenge
      };
    });
  } catch (error) {
    console.error("Error in getUserChallenges:", error);
    throw error;
  }
};

// Get available challenges that the user hasn't joined yet
export const getAvailableChallenges = async (): Promise<Challenge[]> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // First, get all challenges the user has already joined
    const { data: userChallenges, error: userChallengesError } = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', user.id);
    
    if (userChallengesError) {
      console.error("Error fetching user challenges:", userChallengesError);
      throw userChallengesError;
    }
    
    const joinedChallengeIds = userChallenges.map(challenge => challenge.challenge_id);
    
    // Get all available challenges that the user hasn't joined yet
    const { data: availableChallenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*');
    
    if (challengesError) {
      console.error("Error fetching available challenges:", challengesError);
      throw challengesError;
    }
    
    // Filter out challenges that the user has already joined
    return availableChallenges
      .filter(challenge => !joinedChallengeIds.includes(challenge.id))
      .map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description || '',
        points: challenge.points,
        requirements: challenge.requirements || '',
        startDate: challenge.start_date,
        endDate: challenge.end_date,
        isActive: challenge.is_active
      }));
  } catch (error) {
    console.error("Error in getAvailableChallenges:", error);
    throw error;
  }
};

// Join a challenge
export const joinChallenge = async (
  userId: string,
  challengeId: string
): Promise<UserChallenge> => {
  try {
    // Make sure the challenge exists and is active
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('is_active', true)
      .single();
    
    if (challengeError) {
      console.error("Error fetching challenge:", challengeError);
      throw new Error("Challenge not found or not active");
    }
    
    // Create user challenge record
    const { data, error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        is_completed: false,
        joined_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) {
      console.error("Error joining challenge:", error);
      throw error;
    }
    
    // Update challenge count in user stats
    await supabase
      .rpc('increment_user_challenge_count', {
        user_uuid: userId
      });
    
    // Create a notification
    await supabase.functions.invoke('createNotification', {
      body: {
        userId,
        type: 'system',
        title: 'Challenge Joined',
        message: `You've joined the "${challenge.title}" challenge!`,
        linkTo: '/rewards?tab=challenges'
      }
    });
    
    return {
      id: data.id,
      challengeId: data.challenge_id,
      userId: data.user_id,
      progress: data.progress || 0,
      isCompleted: data.is_completed,
      joinedAt: data.joined_at,
      completedAt: data.completed_at,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description || '',
        points: challenge.points,
        requirements: challenge.requirements || '',
        startDate: challenge.start_date,
        endDate: challenge.end_date,
        isActive: challenge.is_active
      }
    };
  } catch (error) {
    console.error("Error in joinChallenge:", error);
    throw error;
  }
};

// Get leaderboard
export const getLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id,
        points,
        rank,
        level,
        badge_count,
        challenge_count,
        completed_challenge_count,
        user:user_id(
          id,
          name,
          avatar,
          role
        )
      `)
      .order('points', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
    
    return data.map((entry, index) => {
      // Handle case where user might be null or an error
      let name = 'Unknown User';
      let avatar = '';
      
      if (entry.user && !(typeof entry.user === 'object' && 'code' in entry.user)) {
        name = entry.user.name || 'Unknown User';
        avatar = entry.user.avatar || '';
      }
      
      return {
        id: entry.user_id,
        rank: index + 1,
        name,
        avatar,
        points: entry.points || 0,
        level: entry.level || 1,
        badgeCount: entry.badge_count || 0,
        challengeCount: entry.challenge_count || 0,
        completedChallengeCount: entry.completed_challenge_count || 0
      };
    });
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
    throw error;
  }
};

// Get user's gamification stats
export const getUserStats = async (userId: string): Promise<UserLevel> => {
  try {
    // Get user stats
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching user stats:", error);
      throw error;
    }
    
    // If no stats found, return default values
    if (!data) {
      return {
        level: 1,
        title: 'Newcomer',
        pointsRequired: 0,
        pointsToNextLevel: 100,
        progressPercentage: 0
      };
    }
    
    // Calculate level info
    const currentLevel = data.level || 1;
    const currentPoints = data.points || 0;
    
    // Level titles based on level
    const levelTitles = [
      'Newcomer',           // Level 1
      'Beginner',           // Level 2
      'Explorer',           // Level 3
      'Contributor',        // Level 4
      'Enthusiast',         // Level 5
      'Expert',             // Level 6
      'Master',             // Level 7
      'Champion',           // Level 8
      'Legend',             // Level 9
      'Luminary'            // Level 10+
    ];
    
    const title = levelTitles[Math.min(currentLevel - 1, levelTitles.length - 1)];
    
    // Points required for the next level (simple formula: 100 * level)
    const pointsToNextLevel = 100 * currentLevel;
    
    // Points required for the current level
    const pointsRequired = currentLevel === 1 ? 0 : 100 * (currentLevel - 1);
    
    // Calculate progress percentage
    const pointsInCurrentLevel = currentPoints - pointsRequired;
    const progressPercentage = Math.min(100, Math.floor((pointsInCurrentLevel / pointsToNextLevel) * 100));
    
    return {
      level: currentLevel,
      title,
      pointsRequired,
      pointsToNextLevel,
      progressPercentage
    };
  } catch (error) {
    console.error("Error in getUserStats:", error);
    throw error;
  }
};

export const gamificationService = {
  getUserBadges,
  getUserChallenges,
  getAvailableChallenges,
  joinChallenge,
  getLeaderboard,
  getUserStats
};

export default gamificationService;
