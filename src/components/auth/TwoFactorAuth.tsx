
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Copy, ShieldCheck, KeyRound, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { setup2FA, verify2FA, disable2FA, is2FAEnabled } from '@/services/twoFactorAuthService';

const TwoFactorAuth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const status = await is2FAEnabled(user.id);
        setEnabled(status);
      } catch (error) {
        console.error('Error checking 2FA status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, [user]);
  
  const handleToggle = async (checked: boolean) => {
    if (!user) return;
    
    if (checked && !enabled) {
      // Start 2FA setup
      setIsSettingUp(true);
      try {
        const response = await setup2FA(user.id);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to set up 2FA');
        }
        
        setQrCode(response.qrCodeUrl || null);
        setSecretKey(response.secret || null);
        
      } catch (error) {
        console.error('Error setting up 2FA:', error);
        toast({
          title: "Setup failed",
          description: error instanceof Error ? error.message : "Could not set up two-factor authentication. Please try again.",
          variant: "destructive",
        });
        setIsSettingUp(false);
      }
    } else if (!checked && enabled) {
      // Prepare to disable 2FA
      setIsVerifying(true);
    }
  };
  
  const handleVerify = async () => {
    if (!user) return;
    
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
      let response;
      
      if (enabled) {
        // Disable 2FA
        response = await disable2FA(user.id, otpValue);
        if (response.success) {
          setEnabled(false);
          toast({
            title: "2FA disabled",
            description: "Two-factor authentication has been disabled for your account.",
          });
        }
      } else {
        // Verify and enable 2FA
        response = await verify2FA(user.id, otpValue, true);
        if (response.success) {
          setEnabled(true);
          toast({
            title: "2FA enabled",
            description: "Two-factor authentication has been successfully enabled for your account.",
          });
        }
      }
      
      if (!response.success) {
        throw new Error(response.error || 'Verification failed');
      }
      
      // Reset state
      setQrCode(null);
      setSecretKey(null);
      setOtpValue('');
      setIsSettingUp(false);
      
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "The code you entered is incorrect. Please try again.",
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
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
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
              {enabled 
                ? "Your account is protected with two-factor authentication" 
                : "Require a verification code when signing in"}
            </p>
          </div>
          <Switch 
            id="2fa-toggle" 
            checked={enabled || isSettingUp} 
            onCheckedChange={handleToggle} 
            disabled={isSettingUp || isVerifying}
          />
        </div>
        
        {enabled && !isVerifying && (
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
                
                {secretKey && (
                  <div className="flex items-center space-x-2 text-sm bg-muted p-2 rounded">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{secretKey}</span>
                    <Button variant="ghost" size="icon" onClick={handleCopySecret} title="Copy secret key">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
        
        {enabled && isVerifying && (
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
            ) : enabled ? (
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
