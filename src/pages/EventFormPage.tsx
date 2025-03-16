
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Shell } from '@/components/ui/shell';
import { PageTitle } from '@/components/ui/page-title';
import { Spinner } from '@/components/ui/spinner';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as eventService from '@/services/eventService';
import EventForm from '@/components/EventForm';

const EventFormPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const isEditing = !!eventId;

  // If editing, fetch existing event data
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEvent(eventId!),
    enabled: isEditing,
  });

  if (!auth.user) {
    return (
      <Shell>
        <Helmet>
          <title>{isEditing ? 'Edit Event' : 'Create Event'} | Community Platform</title>
        </Helmet>
        <PageTitle 
          heading={isEditing ? 'Edit Event' : 'Create Event'} 
          text={isEditing ? 'Update your event details.' : 'Share your event with the community.'}
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to {isEditing ? 'edit' : 'create'} an event.
          </AlertDescription>
        </Alert>
      </Shell>
    );
  }

  if (isEditing && isLoading) {
    return (
      <Shell>
        <Helmet>
          <title>Edit Event | Community Platform</title>
        </Helmet>
        <PageTitle heading="Edit Event" text="Update your event details." />
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      </Shell>
    );
  }

  if (isEditing && error) {
    return (
      <Shell>
        <Helmet>
          <title>Edit Event | Community Platform</title>
        </Helmet>
        <PageTitle heading="Edit Event" text="Update your event details." />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load event details. The event might not exist or you may not have permission to edit it.
          </AlertDescription>
        </Alert>
      </Shell>
    );
  }

  if (isEditing && event && event.organizer.id !== auth.user.id) {
    return (
      <Shell>
        <Helmet>
          <title>Edit Event | Community Platform</title>
        </Helmet>
        <PageTitle heading="Edit Event" text="Update your event details." />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to edit this event. Only the event organizer can make changes.
          </AlertDescription>
        </Alert>
      </Shell>
    );
  }

  return (
    <Shell>
      <Helmet>
        <title>{isEditing ? 'Edit Event' : 'Create Event'} | Community Platform</title>
      </Helmet>
      <PageTitle 
        heading={isEditing ? 'Edit Event' : 'Create Event'} 
        text={isEditing ? 'Update your event details.' : 'Share your event with the community.'}
      />
      <EventForm eventId={eventId} existingEvent={event} />
    </Shell>
  );
};

export default EventFormPage;
