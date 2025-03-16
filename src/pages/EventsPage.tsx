import React, { useState } from 'react';
import Events from '@/components/Events';
import { useQuery } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import { Spinner } from '@/components/ui/spinner';
import { EventFilter } from '@/types/api';

const EventsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', currentPage],
    queryFn: () => eventService.getEvents(currentPage, 9),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['eventCategories'],
    queryFn: () => eventService.getEventCategories(),
    initialData: []
  });

  if (eventsLoading) {
    return (
      <>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Events</h1>
          <p className="text-gray-500 mb-8">Find and participate in upcoming events, both virtual and in-person.</p>
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Events</h1>
        <p className="text-gray-500 mb-8">Find and participate in upcoming events, both virtual and in-person.</p>
        
        {events && (
          <Events 
            eventData={events?.items || []} 
            categories={categories || []}
            totalEvents={events?.total || 0}
            currentPage={events?.currentPage || 1}
            totalPages={events?.totalPages || 1}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </>
  );
};

export default EventsPage;
