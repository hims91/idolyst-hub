
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import Events from '@/components/Events';
import eventService from '@/services/eventService';
import { Spinner } from '@/components/ui/spinner';

const EventsPage = () => {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['event-categories'],
    queryFn: eventService.getEventCategories,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getEvents(),
  });

  const isLoading = categoriesLoading || eventsLoading;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Events" />
        
        <main className="flex-1 container py-6 max-w-6xl">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <Events 
              eventData={events?.items || []} 
              totalEvents={events?.total || 0}
              currentPage={events?.currentPage || 1}
              totalPages={events?.totalPages || 1}
              categories={categories || []}
              isLoading={isLoading}
            />
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default EventsPage;
