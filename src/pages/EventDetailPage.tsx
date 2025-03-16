
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Shell } from '@/components/ui/shell';
import { PageTitle } from '@/components/ui/page-title';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Share2,
  Edit,
  Trash2,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { EventWithDetails } from '@/types/api';
import eventService from '@/services/eventService';
import { notificationService } from '@/services/notificationService';
import { Helmet } from 'react-helmet';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const eventId = id || '';

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEvent(eventId),
    enabled: !!eventId,
  });

  const {
    data: attendees,
    isLoading: attendeesLoading,
  } = useQuery({
    queryKey: ['eventAttendees', eventId],
    queryFn: () => [], // Placeholder for eventService.getEventAttendees(eventId)
    enabled: !!eventId && !!event,
  });

  const { mutate: registerMutation, isPending: isRegistering } = useMutation({
    mutationFn: () => eventService.registerForEvent(eventId),
    onSuccess: () => {
      toast({
        title: 'Successfully registered!',
        description: `You have been registered for this event`,
      });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      
      // Send notification to event organizer
      if (event?.organizer && user) {
        notificationService.createNotification({
          userId: event.organizer.id,
          title: 'New Event Registration',
          message: `${user.name} has registered for your event: ${event.title}`,
          type: 'event',
          linkTo: `/events/${eventId}`,
          senderId: user.id
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Could not register for the event',
        variant: 'destructive',
      });
    },
  });

  const { mutate: cancelRegistrationMutation, isPending: isCancelling } = useMutation({
    mutationFn: () => eventService.cancelEventRegistration(eventId),
    onSuccess: () => {
      toast({
        title: 'Registration cancelled',
        description: `You have cancelled your registration`,
      });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: (error) => {
      toast({
        title: 'Cancellation failed',
        description: error instanceof Error ? error.message : 'Could not cancel registration',
        variant: 'destructive',
      });
    },
  });

  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => eventService.deleteEvent(eventId),
    onSuccess: () => {
      toast({
        title: 'Event deleted',
        description: 'The event has been successfully deleted',
      });
      navigate('/events');
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Could not delete the event',
        variant: 'destructive',
      });
    },
  });

  const handleRegisterClick = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to register for events',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (event?.isRegistered) {
      cancelRegistrationMutation();
    } else {
      registerMutation();
    }
  };

  const handleShareClick = async () => {
    try {
      await navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied to clipboard',
        description: 'You can now share this event with others',
      });
    }
  };

  const handleEditClick = () => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    deleteMutation();
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'PPP p');
  };

  const isOrganizer = event?.organizer.id === user?.id;
  const isPastEvent = event?.status === 'past';

  if (isLoading) {
    return (
      <Shell>
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </Shell>
    );
  }

  if (error || !event) {
    return (
      <Shell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/events')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <>
      <Helmet>
        <title>{event.title} | Events</title>
      </Helmet>

      <Shell>
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/events')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2 space-x-2">
                      <Badge variant={isPastEvent ? 'outline' : 'default'}>
                        {event.status === 'upcoming'
                          ? 'Upcoming'
                          : event.status === 'ongoing'
                          ? 'Happening Now'
                          : 'Past Event'}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {event.category || 'General'}
                      </Badge>
                      {event.isVirtual && (
                        <Badge variant="secondary">
                          <Video className="h-3 w-3 mr-1" />
                          Virtual
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl">
                      {event.title}
                    </CardTitle>
                  </div>
                  {!isPastEvent && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShareClick}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <span>
                        {formatDateTime(event.startDate)}
                        {event.startDate !== event.endDate &&
                          ` - ${formatDateTime(event.endDate)}`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span>{event.location || 'Online'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <span>
                        {event.currentAttendees} attending
                        {event.maxAttendees && ` (Max: ${event.maxAttendees})`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={event.organizer.avatar} />
                        <AvatarFallback>
                          {event.organizer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Organized by</p>
                      <p className="text-sm">{event.organizer.name}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <div className="text-sm whitespace-pre-line">
                    {event.description}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row items-center gap-3">
                {!isPastEvent && !isOrganizer && (
                  <Button
                    className="w-full sm:w-auto"
                    variant={event.isRegistered ? 'destructive' : 'default'}
                    onClick={handleRegisterClick}
                    disabled={
                      isRegistering ||
                      isCancelling ||
                      (!!event.maxAttendees &&
                        event.currentAttendees >= event.maxAttendees &&
                        !event.isRegistered)
                    }
                  >
                    {isRegistering || isCancelling ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : event.isRegistered ? (
                      'Cancel Registration'
                    ) : (
                      'Register'
                    )}
                  </Button>
                )}

                {isOrganizer && !isPastEvent && (
                  <>
                    <Button
                      className="w-full sm:w-auto"
                      variant="outline"
                      onClick={handleEditClick}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </Button>
                    {!showConfirmDelete ? (
                      <Button
                        className="w-full sm:w-auto"
                        variant="destructive"
                        onClick={handleDeleteClick}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Event
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full sm:w-auto"
                          variant="destructive"
                          onClick={confirmDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Spinner size="sm" /> : 'Confirm Delete'}
                        </Button>
                        <Button
                          className="w-full sm:w-auto"
                          variant="outline"
                          onClick={cancelDelete}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendees</CardTitle>
                <CardDescription>
                  {event.currentAttendees} people attending
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attendeesLoading ? (
                  <div className="flex justify-center p-4">
                    <Spinner />
                  </div>
                ) : attendees && attendees.length > 0 ? (
                  <div className="space-y-4">
                    {attendees.slice(0, 5).map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center space-x-3"
                      >
                        <Avatar>
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>
                            {attendee.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {attendee.name}
                          </p>
                        </div>
                      </div>
                    ))}
                    {attendees.length > 5 && (
                      <Button variant="outline" className="w-full" size="sm">
                        View all attendees
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Be the first to register!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Shell>
    </>
  );
};

export default EventDetailPage;
