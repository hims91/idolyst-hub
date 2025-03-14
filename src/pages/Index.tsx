
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/layout/Header';
import Feed from '@/components/Feed';
import CreatePostForm from '@/components/CreatePostForm';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { useMediaQuery } from '@/hooks/use-mobile';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'Startup News', name: 'Startup News' },
  { id: 'Expert Opinions', name: 'Expert Opinions' },
  { id: 'Funding Updates', name: 'Funding Updates' },
  { id: 'Tech Trends', name: 'Tech Trends' },
  { id: 'Product Launch', name: 'Product Launch' },
];

const Index = () => {
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handlePostSuccess = useCallback(() => {
    // Trigger a refresh of the feed
    setRefreshKey(prev => prev + 1);
  }, []);
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Home" />
        
        <main className="flex-1 container py-4 md:py-6 px-4 md:px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6 md:mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1 md:mb-2">Welcome to Idolyst</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Connect with the startup ecosystem, discover funding opportunities, and share insights
            </p>
          </motion.div>
          
          {/* Post creation form */}
          <CreatePostForm onSuccess={handlePostSuccess} />
          
          <Tabs defaultValue="all" onValueChange={setActiveCategory} className="w-full">
            <div className="border-b mb-4 md:mb-6 sticky top-0 bg-background z-10 pb-1">
              <TabsList className="bg-transparent h-auto p-0 overflow-x-auto flex-nowrap scrollbar-hide">
                {categories.map(category => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:rounded-none data-[state=active]:bg-transparent px-3 md:px-4 py-2 whitespace-nowrap text-sm"
                  >
                    {isMobile && category.id !== 'all' 
                      ? category.name.split(' ')[0] 
                      : category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value="all" key={`feed-all-${refreshKey}`}>
              <Feed />
            </TabsContent>
            
            {categories.slice(1).map(category => (
              <TabsContent key={`feed-${category.id}-${refreshKey}`} value={category.id}>
                <Feed category={category.id} />
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default Index;
