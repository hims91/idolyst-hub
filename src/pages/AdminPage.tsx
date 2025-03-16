
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shell } from '@/components/ui/shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTitle } from '@/components/ui/page-title';
import AdminStats from '@/components/admin/AdminStats';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminContent from '@/components/admin/AdminContent';
import AdminSettings from '@/components/admin/AdminSettings';
import { useRequireAuth } from '@/hooks/use-auth-route';
import { Spinner } from '@/components/ui/spinner';
import { Helmet } from 'react-helmet-async';
import adminService from '@/services/api/admin';
import { AdminStats as AdminStatsType, AdminUser } from '@/types/api';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const auth = useRequireAuth();
  
  // Check if user is admin
  const isAdmin = auth?.user?.role === 'admin';
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getAdminStats(),
    enabled: isAdmin && activeTab === 'dashboard',
  });
  
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminService.getAdminUsers(),
    enabled: isAdmin && activeTab === 'users',
  });
  
  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['adminContent'],
    queryFn: () => adminService.getAdminContent(),
    enabled: isAdmin && activeTab === 'content',
  });
  
  if (!auth?.user) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </Shell>
    );
  }
  
  if (!isAdmin) {
    return (
      <Shell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have permission to access the admin dashboard.
          </p>
        </div>
      </Shell>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Community Platform</title>
      </Helmet>
      
      <Shell>
        <PageTitle 
          heading="Admin Dashboard" 
          text="Manage users, content, and settings for the platform."
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            {stats ? <AdminStats stats={stats as unknown as AdminStatsType} /> : <AdminStats stats={{} as AdminStatsType} />}
          </TabsContent>
          
          <TabsContent value="users">
            {users && <AdminUsers users={users as AdminUser[]} />}
          </TabsContent>
          
          <TabsContent value="content">
            <AdminContent />
          </TabsContent>
          
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </Shell>
    </>
  );
};

export default AdminPage;
