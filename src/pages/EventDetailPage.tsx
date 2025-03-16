
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Video, 
  Clock,
  Edit,
  Trash,
  User,
  ChevronLeft,
  Globe
} from 'lucide-react';
import eventService from '@/services/eventService';
import { format } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id as string),
    enabled: !!id,
  });
  
  const { data: attendees, isLoading: isAttendeesLoading } = useQuery({
    queryKey: ['event-attendees', id],
    queryFn: () => eventService.getEventAttendees(id as string),
    enabled: !!id,
  });
  
  const { mutate: registerMutation, isPending: isRegistering } = useMutation({
    mutationFn: () => eventService.registerForEvent(id as string),
    onSuccess: () => {
      toast({
        title: "Successfully registered!",
        description: `You have been registered for ${event?.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees', id] });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not register for the event",
        variant: "destructive",
      });
    }
  });

  const { mutate: cancelRegistrationMutation, isPending: isCancelling } = useMutation({
    mutationFn: () => eventService.cancelEventRegistration(id as string),
    onSuccess: () => {
      toast({
        title: "Registration cancelled",
        description: `You have cancelled your registration for ${event?.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['event-attendees', id] });
    },
    onError: (error) => {
      toast({
        title: "Cancellation failed",
        description: error instanceof Error ? error.message : "Could not cancel registration",
        variant: "destructive",
      });
    }
  });
  
  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => eventService.deleteEvent(id as string),
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted",
      });
      navigate('/events');
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Could not delete the event",
        variant: "destructive",
      });
    }
  });
  
  const handleRegisterClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return navigate('/login');
    }

    if (event?.isRegistered) {
      cancelRegistrationMutation();
    } else {
      registerMutation();
    }
  };
  
  const handleEditEvent = () => {
    navigate(`/events/edit/${id}`);
  };
  
  const handleDeleteEvent = () => {
    deleteMutation();
  };
  
  const isOrganizer = user && event?.organizer.id === user.id;
  const isAtCapacity = event?.maxAttendees ? event.currentAttendees >= event.maxAttendees : false;
  
  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="Event Details" />
          <div className="flex-1 container max-w-4xl py-12 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        </div>
      </PageTransition>
    );
  }
  
  if (error || !event) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="Event Not Found" />
          <div className="flex-1 container max-w-4xl py-12">
            <Card>
              <CardHeader>
                <CardTitle>Event Not Found</CardTitle>
                <CardDescription>The event you're looking for doesn't exist or has been removed.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigate('/events')}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title={event.title} />
        
        <main className="flex-1 container max-w-4xl py-6">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => navigate('/events')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2">{event.status}</Badge>
                      <CardTitle className="text-2xl">{event.title}</CardTitle>
                      <CardDescription>
                        Organized by {event.organizer.name}
                      </CardDescription>
                    </div>
                    
                    {isOrganizer && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleEditEvent}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this event? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteEvent}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isDeleting ? <Spinner size="sm" className="mr-2" /> : null}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p className="text-muted-foreground">
                          {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')} 
                          <span className="mx-1">•</span> 
                          {format(new Date(event.startDate), 'h:mm a')} - 
                          {format(new Date(event.endDate), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">
                          {event.isVirtual ? 'Virtual Event' : event.location || 'Location not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {event.isVirtual ? (
                        <Video className="h-5 w-5 mr-3 text-primary" />
                      ) : (
                        <Users className="h-5 w-5 mr-3 text-primary" />
                      )}
                      <div>
                        <p className="font-medium">Event Type</p>
                        <p className="text-muted-foreground">
                          {event.isVirtual ? 'Virtual Event' : 'In-Person Event'}
                        </p>
                      </div>
                    </div>
                    
                    {event.maxAttendees && (
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium">Capacity</p>
                          <p className="text-muted-foreground">
                            {event.currentAttendees} / {event.maxAttendees} attendees
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">Category</p>
                        <p className="text-muted-foreground">
                          {event.category}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">About this event</h3>
                    <p className="whitespace-pre-line">{event.description}</p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={event.isRegistered ? "destructive" : "default"}
                    onClick={handleRegisterClick}
                    disabled={isRegistering || isCancelling || (!event.isRegistered && isAtCapacity)}
                  >
                    {isRegistering || isCancelling ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : null}
                    {event.isRegistered 
                      ? 'Cancel Registration' 
                      : isAtCapacity 
                        ? 'Event at Capacity' 
                        : 'Register for Event'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attendees</CardTitle>
                  <CardDescription>
                    {event.currentAttendees} {event.currentAttendees === 1 ? 'person' : 'people'} attending
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {isAttendeesLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner size="md" />
                    </div>
                  ) : attendees && attendees.length > 0 ? (
                    <div className="space-y-3">
                      {attendees.slice(0, 10).map(attendee => (
                        <div key={attendee.id} className="flex items-center space-x-3">
                          <Avatar>
                            {attendee.avatar ? (
                              <AvatarImage src={attendee.avatar} alt={attendee.name} />
                            ) : (
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{attendee.name}</p>
                            {attendee.role && (
                              <p className="text-sm text-muted-foreground">{attendee.role}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {attendees.length > 10 && (
                        <p className="text-center text-sm text-muted-foreground pt-2">
                          +{attendees.length - 10} more attendees
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No attendees yet. Be the first to register!
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {event.organizer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Organizer</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        {event.organizer.avatar ? (
                          <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                        ) : (
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{event.organizer.name}</p>
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-sm"
                          onClick={() => navigate(`/profile/${event.organizer.id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default EventDetailPage;
