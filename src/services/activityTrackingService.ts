
import { supabase } from '@/integrations/supabase/client';

/**
 * Track a user activity and award points
 * @param userId The user's ID
 * @param action The action performed (e.g., 'post_created', 'comment_added')
 * @param points Number of points to award
 * @param referenceId ID of the related object (post, comment, etc.)
 * @param referenceType Type of the related object
 * @returns Whether the tracking was successful
 */
export const trackActivity = async (
  userId: string,
  action: string,
  points: number,
  description: string,
  referenceId?: string,
  referenceType?: string
): Promise<boolean> => {
  try {
    // Call the RPC function to award points
    const { error } = await supabase.rpc('award_points', {
      user_uuid: userId,
      points_amount: points,
      description_text: description,
      transaction_type_text: action,
      ref_id: referenceId,
      ref_type: referenceType
    });
    
    if (error) {
      console.error('Error tracking activity:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in trackActivity:', error);
    return false;
  }
};

/**
 * Update user challenge progress based on an activity
 * @param userId The user's ID
 * @param actionType The type of action performed
 * @param actionValue Any associated value with the action (e.g., number of comments)
 * @returns Whether the update was successful
 */
export const updateChallengeProgress = async (
  userId: string,
  actionType: string,
  actionValue: number = 1
): Promise<boolean> => {
  try {
    // Fetch user's active challenges that match this action type
    const { data: challenges, error } = await supabase
      .from('user_challenges')
      .select(`
        id,
        challenge_id,
        progress,
        is_completed,
        challenges:challenge_id (
          id,
          title,
          requirements
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', false);
    
    if (error) {
      console.error('Error fetching user challenges:', error);
      return false;
    }
    
    // Filter challenges that are related to this action
    // This is a simplified implementation - in a real app, you'd have
    // a more sophisticated way to match actions to challenges
    const relevantChallenges = challenges.filter(c => 
      c.challenges.requirements?.includes(actionType)
    );
    
    if (relevantChallenges.length === 0) {
      return true; // No relevant challenges to update
    }
    
    // Update progress for each relevant challenge
    for (const challenge of relevantChallenges) {
      // Simple progress update - in reality, this would be more complex
      const newProgress = Math.min(100, challenge.progress + actionValue);
      
      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          progress: newProgress,
          is_completed: newProgress >= 100,
          completed_at: newProgress >= 100 ? new Date().toISOString() : null
        })
        .eq('id', challenge.id);
      
      if (updateError) {
        console.error('Error updating challenge progress:', updateError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateChallengeProgress:', error);
    return false;
  }
};
