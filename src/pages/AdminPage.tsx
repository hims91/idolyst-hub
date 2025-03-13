import React from 'react';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStats from '@/components/admin/AdminStats'; // Changed from { AdminStats }
import AdminUsers from '@/components/admin/AdminUsers';
import AdminContent from '@/components/admin/AdminContent';
import AdminSettings from '@/components/admin/AdminSettings';
import { useRequireAuth } from '@/hooks/use-auth-route';

const AdminPage = () => {
  // Protect this route - redirect to login if not authenticated
  const { isLoading } = useRequireAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Admin Dashboard" />
        
        <main className="flex-1 container py-6 max-w-5xl">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="flex w-full max-w-2xl mx-auto bg-muted">
              <TabsTrigger value="stats" className="flex-1">Statistics</TabsTrigger>
              <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="mt-6">
              <AdminStats />
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              <AdminUsers />
            </TabsContent>
            
            <TabsContent value="content" className="mt-6">
              <AdminContent />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default AdminPage;
