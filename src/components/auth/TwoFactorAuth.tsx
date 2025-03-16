
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Shield, ShieldOff, Copy } from 'lucide-react';
import twoFactorAuthService from '@/services/twoFactorAuthService';

export interface TwoFactorAuthProps {
  userId: string;
  is2FAEnabled: boolean;
  onStatusChange: (isEnabled: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ userId, is2FAEnabled, onStatusChange }) => {
  const { toast } = useToast();
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setupTwoFactorAuth = async () => {
    try {
      setIsLoading(true);
      const response = await twoFactorAuthService.setupTwoFactorAuth(userId);
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setIsSetupMode(true);
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Failed to setup 2FA. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnableTwoFactorAuth = async () => {
    try {
      setIsLoading(true);
      const response = await twoFactorAuthService.verifyTwoFactorSetup(userId, verificationCode, secret);
      
      if (response.success) {
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled!",
        });
        onStatusChange(true);
        setIsSetupMode(false);
        setVerificationCode('');
      } else {
        toast({
          title: "Verification Failed",
          description: response.message || "Invalid verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactorAuth = async () => {
    try {
      setIsLoading(true);
      const response = await twoFactorAuthService.disableTwoFactorAuth(userId, verificationCode);
      
      if (response.success) {
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled.",
        });
        onStatusChange(false);
        setVerificationCode('');
      } else {
        toast({
          title: "Verification Failed",
          description: response.message || "Invalid verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Disable Failed",
        description: error instanceof Error ? error.message : "Failed to disable 2FA. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copied",
      description: "Secret key copied to clipboard!",
    });
  };

  if (isSetupMode) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Set Up Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Scan the QR code with your authenticator app or enter the secret key manually.
        </p>
        <div className="flex flex-col items-center space-y-4 mb-4">
          <img src={qrCode} alt="QR Code for 2FA" className="w-40 h-40 mb-2" />
          <div className="flex items-center space-x-2">
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">{secret}</code>
            <Button variant="ghost" size="icon" onClick={copySecret}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="verify-code" className="text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="verify-code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setIsSetupMode(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={verifyAndEnableTwoFactorAuth} disabled={verificationCode.length !== 6 || isLoading}>
              Verify and Enable
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (is2FAEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="text-base font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Your account is protected with 2FA.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsSetupMode(true)}
            disabled={isLoading}
          >
            <ShieldOff className="h-4 w-4 mr-2" />
            Disable
          </Button>
        </div>
        {isSetupMode && (
          <div className="space-y-2">
            <Input
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsSetupMode(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={disableTwoFactorAuth}
                disabled={verificationCode.length !== 6 || isLoading}
              >
                Confirm Disable
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <ShieldOff className="h-5 w-5 text-gray-400" />
        <div>
          <h3 className="text-base font-medium">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Increase your account security with 2FA.
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={setupTwoFactorAuth} disabled={isLoading}>
        <Shield className="h-4 w-4 mr-2" />
        Set Up
      </Button>
    </div>
  );
};

export default TwoFactorAuth;
