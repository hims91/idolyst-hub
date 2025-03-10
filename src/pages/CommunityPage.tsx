
import React from 'react';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAuth } from '@/hooks/use-auth-route';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunitySection from '@/components/community/CommunitySection';

const CommunityPage = () => {
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
        <Header title="Community" />
        
        <main className="flex-1 container py-6 max-w-5xl">
          <Tabs defaultValue="discussions" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discussions">
              <CommunitySection type="discussions" />
            </TabsContent>
            
            <TabsContent value="members">
              <CommunitySection type="members" />
            </TabsContent>
            
            <TabsContent value="events">
              <CommunitySection type="events" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default CommunityPage;
