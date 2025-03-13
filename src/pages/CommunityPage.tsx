
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import CommunitySection from '@/components/community/CommunitySection';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Community" />
        
        <main className="flex-1 container py-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-semibold tracking-tight mb-2">Founder Community</h2>
            <p className="text-muted-foreground">
              Connect with other founders, discuss ideas, and join events.
            </p>
          </motion.div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="events">Upcoming Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discussions">
              <CommunitySection sectionType="discussions" />
            </TabsContent>
            
            <TabsContent value="members">
              <CommunitySection sectionType="members" />
            </TabsContent>
            
            <TabsContent value="events">
              <CommunitySection sectionType="events" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default CommunityPage;
