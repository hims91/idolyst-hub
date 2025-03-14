
import { serve } from 'https://deno.land/std@0.188.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, actionType, actionValue = 1 } = await req.json();
    
    if (!userId || !actionType) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID and action type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false },
      }
    );

    // Fetch user's active challenges that match this action type
    const { data: challenges, error } = await supabaseClient
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
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch challenges' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Filter challenges that are related to this action
    const relevantChallenges = challenges.filter(c => 
      c.challenges.requirements?.includes(actionType)
    );
    
    if (relevantChallenges.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No relevant challenges found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update progress for each relevant challenge
    const results = [];
    for (const challenge of relevantChallenges) {
      const newProgress = Math.min(100, challenge.progress + actionValue);
      const isNewlyCompleted = newProgress >= 100 && !challenge.is_completed;
      
      const { error: updateError } = await supabaseClient
        .from('user_challenges')
        .update({
          progress: newProgress,
          is_completed: newProgress >= 100,
          completed_at: newProgress >= 100 ? new Date().toISOString() : null
        })
        .eq('id', challenge.id);
      
      if (updateError) {
        console.error('Error updating challenge progress:', updateError);
        results.push({ id: challenge.id, success: false, error: updateError.message });
      } else {
        results.push({ 
          id: challenge.id, 
          success: true, 
          newProgress,
          completed: newProgress >= 100
        });
        
        // Award points if the challenge was just completed
        if (isNewlyCompleted) {
          // Get challenge points
          const { data: challengeData } = await supabaseClient
            .from('challenges')
            .select('points')
            .eq('id', challenge.challenge_id)
            .single();
            
          if (challengeData?.points) {
            await supabaseClient.rpc('award_points', {
              user_uuid: userId,
              points_amount: challengeData.points,
              description_text: `Completed challenge: ${challenge.challenges.title}`,
              transaction_type_text: 'challenge_completion',
              ref_id: challenge.challenge_id,
              ref_type: 'challenge'
            });
          }
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in updateChallengeProgress:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
