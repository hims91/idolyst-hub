
import React from 'react';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import Events from '@/components/Events';

const EventsPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Events" />
        
        <main className="flex-1 container py-6 max-w-6xl">
          <Events />
        </main>
      </div>
    </PageTransition>
  );
};

export default EventsPage;
