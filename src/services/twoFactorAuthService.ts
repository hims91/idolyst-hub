
import { supabase } from '@/integrations/supabase/client';
import { TwoFactorAuthSetupResponse, TwoFactorAuthVerifyResponse } from '@/types/gamification';

/**
 * Setup 2FA for a user
 * @param userId The user's ID
 * @returns The setup response with secret and QR code URL
 */
export const setup2FA = async (userId: string): Promise<TwoFactorAuthSetupResponse> => {
  try {
    // Call edge function to setup 2FA
    const { data, error } = await supabase.functions.invoke('verify-2fa', {
      body: { 
        action: 'setup',
        userId
      }
    });
    
    if (error) {
      console.error('Error setting up 2FA:', error);
      return { success: false, error: error.message };
    }
    
    return {
      success: data.success,
      secret: data.secret,
      qrCodeUrl: data.qrCodeUrl,
      error: data.error
    };
  } catch (error) {
    console.error('Error in setup2FA:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Verify a 2FA code during setup or login
 * @param userId The user's ID
 * @param code The verification code from the authenticator app
 * @param isSetup Whether this is for initial setup or not
 * @returns Whether the verification was successful
 */
export const verify2FA = async (userId: string, code: string, isSetup = false): Promise<TwoFactorAuthVerifyResponse> => {
  try {
    // Call the edge function to verify the code
    const { data, error } = await supabase.functions.invoke('verify-2fa', {
      body: { 
        action: 'verify',
        userId,
        code,
        secret: isSetup ? true : undefined // Just a flag to indicate this is from setup
      }
    });
    
    if (error) {
      console.error('Error verifying 2FA code:', error);
      return { success: false, error: error.message };
    }
    
    return {
      success: data.success,
      error: data.error
    };
  } catch (error) {
    console.error('Error in verify2FA:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Check if a user has 2FA enabled
 * @param userId The user's ID
 * @returns Whether 2FA is enabled for the user
 */
export const is2FAEnabled = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-2fa', {
      body: { 
        action: 'status',
        userId
      }
    });
    
    if (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
    
    return data?.isEnabled || false;
  } catch (error) {
    console.error('Error in is2FAEnabled:', error);
    return false;
  }
};

/**
 * Disable 2FA for a user
 * @param userId The user's ID
 * @param code Verification code to authorize disabling 2FA
 * @returns Whether the operation was successful
 */
export const disable2FA = async (userId: string, code: string): Promise<TwoFactorAuthVerifyResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-2fa', {
      body: { 
        action: 'disable',
        userId,
        code
      }
    });
    
    if (error) {
      console.error('Error disabling 2FA:', error);
      return { success: false, error: error.message };
    }
    
    return {
      success: data.success,
      error: data.error
    };
  } catch (error) {
    console.error('Error in disable2FA:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
