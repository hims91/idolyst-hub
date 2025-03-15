
import { serve } from 'https://deno.land/std@0.188.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  try {
    const { userId, actionType, actionValue = 1 } = await req.json()
    
    // Validate inputs
    if (!userId || !actionType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false },
      }
    )

    // First, get all active challenges the user has joined
    const { data: activeChallenges, error: challengesError } = await supabaseClient
      .from('user_challenges')
      .select(`
        id,
        challenge_id,
        progress,
        is_completed,
        challenges:challenge_id (
          title,
          requirements,
          points,
          is_active
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', false)
      .filter('challenges.is_active', 'eq', true)

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch challenges' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Check if we have any challenges to update
    if (!activeChallenges || activeChallenges.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active challenges found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Filter challenges that match this action type
    // In a real app, you'd have more sophisticated matching logic
    const relevantChallenges = activeChallenges.filter(challenge => {
      // Simple string matching for demo purposes
      return challenge.challenges?.requirements?.toLowerCase().includes(actionType.toLowerCase())
    })

    if (relevantChallenges.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No relevant challenges found for this action' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Process updates
    const updates = []
    let completedChallenges = []

    for (const challenge of relevantChallenges) {
      // Calculate new progress (increment by actionValue)
      const newProgress = (challenge.progress || 0) + actionValue

      // Check if the challenge has a completion target
      const completionTarget = 100 // For demo purposes, using 100 as the standard completion target
      const isNowCompleted = newProgress >= completionTarget

      // Prepare update
      updates.push(
        supabaseClient
          .from('user_challenges')
          .update({ 
            progress: newProgress, 
            is_completed: isNowCompleted,
            completed_at: isNowCompleted ? new Date().toISOString() : null
          })
          .eq('id', challenge.id)
      )

      // If challenge is now completed, add to list for awarding points
      if (isNowCompleted) {
        completedChallenges.push({
          id: challenge.id,
          title: challenge.challenges?.title,
          points: challenge.challenges?.points
        })
      }
    }

    // Execute all updates in parallel
    await Promise.all(updates)

    // Award points for completed challenges
    for (const challenge of completedChallenges) {
      if (!challenge.points) continue
      
      await supabaseClient.rpc('award_points', {
        user_uuid: userId,
        points_amount: challenge.points,
        description_text: `Completed challenge: ${challenge.title}`,
        transaction_type_text: 'challenge_completed',
        ref_id: challenge.id,
        ref_type: 'challenge'
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: relevantChallenges.length,
        completed: completedChallenges.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing challenge progress:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
