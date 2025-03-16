
import { supabase } from "@/integrations/supabase/client";
import { TwoFactorAuthSetupResponse, TwoFactorAuthVerifyResponse } from "@/types/gamification";

export const setup2FA = async (userId: string): Promise<TwoFactorAuthSetupResponse> => {
  try {
    // This is a mock implementation
    // In a real app, you'd call an API endpoint that generates a TOTP secret and QR code
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response
    return {
      success: true,
      qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAABA0lEQVR42uyYMY7sIBBEN1KkyJEiRY4UKXKkSJGJHDkaNE7Ml5qS/aNZ7Uor7SYkRPfrhgLMMAzDMAxfxd9y8XVr6G3D3m0Nb7C23UbX8F5W2+/fNnzcGhz7Pepr7Zt9/3PP9d7ZQP09GuzbvmL/YE85dvtWu9W+6/oP9u217xkgsG/R9ScE6E9+/Y0BxTbScv22bRRg6V+xjQnxZ0wA2ygIARuFhQDbKMoAfv0ZwDbKXqN4UMAXAWKSRiCn7RWA2cZEIIbs/PoTAdsoEUgEJAQyAhtlj72WgNkoKmCjIIDZKAFANgoCqI2CgFi/jx0d2SgBuI2CgNgoIwHDMAzDMHyR/wCxlSTQDhOJOQAAAABJRU5ErkJggg==",
      secret: "JBSWY3DPEHPK3PXP"
    };
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return {
      success: false,
      message: 'Failed to set up 2FA. Please try again later.',
      qrCode: '',
      secret: '',
      error: String(error)
    };
  }
};

export const verify2FA = async (userId: string, code: string, secret: string): Promise<TwoFactorAuthVerifyResponse> => {
  try {
    // In a real app, this would verify the TOTP code against the secret
    // For demo purposes, we'll call Supabase's verify_totp function
    const { data, error } = await supabase.rpc('verify_totp', {
      user_uuid: userId,
      otp_code: code
    });
    
    if (error) throw error;
    
    // Mock verification (always succeeds with code "123456")
    const isValid = code === "123456" || data === true;
    
    if (isValid) {
      // In a real app, you'd save the secret to the database and mark 2FA as enabled
      const { error: updateError } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: userId,
          secret: secret,
          is_enabled: true
        });
      
      if (updateError) throw updateError;
      
      return {
        success: true,
        message: '2FA verified and enabled successfully'
      };
    }
    
    return {
      success: false,
      message: 'Invalid verification code'
    };
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return {
      success: false,
      message: 'Failed to verify 2FA. Please try again later.',
      error: String(error)
    };
  }
};

export const disable2FA = async (userId: string, code: string): Promise<TwoFactorAuthVerifyResponse> => {
  try {
    // In a real app, this would verify the current TOTP code before disabling 2FA
    const { data, error } = await supabase.rpc('verify_totp', {
      user_uuid: userId,
      otp_code: code
    });
    
    if (error) throw error;
    
    // Mock verification (always succeeds with code "123456")
    const isValid = code === "123456" || data === true;
    
    if (isValid) {
      // In a real app, you'd update the database to disable 2FA
      const { error: updateError } = await supabase
        .from('user_2fa')
        .update({ is_enabled: false })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
      
      return {
        success: true,
        message: '2FA disabled successfully'
      };
    }
    
    return {
      success: false,
      message: 'Invalid verification code'
    };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return {
      success: false,
      message: 'Failed to disable 2FA. Please try again later.',
      error: String(error)
    };
  }
};

export const check2FAStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_2fa')
      .select('is_enabled')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found, user has not set up 2FA
        return false;
      }
      throw error;
    }
    
    return data?.is_enabled || false;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
};

export const twoFactorAuthService = {
  setup2FA,
  verify2FA,
  disable2FA,
  check2FAStatus
};

export default twoFactorAuthService;
