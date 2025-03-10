
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string(),
  logoUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  faviconUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  contactEmail: z.string().email('Must be a valid email'),
  userRegistration: z.boolean(),
  maintenanceMode: z.boolean(),
});

const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.string().regex(/^\d+$/, 'Port must be a number'),
  smtpUser: z.string(),
  smtpPassword: z.string(),
  smtpFromEmail: z.string().email('Must be a valid email'),
  smtpFromName: z.string(),
  enableEmailNotifications: z.boolean(),
});

const integrationSettingsSchema = z.object({
  googleAnalyticsId: z.string(),
  facebookPixelId: z.string(),
  recaptchaSiteKey: z.string(),
  recaptchaSecretKey: z.string(),
  stripePublicKey: z.string(),
  stripeSecretKey: z.string(),
});

const AdminSettings = () => {
  const { data: generalData, isLoading: isGeneralLoading } = useQuery({
    queryKey: ['admin', 'settings', 'general'],
    queryFn: () => apiService.getGeneralSettings(),
  });
  
  const { data: emailData, isLoading: isEmailLoading } = useQuery({
    queryKey: ['admin', 'settings', 'email'],
    queryFn: () => apiService.getEmailSettings(),
  });
  
  const { data: integrationData, isLoading: isIntegrationLoading } = useQuery({
    queryKey: ['admin', 'settings', 'integration'],
    queryFn: () => apiService.getIntegrationSettings(),
  });
  
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: '',
      siteDescription: '',
      logoUrl: '',
      faviconUrl: '',
      contactEmail: '',
      userRegistration: true,
      maintenanceMode: false,
    },
  });
  
  const emailForm = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      smtpFromEmail: '',
      smtpFromName: '',
      enableEmailNotifications: true,
    },
  });
  
  const integrationForm = useForm<z.infer<typeof integrationSettingsSchema>>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: {
      googleAnalyticsId: '',
      facebookPixelId: '',
      recaptchaSiteKey: '',
      recaptchaSecretKey: '',
      stripePublicKey: '',
      stripeSecretKey: '',
    },
  });
  
  // Set form values once data is loaded
  React.useEffect(() => {
    if (generalData) {
      generalForm.reset(generalData);
    }
  }, [generalData, generalForm]);
  
  React.useEffect(() => {
    if (emailData) {
      emailForm.reset(emailData);
    }
  }, [emailData, emailForm]);
  
  React.useEffect(() => {
    if (integrationData) {
      integrationForm.reset(integrationData);
    }
  }, [integrationData, integrationForm]);
  
  const generalMutation = useMutation({
    mutationFn: (data: z.infer<typeof generalSettingsSchema>) => 
      apiService.updateGeneralSettings(data),
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'General settings have been updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save general settings',
        variant: 'destructive',
      });
    },
  });
  
  const emailMutation = useMutation({
    mutationFn: (data: z.infer<typeof emailSettingsSchema>) => 
      apiService.updateEmailSettings(data),
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'Email settings have been updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save email settings',
        variant: 'destructive',
      });
    },
  });
  
  const integrationMutation = useMutation({
    mutationFn: (data: z.infer<typeof integrationSettingsSchema>) => 
      apiService.updateIntegrationSettings(data),
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'Integration settings have been updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save integration settings',
        variant: 'destructive',
      });
    },
  });
  
  const onGeneralSubmit = (data: z.infer<typeof generalSettingsSchema>) => {
    generalMutation.mutate(data);
  };
  
  const onEmailSubmit = (data: z.infer<typeof emailSettingsSchema>) => {
    emailMutation.mutate(data);
  };
  
  const onIntegrationSubmit = (data: z.infer<typeof integrationSettingsSchema>) => {
    integrationMutation.mutate(data);
  };
  
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Manage your site's basic configuration and appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                <FormField
                  control={generalForm.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Startup Platform" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of your site, displayed in the browser tab and emails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={generalForm.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A platform for startups and entrepreneurs" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description of your site (used in search results and meta tags)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={generalForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="faviconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/favicon.ico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={generalForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        The email address users can contact for support
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <div className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="userRegistration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Allow User Registration</FormLabel>
                          <FormDescription>
                            Enable or disable new user registration
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Maintenance Mode</FormLabel>
                          <FormDescription>
                            When enabled, only administrators can access the site
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isGeneralLoading || generalMutation.isPending}
                >
                  {generalMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>
              Configure your email server and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={emailForm.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emailForm.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input placeholder="587" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={emailForm.control}
                    name="smtpUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emailForm.control}
                    name="smtpPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={emailForm.control}
                    name="smtpFromEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Email</FormLabel>
                        <FormControl>
                          <Input placeholder="no-reply@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emailForm.control}
                    name="smtpFromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Startup Platform" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <FormField
                  control={emailForm.control}
                  name="enableEmailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Email Notifications</FormLabel>
                        <FormDescription>
                          Enable email notifications for user activities
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isEmailLoading || emailMutation.isPending}
                >
                  {emailMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="integrations">
        <Card>
          <CardHeader>
            <CardTitle>Integration Settings</CardTitle>
            <CardDescription>
              Configure third-party integrations and APIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...integrationForm}>
              <form onSubmit={integrationForm.handleSubmit(onIntegrationSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Analytics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={integrationForm.control}
                      name="googleAnalyticsId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Analytics ID</FormLabel>
                          <FormControl>
                            <Input placeholder="G-XXXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={integrationForm.control}
                      name="facebookPixelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook Pixel ID</FormLabel>
                          <FormControl>
                            <Input placeholder="XXXXXXXXXXXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={integrationForm.control}
                      name="recaptchaSiteKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>reCAPTCHA Site Key</FormLabel>
                          <FormControl>
                            <Input placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={integrationForm.control}
                      name="recaptchaSecretKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>reCAPTCHA Secret Key</FormLabel>
                          <FormControl>
                            <Input placeholder="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={integrationForm.control}
                      name="stripePublicKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stripe Public Key</FormLabel>
                          <FormControl>
                            <Input placeholder="pk_test_XXXXXXXXXXXXXXXXXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={integrationForm.control}
                      name="stripeSecretKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stripe Secret Key</FormLabel>
                          <FormControl>
                            <Input placeholder="sk_test_XXXXXXXXXXXXXXXXXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isIntegrationLoading || integrationMutation.isPending}
                >
                  {integrationMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminSettings;
