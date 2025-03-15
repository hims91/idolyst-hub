
import { serve } from 'https://deno.land/std@0.188.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, actionType, actionValue = 1 } = await req.json()
    
    if (!userId || !actionType) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Create Supabase client with Deno runtime Auth context
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    
    // Get active challenges for the user
    const { data: userChallenges, error: challengesError } = await supabaseClient
      .from('user_challenges')
      .select(`
        id, 
        challenge_id,
        progress,
        is_completed,
        challenges (
          id,
          title,
          requirements
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', false)

    if (challengesError) {
      console.error('Error fetching user challenges:', challengesError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch challenges' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    if (!userChallenges || userChallenges.length === 0) {
      // No active challenges, nothing to update
      return new Response(
        JSON.stringify({ success: true, updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Track which challenges were updated
    const updatedChallenges = []
    const completedChallenges = []
    
    // Process each user challenge
    for (const userChallenge of userChallenges) {
      // Parse requirements JSON if available
      let requirements: any = {}
      try {
        if (userChallenge.challenges?.requirements) {
          requirements = JSON.parse(userChallenge.challenges.requirements)
        }
      } catch (e) {
        console.error('Error parsing challenge requirements:', e)
        continue
      }
      
      // Check if this challenge includes the action type
      if (requirements && requirements[actionType]) {
        const requiredValue = requirements[actionType]
        
        // Calculate new progress percentage
        const currentValue = Math.min((userChallenge.progress / 100) * requiredValue + actionValue, requiredValue)
        const newProgress = Math.round((currentValue / requiredValue) * 100)
        
        // Update the challenge progress
        const { error: updateError } = await supabaseClient
          .from('user_challenges')
          .update({
            progress: newProgress,
            is_completed: newProgress >= 100,
            completed_at: newProgress >= 100 ? new Date().toISOString() : null
          })
          .eq('id', userChallenge.id)
        
        if (updateError) {
          console.error(`Error updating challenge ${userChallenge.id}:`, updateError)
          continue
        }
        
        updatedChallenges.push(userChallenge.id)
        
        // If challenge was completed, add to completed list
        if (newProgress >= 100) {
          completedChallenges.push({
            id: userChallenge.id,
            title: userChallenge.challenges?.title
          })
          
          // Award points for completing the challenge
          const { error: pointsError } = await supabaseClient
            .rpc('award_points', {
              user_uuid: userId,
              points_amount: 100, // Default points for completing a challenge
              description_text: `Completed challenge: ${userChallenge.challenges?.title}`,
              transaction_type_text: 'challenge_completed',
              ref_id: userChallenge.id,
              ref_type: 'challenge'
            })
          
          if (pointsError) {
            console.error('Error awarding points for challenge completion:', pointsError)
          }
          
          // Update user_stats for completed challenge count
          await supabaseClient
            .from('user_stats')
            .update({
              completed_challenge_count: supabaseClient.rpc('increment', { value: 1 })
            })
            .eq('user_id', userId)
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedChallenges.length,
        updatedChallenges,
        completedChallenges
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in updateChallengeProgress function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
