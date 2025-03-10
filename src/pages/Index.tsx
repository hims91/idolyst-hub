
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/layout/Header';
import Feed from '@/components/Feed';
import PageTransition from '@/components/layout/PageTransition';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'Startup News', name: 'Startup News' },
  { id: 'Expert Opinions', name: 'Expert Opinions' },
  { id: 'Funding Updates', name: 'Funding Updates' },
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Home" />
        
        <main className="flex-1 container py-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-semibold tracking-tight mb-2">Welcome to Idolyst</h2>
            <p className="text-muted-foreground">
              Connect with the startup ecosystem, discover funding opportunities, and share insights
            </p>
          </motion.div>
          
          <Tabs defaultValue="all" onValueChange={setActiveCategory} className="w-full">
            <div className="border-b mb-6">
              <TabsList className="bg-transparent h-auto p-0">
                {categories.map(category => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:rounded-none data-[state=active]:bg-transparent px-4 py-2"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value="all">
              <Feed />
            </TabsContent>
            
            {categories.slice(1).map(category => (
              <TabsContent key={category.id} value={category.id}>
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
