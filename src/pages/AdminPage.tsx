
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRequireAuth } from '@/hooks/use-auth-route';
import { AdminContent } from '@/components/admin/AdminContent';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { adminService } from '@/services/api/admin';
import { useQuery } from '@tanstack/react-query';

const AdminPage = () => {
  const { user, isLoading } = useRequireAuth('admin');
  
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getStats(),
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {isStatsLoading ? (
            <div>Loading statistics...</div>
          ) : (
            <AdminContent stats={statsData || {}} />
          )}
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <AdminUsers />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
