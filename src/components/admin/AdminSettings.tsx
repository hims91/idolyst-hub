
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { adminService } from '@/services/api/admin';
import { EmailSettingsForm } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'Required'),
  smtpPort: z.string().min(1, 'Required'),
  smtpUser: z.string().min(1, 'Required'),
  smtpPassword: z.string().min(1, 'Required'),
  smtpFromEmail: z.string().email('Invalid email'),
  smtpFromName: z.string().min(1, 'Required'),
  enableEmailNotifications: z.boolean(),
});

export const AdminSettings = () => {
  const form = useForm<EmailSettingsForm>({
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

  const onSubmit = async (data: EmailSettingsForm) => {
    await adminService.updateEmailSettings(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="smtpHost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP Host</FormLabel>
              <FormControl>
                <Input placeholder="smtp.example.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="smtpPort"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP Port</FormLabel>
              <FormControl>
                <Input placeholder="587" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="smtpUser"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP User</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="smtpPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="smtpFromEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP From Email</FormLabel>
              <FormControl>
                <Input placeholder="from@example.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="smtpFromName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP From Name</FormLabel>
              <FormControl>
                <Input placeholder="Example Name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enableEmailNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Enable Email Notifications</FormLabel>
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
        <Button type="submit">Update Settings</Button>
      </form>
    </Form>
  );
};
