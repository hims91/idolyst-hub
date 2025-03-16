
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShieldCheck, AlertTriangle, Copy, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorAuthProps {
  userId: string;
  is2FAEnabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ userId, is2FAEnabled, onStatusChange }) => {
  const [isEnabled, setIsEnabled] = useState(is2FAEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Load 2FA status on mount
  useEffect(() => {
    setIsEnabled(is2FAEnabled);
  }, [is2FAEnabled]);

  // Generate new 2FA setup
  const setupTwoFactor = async () => {
    try {
      setIsLoading(true);
      // In a real app, we would call an API to generate a 2FA secret
      // For now, we'll simulate it
      const { data, error } = await supabase.rpc('generate_2fa_secret', {
        user_uuid: userId
      });
      
      if (error) throw error;
      
      // Simulate response
      const mockData = {
        secret: "ABCDEFGHIJKLMNOP",
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/CommunityApp:user@example.com%3Fsecret=ABCDEFGHIJKLMNOP%26issuer=CommunityApp",
        backupCodes: [
          "12345-67890",
          "abcde-fghij",
          "klmno-pqrst",
          "uvwxy-zabcd",
          "efghi-jklmn",
          "opqrs-tuvwx"
        ]
      };
      
      setSecret(mockData.secret);
      setQrCode(mockData.qrCode);
      setBackupCodes(mockData.backupCodes);
      setShowSetup(true);
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      toast({
        variant: "destructive",
        title: "2FA Setup Failed",
        description: "Could not set up two-factor authentication. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify 2FA code and enable 2FA
  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code."
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, we would call an API to verify the code
      const { data, error } = await supabase.rpc('verify_totp', {
        user_uuid: userId,
        otp_code: verificationCode
      });
      
      if (error) throw error;
      
      // If verification succeeds, enable 2FA for the user
      const { error: updateError } = await supabase
        .from('user_2fa')
        .upsert({ 
          user_id: userId, 
          is_enabled: true,
          secret: secret // In a real app, this would be stored encrypted
        });
        
      if (updateError) throw updateError;
      
      setIsEnabled(true);
      onStatusChange(true);
      setShowSetup(false);
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled for your account."
      });
      
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Could not verify the authentication code. Please ensure it's correct and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const disableTwoFactor = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, we would call an API to disable 2FA
      const { error } = await supabase
        .from('user_2fa')
        .update({ is_enabled: false })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setIsEnabled(false);
      onStatusChange(false);
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account."
      });
      
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not disable two-factor authentication. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n')).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied",
          description: "Backup codes copied to clipboard."
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not copy backup codes. Please try again."
        });
      }
    );
  };

  if (showSetup) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app or enter the code manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <img src={qrCode} alt="2FA QR Code" className="h-48 w-48 border rounded-md" />
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-mono bg-secondary p-1 rounded">
                {secret}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="verification-code">Enter the 6-digit code from your authenticator app</Label>
            <Input 
              id="verification-code" 
              maxLength={6} 
              placeholder="123456" 
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            />
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Save your backup codes</AlertTitle>
            <AlertDescription>
              <p className="mb-2">If you lose your device, you'll need these backup codes to access your account. Each code can only be used once.</p>
              <div className="grid grid-cols-2 gap-2 my-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm bg-secondary p-1 rounded text-center">
                    {code}
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={copyBackupCodes}
              >
                {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied" : "Copy Codes"}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setShowSetup(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={verifyAndEnable} disabled={isLoading || verificationCode.length !== 6}>
            {isLoading ? "Verifying..." : "Verify and Enable"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center">
          <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
          <h4 className="font-medium">Two-Factor Authentication</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          {isEnabled 
            ? "Your account is protected with two-factor authentication." 
            : "Add an extra layer of security to your account."}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {isEnabled ? (
          <Button variant="outline" onClick={disableTwoFactor} disabled={isLoading}>
            {isLoading ? "Disabling..." : "Disable"}
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Switch 
              id="2fa-toggle"
              checked={isEnabled}
              onCheckedChange={() => setupTwoFactor()}
              disabled={isLoading}
            />
            <Label htmlFor="2fa-toggle">
              {isLoading ? "Loading..." : isEnabled ? "Enabled" : "Disabled"}
            </Label>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuth;
