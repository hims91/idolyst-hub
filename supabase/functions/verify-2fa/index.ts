
import { serve } from "https://deno.land/std@0.188.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
      
      // Generate a QR code URL (in a real app, this would be a proper TOTP URI)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Founder:${userId}?secret=${newSecret}&issuer=FounderPlatform`

      return new Response(JSON.stringify({
        success: true,
        secret: newSecret,
        qrCodeUrl: qrCodeUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    else if (action === 'verify') {
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
      // Verify the code before disabling 2FA
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_totp', { 
          user_uuid: userId,
          otp_code: code
        });

      if (verifyError) {
        throw new Error(`Failed to verify code: ${verifyError.message}`);
      }

      if (!isValid) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid verification code'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

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

    else if (action === 'status') {
      const { data, error } = await supabase
        .from('user_2fa')
        .select('is_enabled')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to check 2FA status: ${error.message}`)
      }

      return new Response(JSON.stringify({
        success: true,
        isEnabled: data?.is_enabled || false
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

// Generate a secure TOTP secret
const generateTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}
