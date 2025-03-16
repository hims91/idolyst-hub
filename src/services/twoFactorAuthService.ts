
import { supabase } from "@/integrations/supabase/client";
import { TwoFactorAuthSetupResponse, TwoFactorAuthVerifyResponse } from "@/types/gamification";

// Setup 2FA for a user
const setupTwoFactorAuth = async (userId: string): Promise<TwoFactorAuthSetupResponse> => {
  try {
    // This would be a call to generate a new 2FA secret and QR code
    // For this demo, we're just mocking it
    // In a real implementation, you'd use a library like otplib
    
    const mockSecret = `SEC${Math.random().toString(36).substring(2, 15)}`;
    const mockQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/CommunityPlatform:${userId}?secret=${mockSecret}&issuer=CommunityPlatform`;
    
    return {
      success: true,
      qrCode: mockQrCode,
      secret: mockSecret
    };
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      qrCode: "",
      secret: ""
    };
  }
};

// Verify and activate 2FA for a user
const verifyTwoFactorSetup = async (
  userId: string, 
  code: string, 
  secret: string
): Promise<TwoFactorAuthVerifyResponse> => {
  try {
    // In a real implementation, this would validate the OTP code against the secret
    // For this demo, we'll accept any 6-digit code
    
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: "Invalid code format. Must be 6 digits."
      };
    }
    
    // Mock verification - in a real implementation, you'd verify the code
    // using a library like otplib
    
    // Store the secret in the database
    const { error } = await supabase
      .from('user_2fa')
      .upsert({
        user_id: userId,
        secret: secret,
        is_enabled: true,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error verifying 2FA setup:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
};

// Disable 2FA for a user
const disableTwoFactorAuth = async (
  userId: string, 
  code: string
): Promise<TwoFactorAuthVerifyResponse> => {
  try {
    // In a real implementation, this would validate the OTP code before disabling
    // For this demo, we'll accept any 6-digit code
    
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: "Invalid code format. Must be 6 digits."
      };
    }
    
    // Verify the code
    const { error: fnError, data: isValid } = await supabase
      .rpc('verify_totp', {
        user_uuid: userId,
        otp_code: code
      });
    
    if (fnError || !isValid) {
      return {
        success: false,
        message: fnError?.message || "Invalid verification code"
      };
    }
    
    // Disable 2FA
    const { error } = await supabase
      .from('user_2fa')
      .update({ 
        is_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
};

export const twoFactorAuthService = {
  setupTwoFactorAuth,
  verifyTwoFactorSetup,
  disableTwoFactorAuth
};

export default twoFactorAuthService;
