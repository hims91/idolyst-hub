
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminContent } from '@/components/admin/AdminContent';
import { AdminSettings } from '@/components/admin/AdminSettings';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { adminService } from '@/services/api/admin';
import { useRequireAuth } from '@/hooks/use-auth-route';
import { AdminStats as AdminStatsType } from '@/services/api/types';

const AdminPage = () => {
  const { isLoading, user } = useRequireAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is admin
    if (user && user.role === 'admin') {
      setIsAdmin(true);
      loadDashboardData();
    }
  }, [user]);
  
  const loadDashboardData = async () => {
    try {
      const adminStats = await adminService.getStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="Admin" />
          
          <main className="flex-1 container py-6 max-w-5xl">
            <div className="rounded-lg border p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the admin panel.
              </p>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Admin Panel" />
        
        <main className="flex-1 container py-6 max-w-6xl">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              {stats && <AdminStats stats={stats} />}
            </TabsContent>
            
            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>
            
            <TabsContent value="content">
              <AdminContent />
            </TabsContent>
            
            <TabsContent value="settings">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default AdminPage;
