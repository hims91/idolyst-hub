
import React from 'react';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import Crowdfunding from '@/components/Crowdfunding';

const CrowdfundingPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Crowdfunding" />
        
        <main className="flex-1 container py-6 max-w-5xl">
          <Crowdfunding />
        </main>
      </div>
    </PageTransition>
  );
};

export default CrowdfundingPage;
