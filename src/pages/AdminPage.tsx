
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Tab, Tabs } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import AdminStats from '@/components/admin/AdminStats';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminContent from '@/components/admin/AdminContent';
import AdminSettings from '@/components/admin/AdminSettings';
import { getAdminStats, getAdminUsers, getAdminContent } from '@/services/api/admin';
import { useAuthSession } from '@/hooks/useAuthSession';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const auth = useAuthSession();
  const isAuthenticated = auth?.isValidSession;

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
    enabled: isAuthenticated && activeTab === 'users',
  });

  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ['admin-content'],
    queryFn: getAdminContent,
    enabled: isAuthenticated && activeTab === 'content',
  });

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Header title="Admin Panel" />
          <main className="container py-8">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="mt-2">You don't have permission to access the admin area.</p>
            </Card>
          </main>
        </div>
      </PageTransition>
    );
  }

  const isLoading = 
    (activeTab === 'dashboard' && statsLoading) || 
    (activeTab === 'users' && usersLoading) || 
    (activeTab === 'content' && contentLoading);

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Header title="Admin Panel" />
        
        <main className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <Tab value="dashboard">Dashboard</Tab>
                <Tab value="users">Users</Tab>
                <Tab value="content">Content</Tab>
                <Tab value="settings">Settings</Tab>
              </Tabs>
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Spinner size="lg" />
                </div>
              ) : (
                <>
                  {activeTab === 'dashboard' && <AdminStats stats={statsData || {}} />}
                  {activeTab === 'users' && <AdminUsers users={usersData || []} />}
                  {activeTab === 'content' && <AdminContent content={contentData || {}} />}
                  {activeTab === 'settings' && <AdminSettings />}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default AdminPage;
