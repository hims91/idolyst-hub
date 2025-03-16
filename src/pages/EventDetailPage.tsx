
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
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
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Helmet } from 'react-helmet-async';
import eventService from '@/services/eventService';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    queryFn: () => eventService.getEventAttendees(eventId),
    enabled: !!eventId && !!event,
  });

  const { mutate: registerMutation, isPending: isRegistering } = useMutation({
    mutationFn: () => eventService.registerForEvent(eventId),
    onSuccess: () => {
      toast({
        title: 'Successfully registered!',
        description: 'You have been registered for this event',
      });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
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
        description: 'You have cancelled your registration',
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
      if (navigator.share) {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied to clipboard',
          description: 'You can now share this event with others',
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      
      // Fallback for browsers that don't support navigator.share
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied to clipboard',
          description: 'You can now share this event with others',
        });
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
        toast({
          variant: "destructive",
          title: "Error sharing",
          description: "Could not share or copy the event link",
        });
      }
    }
  };

  const handleEditClick = () => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation();
    setShowDeleteDialog(false);
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    try {
      const date = parseISO(dateString);
      const formattedDate = format(date, 'PPP');
      return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
    } catch (error) {
      console.error("Date parsing error:", error);
      return dateString;
    }
  };

  const isOrganizer = event?.organizer?.id === user?.id;
  
  // Determine if event is past, current, or upcoming
  const getEventStatus = () => {
    if (!event) return 'upcoming';
    
    const now = new Date();
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    
    if (isAfter(now, endDate)) {
      return 'past';
    } else if (isAfter(now, startDate) && isBefore(now, endDate)) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  };
  
  const eventStatus = event?.status || getEventStatus();
  const isPastEvent = eventStatus === 'past';

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
        <title>{event.title} | Community Platform</title>
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
                        {eventStatus === 'upcoming'
                          ? 'Upcoming'
                          : eventStatus === 'ongoing'
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShareClick}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {event.imageUrl && (
                  <div className="rounded-md overflow-hidden h-[200px] md:h-[300px]">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <span>
                        {formatDateTime(event.startDate, event.startTime)}
                      </span>
                    </div>
                    {event.startDate !== event.endDate && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          To: {formatDateTime(event.endDate, event.endTime)}
                        </span>
                      </div>
                    )}
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
                          {event.organizer?.name
                            ?.split(' ')
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
                {eventStatus !== 'past' && !isOrganizer && (
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

                {isOrganizer && (
                  <>
                    <Button
                      className="w-full sm:w-auto"
                      variant="outline"
                      onClick={handleEditClick}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </Button>
                    
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full sm:w-auto"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Event
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Event</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this event? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Spinner size="sm" className="mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </CardFooter>
            </Card>
            
            {event.maxAttendees && event.currentAttendees >= event.maxAttendees && !event.isRegistered && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Event is full</AlertTitle>
                <AlertDescription>
                  This event has reached its maximum capacity of {event.maxAttendees} attendees.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendees</CardTitle>
                <CardDescription>
                  {event.currentAttendees} {event.currentAttendees === 1 ? 'person' : 'people'} attending
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
            
            {event.isRegistered && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge>Registered</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleRegisterClick}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      'Cancel Registration'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </Shell>
    </>
  );
};

export default EventDetailPage;
