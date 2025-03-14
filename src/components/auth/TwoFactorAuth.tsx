
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Copy, ShieldCheck, KeyRound, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const TwoFactorAuth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  
  const handleToggle = async (checked: boolean) => {
    if (checked && !isEnabled) {
      // Start 2FA setup
      setIsSettingUp(true);
      try {
        // In a real app, this would call a Supabase function to generate a 2FA secret
        // For now, we'll mock the response
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data - in production this would come from the server
        setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Idolyst:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Idolyst');
        setSecretKey('JBSWY3DPEHPK3PXP');
        
      } catch (error) {
        console.error('Error setting up 2FA:', error);
        toast({
          title: "Setup failed",
          description: "Could not set up two-factor authentication. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSettingUp(false);
      }
    } else if (!checked && isEnabled) {
      // Disable 2FA
      setIsVerifying(true);
      try {
        // In a real app, this would verify the OTP and then disable 2FA
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsEnabled(false);
        setQrCode(null);
        setSecretKey(null);
        setOtpValue('');
        
        toast({
          title: "2FA disabled",
          description: "Two-factor authentication has been disabled.",
        });
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        toast({
          title: "Disabling failed",
          description: "Could not disable two-factor authentication. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    }
  };
  
  const handleVerify = async () => {
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    try {
      // In a real app, this would verify the OTP with the server
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful verification
      setIsEnabled(true);
      setQrCode(null);
      setSecretKey(null);
      setOtpValue('');
      
      toast({
        title: "2FA enabled",
        description: "Two-factor authentication has been successfully enabled for your account.",
      });
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Verification failed",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleCopySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      toast({
        title: "Secret copied",
        description: "The secret key has been copied to your clipboard.",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
          Two-Factor Authentication (2FA)
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with two-factor authentication.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <Label htmlFor="2fa-toggle">Enable 2FA</Label>
            <p className="text-sm text-muted-foreground">
              {isEnabled 
                ? "Your account is protected with two-factor authentication" 
                : "Require a verification code when signing in"}
            </p>
          </div>
          <Switch 
            id="2fa-toggle" 
            checked={isEnabled || isSettingUp} 
            onCheckedChange={handleToggle} 
            disabled={isSettingUp || isVerifying}
          />
        </div>
        
        {isEnabled && (
          <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>2FA is enabled</AlertTitle>
            <AlertDescription>
              Your account is protected with two-factor authentication. You will need to enter a verification code when signing in.
            </AlertDescription>
          </Alert>
        )}
        
        {isSettingUp && !isVerifying && (
          <div className="space-y-6">
            <Alert className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle>Set up 2FA</AlertTitle>
              <AlertDescription>
                Scan the QR code below with an authenticator app like Google Authenticator or Authy, then enter the verification code.
              </AlertDescription>
            </Alert>
            
            {qrCode && (
              <div className="flex flex-col items-center space-y-4 my-6">
                <div className="border p-2 bg-white">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
                
                <div className="flex items-center space-x-2 text-sm bg-muted p-2 rounded">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{secretKey}</span>
                  <Button variant="ghost" size="icon" onClick={handleCopySecret} title="Copy secret key">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="otp">Enter verification code from your authenticator app</Label>
              <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        )}
        
        {isEnabled && isVerifying && (
          <div className="space-y-4 mt-4">
            <Label htmlFor="disable-otp">Enter verification code to disable 2FA</Label>
            <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        )}
      </CardContent>
      
      {(isSettingUp || isVerifying) && (
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsSettingUp(false);
              setIsVerifying(false);
              setOtpValue('');
              setQrCode(null);
              setSecretKey(null);
            }}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={otpValue.length !== 6 || isVerifying}
          >
            {isVerifying ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
            ) : isEnabled ? (
              'Disable 2FA'
            ) : (
              'Verify and Enable'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TwoFactorAuth;
