
import { serve } from 'https://deno.land/std@0.188.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { decode } from 'https://deno.land/std@0.188.0/encoding/base32.ts'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to create a Supabase client using the auth token
const getSupabaseClient = (req: Request) => {
  const authHeader = req.headers.get('Authorization')
  const apiKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const url = Deno.env.get('SUPABASE_URL')!

  return createClient(url, apiKey, {
    global: {
      headers: { Authorization: authHeader || '' },
    },
  })
}

// Generate a secure TOTP secret
const generateTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request
    const { action, userId, code, secret } = await req.json()
    const supabase = getSupabaseClient(req)

    if (action === 'setup') {
      // Generate new secret for setup
      const newSecret = secret || generateTOTPSecret()

      // Store in database
      const { error } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: userId,
          secret: newSecret,
          is_enabled: false,
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw new Error(`Failed to store 2FA secret: ${error.message}`)
      }

      return new Response(JSON.stringify({
        success: true,
        secret: newSecret,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    else if (action === 'verify') {
      // Get user's secret
      const { data, error } = await supabase
        .from('user_2fa')
        .select('secret')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        throw new Error(`2FA not set up for this user: ${error?.message}`)
      }

      // Call the RPC function to verify the TOTP code
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_totp', { 
          user_uuid: userId,
          otp_code: code
        });

      if (verifyError) {
        throw new Error(`Failed to verify code: ${verifyError.message}`);
      }

      if (isValid) {
        // If verifying during setup, mark as enabled
        if (!secret) {
          await supabase
            .from('user_2fa')
            .update({
              is_enabled: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      }

      return new Response(JSON.stringify({
        success: isValid,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    else if (action === 'disable') {
      const { error } = await supabase
        .from('user_2fa')
        .delete()
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to disable 2FA: ${error.message}`)
      }

      return new Response(JSON.stringify({
        success: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Invalid action')
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
