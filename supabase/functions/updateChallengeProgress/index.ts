
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { userId, actionType, actionValue = 1 } = await req.json();

    if (!userId || !actionType) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: userId, actionType',
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user's active challenges
    const { data: challenges, error: challengesError } = await supabaseClient
      .from('user_challenges')
      .select(`
        id,
        challenge_id,
        progress,
        is_completed,
        challenge:challenge_id(
          id,
          title,
          description,
          points,
          requirements
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', false);

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user challenges' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!challenges || challenges.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active challenges found for user' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process each challenge to update progress
    const updatedChallenges = [];
    const completedChallenges = [];

    for (const challenge of challenges) {
      // Skip challenges that don't match this action type
      // In a real implementation, you'd parse the requirements to match action types
      const requirements = challenge.challenge?.requirements || '';
      if (!requirements.toLowerCase().includes(actionType.toLowerCase())) {
        continue;
      }

      // Update the progress
      const newProgress = Math.min(100, challenge.progress + actionValue);
      const isNowCompleted = newProgress >= 100;
      
      // Update the challenge
      const { data: updatedChallenge, error: updateError } = await supabaseClient
        .from('user_challenges')
        .update({
          progress: newProgress,
          is_completed: isNowCompleted,
          completed_at: isNowCompleted ? new Date().toISOString() : null
        })
        .eq('id', challenge.id)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating challenge ${challenge.id}:`, updateError);
        continue;
      }

      updatedChallenges.push(updatedChallenge);

      // If challenge is completed, award points
      if (isNowCompleted) {
        completedChallenges.push(challenge);
        
        // Award points
        const points = challenge.challenge?.points || 0;
        if (points > 0) {
          const { error: pointsError } = await supabaseClient.rpc('award_points', {
            user_uuid: userId,
            points_amount: points,
            description_text: `Completed challenge: ${challenge.challenge?.title || 'Unknown'}`,
            transaction_type_text: 'challenge_completed',
            ref_id: challenge.id,
            ref_type: 'challenge'
          });

          if (pointsError) {
            console.error(`Error awarding points for challenge ${challenge.id}:`, pointsError);
          }
        }

        // Update completed challenge count
        await supabaseClient.rpc('increment_completed_challenge_count', {
          user_uuid: userId
        });

        // Create notification
        await supabaseClient.from('notifications').insert({
          user_id: userId,
          type: 'badge',
          title: 'Challenge Completed!',
          message: `You've completed the "${challenge.challenge?.title}" challenge and earned ${points} points!`,
          created_at: new Date().toISOString(),
          is_read: false,
          link_to: '/rewards?tab=challenges'
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updatedChallenges: updatedChallenges.length,
        completedChallenges: completedChallenges.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error processing challenge progress update:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
