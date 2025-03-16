
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ShieldCheck, ShieldAlert, Check, Smartphone, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { twoFactorAuthService } from '@/services/twoFactorAuthService';
import { TwoFactorAuthSetupResponse, TwoFactorAuthVerifyResponse } from '@/types/gamification';

interface TwoFactorAuthProps {
  userId: string;
  is2FAEnabled: boolean;
  onStatusChange: (isEnabled: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ userId, is2FAEnabled, onStatusChange }) => {
  const [setupStep, setSetupStep] = useState<'initial' | 'scan' | 'verify'>('initial');
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [secret, setSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const { toast } = useToast();

  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const result: TwoFactorAuthSetupResponse = await twoFactorAuthService.setupTwoFactorAuth(userId);
      
      if (!result.success) {
        toast({
          title: 'Setup failed',
          description: result.message || 'Failed to start 2FA setup',
          variant: 'destructive',
        });
        return;
      }
      
      setQrCodeData(result.qrCode);
      setSecret(result.secret);
      setSetupStep('scan');
    } catch (error) {
      toast({
        title: 'Setup error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result: TwoFactorAuthVerifyResponse = await twoFactorAuthService.verifyTwoFactorSetup(userId, verifyCode, secret);
      
      if (result.success) {
        toast({
          title: '2FA Enabled',
          description: 'Two-factor authentication has been successfully enabled for your account',
        });
        onStatusChange(true);
        setSetupStep('initial');
      } else {
        toast({
          title: 'Verification failed',
          description: result.message || 'The code you entered is incorrect',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Verification error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDisabling(true);
    try {
      const result: TwoFactorAuthVerifyResponse = await twoFactorAuthService.disableTwoFactorAuth(userId, disableCode);
      
      if (result.success) {
        toast({
          title: '2FA Disabled',
          description: 'Two-factor authentication has been disabled for your account',
        });
        onStatusChange(false);
        setDisableCode('');
      } else {
        toast({
          title: 'Disable failed',
          description: result.message || 'The code you entered is incorrect',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
          <Badge variant={is2FAEnabled ? "default" : "outline"}>
            {is2FAEnabled ? (
              <><ShieldCheck className="h-3 w-3 mr-1" /> Enabled</>
            ) : (
              <><ShieldAlert className="h-3 w-3 mr-1" /> Disabled</>
            )}
          </Badge>
        </div>
        <CardDescription>
          Add an extra layer of security to your account by requiring a code from your mobile device when you sign in.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!is2FAEnabled ? (
          <>
            {setupStep === 'initial' && (
              <div className="flex flex-col items-center py-4">
                <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Two-factor authentication adds an additional layer of security to your account by requiring a code from your mobile device when you sign in.
                </p>
                <Button onClick={handleStartSetup} disabled={isLoading}>
                  {isLoading && <Spinner size="sm" className="mr-2" />}
                  Set up two-factor authentication
                </Button>
              </div>
            )}
            
            {setupStep === 'scan' && (
              <div className="flex flex-col items-center py-2">
                <div className="mb-4">
                  <img src={qrCodeData} alt="QR Code for 2FA" className="h-48 w-48 border rounded" />
                </div>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Scan this QR code with your authenticator app, then enter the 6-digit code below.
                </p>
                <div className="flex flex-col space-y-2 w-full max-w-xs mb-4">
                  <Input 
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSetupStep('initial')}>
                    Cancel
                  </Button>
                  <Button onClick={handleVerifyCode} disabled={isLoading || verifyCode.length !== 6}>
                    {isLoading && <Spinner size="sm" className="mr-2" />}
                    Verify & Activate
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-full p-3 mb-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Two-factor authentication is currently enabled for your account. To disable it, enter the 6-digit code from your authenticator app.
            </p>
            <div className="flex flex-col space-y-2 w-full max-w-xs mb-4">
              <Input 
                type="text"
                placeholder="Enter 6-digit code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                maxLength={6}
              />
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDisableTwoFactor}
              disabled={isDisabling || disableCode.length !== 6}
            >
              {isDisabling && <Spinner size="sm" className="mr-2" />}
              <X className="h-4 w-4 mr-2" />
              Disable Two-Factor Authentication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
