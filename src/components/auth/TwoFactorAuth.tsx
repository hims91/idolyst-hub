
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { twoFactorAuthService } from '@/services/twoFactorAuthService';
import { useToast } from '@/components/ui/use-toast';
import { TwoFactorAuthSetupResponse, TwoFactorAuthVerifyResponse } from '@/types/gamification';

interface TwoFactorAuthProps {
  userId: string;
  is2FAEnabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  userId,
  is2FAEnabled,
  onStatusChange
}) => {
  const [setupStep, setSetupStep] = useState<'initial' | 'setup' | 'verify'>('initial');
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [setupData, setSetupData] = useState<TwoFactorAuthSetupResponse | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const { toast } = useToast();

  const handleSetup = async () => {
    try {
      const response = await twoFactorAuthService.setup2FA(userId);
      setSetupData(response);
      setSetupStep('setup');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Setup failed',
        description: typeof error === 'string' ? error : 'Failed to set up 2FA.'
      });
    }
  };

  const handleVerify = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid code',
        description: 'Please enter a valid 6-digit code.'
      });
      return;
    }

    try {
      const response = await twoFactorAuthService.verify2FA(userId, verifyCode, setupData?.secret || '');
      
      if (response.success) {
        toast({
          title: '2FA Enabled',
          description: 'Two-factor authentication has been enabled for your account.'
        });
        onStatusChange(true);
        setSetupStep('initial');
        setVerifyCode('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Verification failed',
          description: response.message || 'The code you entered is invalid. Please try again.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: typeof error === 'string' ? error : 'Failed to verify 2FA code.'
      });
    }
  };

  const handleDisable = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid code',
        description: 'Please enter a valid 6-digit code to disable 2FA.'
      });
      return;
    }

    try {
      const response = await twoFactorAuthService.disable2FA(userId, disableCode);
      
      if (response.success) {
        toast({
          title: '2FA Disabled',
          description: 'Two-factor authentication has been disabled for your account.'
        });
        onStatusChange(false);
        setIsDisabling(false);
        setDisableCode('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Disabling failed',
          description: response.message || 'The code you entered is invalid. Please try again.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Disabling failed',
        description: typeof error === 'string' ? error : 'Failed to disable 2FA.'
      });
    }
  };

  if (setupStep === 'initial') {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {is2FAEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-500" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <h4 className="text-sm font-semibold">Two-Factor Authentication</h4>
              <p className="text-xs text-muted-foreground">
                {is2FAEnabled
                  ? "Your account is protected with 2FA."
                  : "Secure your account with 2FA."}
              </p>
            </div>
          </div>
          
          {is2FAEnabled ? (
            isDisabling ? (
              <div className="flex items-center space-x-2">
                <Input
                  className="w-24 text-center"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                />
                <Button size="sm" onClick={handleDisable}>Confirm</Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  setIsDisabling(false);
                  setDisableCode('');
                }}>Cancel</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsDisabling(true)}>
                Disable
              </Button>
            )
          ) : (
            <Button size="sm" onClick={handleSetup}>
              Enable
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (setupStep === 'setup' && setupData) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-semibold">Set Up Two-Factor Authentication</h4>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>1. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
            <p>2. Enter the 6-digit code from your app below to verify.</p>
          </div>
          
          <div className="flex justify-center">
            <img src={setupData.qrCode} alt="2FA QR Code" className="max-w-full" />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Manual entry code:</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-xs">
              {setupData.secret}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Input
              className="text-center"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 6-digit code"
            />
            <Button onClick={handleVerify}>Verify</Button>
            <Button variant="ghost" onClick={() => {
              setSetupStep('initial');
              setVerifyCode('');
            }}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Should never reach here
};

export default TwoFactorAuth;
