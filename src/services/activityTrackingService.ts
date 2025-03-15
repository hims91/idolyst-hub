
import { supabase } from '@/integrations/supabase/client';

/**
 * Track a user activity and award points
 * @param userId The user's ID
 * @param action The action performed (e.g., 'post_created', 'comment_added')
 * @param points Number of points to award
 * @param description Description of the activity
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
    const { error } = await supabase
      .rpc('award_points', {
        user_uuid: userId,
        points_amount: points,
        description_text: description,
        transaction_type_text: action,
        ref_id: referenceId || null,
        ref_type: referenceType || null
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
    // Use the edge function to update challenge progress
    const { error } = await supabase.functions.invoke('updateChallengeProgress', {
      body: { 
        userId, 
        actionType, 
        actionValue 
      }
    });
    
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
