
import React, { useState } from 'react';
import { Shell } from '@/components/ui/shell';
import { PageTitle } from '@/components/ui/page-title';
import Events from '@/components/Events';
import { useQuery } from '@tanstack/react-query';
import eventService from '@/services/eventService';
import { Helmet } from 'react-helmet';
import { Spinner } from '@/components/ui/spinner';

const EventsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', currentPage],
    queryFn: () => eventService.getEvents(currentPage, 9),
  });

  const { data: categories } = useQuery({
    queryKey: ['eventCategories'],
    queryFn: () => eventService.getEventCategories(),
    initialData: []
  });

  return (
    <>
      <Helmet>
        <title>Events | Community Platform</title>
      </Helmet>
      
      <Shell>
        <PageTitle
          heading="Events"
          text="Find and participate in upcoming events, both virtual and in-person."
        />
        
        {eventsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Events 
            eventData={events?.items} 
            categories={categories}
            totalEvents={events?.total}
            currentPage={events?.currentPage}
            totalPages={events?.totalPages}
          />
        )}
      </Shell>
    </>
  );
};

export default EventsPage;
