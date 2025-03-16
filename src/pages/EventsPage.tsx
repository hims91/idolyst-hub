
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shell } from '@/components/ui/shell';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';
import Events from '@/components/Events';
import eventService from '@/services/eventService';

const EventsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', currentPage],
    queryFn: () => eventService.getEvents(currentPage, 9),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['eventCategories'],
    queryFn: () => eventService.getEventCategories(),
    initialData: []
  });

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  if (eventsLoading) {
    return (
      <Shell>
        <Helmet>
          <title>Events | Community Platform</title>
        </Helmet>
        <div className="flex justify-between items-center mb-6">
          <PageTitle 
            heading="Events" 
            text="Find and participate in upcoming events, both virtual and in-person."
          />
          {user && (
            <Button onClick={handleCreateEvent}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          )}
        </div>
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Helmet>
        <title>Events | Community Platform</title>
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <PageTitle 
          heading="Events" 
          text="Find and participate in upcoming events, both virtual and in-person."
        />
        {user && (
          <Button onClick={handleCreateEvent}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>
      
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
    </Shell>
  );
};

export default EventsPage;
