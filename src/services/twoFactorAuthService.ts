
import { supabase } from '@/integrations/supabase/client';

/**
 * Enable 2FA for a user
 * @param userId The user's ID
 * @returns The secret key for the user to set up their authenticator app
 */
export const enable2FA = async (userId: string): Promise<string | null> => {
  try {
    // Generate a random secret key (in a real app, use a proper TOTP library)
    // This is a placeholder implementation
    const secretKey = Math.random().toString(36).substring(2, 15);
    
    const { error } = await supabase
      .from('user_2fa')
      .upsert({
        user_id: userId,
        secret: secretKey,
        is_enabled: false, // Initially false until verified
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error enabling 2FA:', error);
      return null;
    }
    
    return secretKey;
  } catch (error) {
    console.error('Error in enable2FA:', error);
    return null;
  }
};

/**
 * Verify a 2FA code and complete 2FA setup
 * @param userId The user's ID
 * @param code The verification code from the authenticator app
 * @returns Whether the verification was successful
 */
export const verify2FASetup = async (userId: string, code: string): Promise<boolean> => {
  try {
    // Call the Supabase function to verify the code
    const { data, error } = await supabase
      .rpc('verify_totp', { 
        user_uuid: userId,
        otp_code: code
      });
    
    if (error || !data) {
      console.error('Error verifying 2FA code:', error);
      return false;
    }
    
    // Update the user's 2FA status
    if (data) {
      const { error: updateError } = await supabase
        .from('user_2fa')
        .update({
          is_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating 2FA status:', updateError);
        return false;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in verify2FASetup:', error);
    return false;
  }
};

/**
 * Verify a 2FA code during login
 * @param userId The user's ID
 * @param code The verification code from the authenticator app
 * @returns Whether the verification was successful
 */
export const verify2FALogin = async (userId: string, code: string): Promise<boolean> => {
  try {
    // Call the Supabase function to verify the code
    const { data, error } = await supabase
      .rpc('verify_totp', { 
        user_uuid: userId,
        otp_code: code
      });
    
    if (error) {
      console.error('Error verifying 2FA code:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error in verify2FALogin:', error);
    return false;
  }
};

/**
 * Check if a user has 2FA enabled
 * @param userId The user's ID
 * @returns Whether 2FA is enabled for the user
 */
export const is2FAEnabled = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_2fa')
      .select('is_enabled')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
    
    return data?.is_enabled || false;
  } catch (error) {
    console.error('Error in is2FAEnabled:', error);
    return false;
  }
};

/**
 * Disable 2FA for a user
 * @param userId The user's ID
 * @returns Whether the operation was successful
 */
export const disable2FA = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_2fa')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in disable2FA:', error);
    return false;
  }
};
