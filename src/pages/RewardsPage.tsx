
import React from 'react';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAuth } from '@/hooks/use-auth-route';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RewardsSection from '@/components/rewards/RewardsSection';

const RewardsPage = () => {
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
        <Header title="Rewards & Badges" />
        
        <main className="flex-1 container py-6 max-w-5xl">
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="earned">Earned</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              <RewardsSection type="available" />
            </TabsContent>
            
            <TabsContent value="earned">
              <RewardsSection type="earned" />
            </TabsContent>
            
            <TabsContent value="leaderboard">
              <RewardsSection type="leaderboard" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default RewardsPage;
