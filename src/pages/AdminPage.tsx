
import React from 'react';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsers from '@/components/admin/AdminUsers';
import AdminContent from '@/components/admin/AdminContent';
import AdminStats from '@/components/admin/AdminStats';
import AdminSettings from '@/components/admin/AdminSettings';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from 'lucide-react';

const AdminPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is admin
  React.useEffect(() => {
    if (!isLoading && user && user.role !== 'Admin') {
      navigate('/');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Admin Dashboard" />
        
        <main className="flex-1 container py-6">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="stats">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats">
              <AdminStats />
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
