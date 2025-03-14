
import { supabase } from '@/integrations/supabase/client';

/**
 * Enable 2FA for a user
 * @param userId The user's ID
 * @returns The secret key for the user to set up their authenticator app
 */
export const enable2FA = async (userId: string): Promise<string | null> => {
  try {
    // Call edge function to generate a TOTP secret
    const { data, error } = await supabase.functions.invoke('generate2FASecret', {
      body: { userId }
    });
    
    if (error) {
      console.error('Error enabling 2FA:', error);
      return null;
    }
    
    return data?.secret || null;
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
    // Call the edge function to verify the code and complete setup
    const { data, error } = await supabase.functions.invoke('verify2FASetup', {
      body: { 
        userId,
        code
      }
    });
    
    if (error) {
      console.error('Error verifying 2FA code:', error);
      return false;
    }
    
    return data?.success || false;
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
    // Call the edge function to verify the code
    const { data, error } = await supabase.functions.invoke('verify2FALogin', {
      body: { 
        userId,
        code
      }
    });
    
    if (error) {
      console.error('Error verifying 2FA code:', error);
      return false;
    }
    
    return data?.success || false;
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
    const { data, error } = await supabase.functions.invoke('check2FAStatus', {
      body: { userId }
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
 * @returns Whether the operation was successful
 */
export const disable2FA = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('disable2FA', {
      body: { userId }
    });
    
    if (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
    
    return data?.success || false;
  } catch (error) {
    console.error('Error in disable2FA:', error);
    return false;
  }
};
