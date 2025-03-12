
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import PageTransition from "@/components/layout/PageTransition";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminContent } from "@/components/admin/AdminContent";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { useRequireAuth } from '@/hooks/use-auth-route';

const AdminPage = () => {
  const { user, isLoading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check if user has admin role
  if (user?.role !== "Admin") {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="Access Denied" />
          <main className="flex-1 container py-12 max-w-5xl flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-4">
                Access Denied
              </h1>
              <p className="text-muted-foreground mb-6">
                You don't have permission to access the admin area.
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
        <Header title="Admin Dashboard" />
        
        <main className="flex-1 container py-6 max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Admin Dashboard
          </h1>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-transparent p-0 justify-start border-b w-full rounded-none h-auto space-x-6">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-9 px-0"
              >
                Overview
              </TabsTrigger>
              
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-9 px-0"
              >
                Users
              </TabsTrigger>
              
              <TabsTrigger 
                value="content" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-9 px-0"
              >
                Content
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-9 px-0"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
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
