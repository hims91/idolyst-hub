
import React from 'react';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { useRequireAuth } from '@/hooks/use-auth-route';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InsightsSection from '@/components/insights/InsightsSection';

const InsightsPage = () => {
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
        <Header title="Insights & Analytics" />
        
        <main className="flex-1 container py-6 max-w-5xl">
          <Tabs defaultValue="market" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="user">User Activity</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
            </TabsList>
            
            <TabsContent value="market">
              <InsightsSection type="market" />
            </TabsContent>
            
            <TabsContent value="user">
              <InsightsSection type="user" />
            </TabsContent>
            
            <TabsContent value="funding">
              <InsightsSection type="funding" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default InsightsPage;
