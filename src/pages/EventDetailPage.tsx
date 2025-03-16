
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { Shell } from '@/components/ui/shell';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { MapPin, Calendar, Clock, Users, Globe, Share2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import eventService from '@/services/eventService';
import userService from '@/services/userService';
import { EventWithDetails, User } from '@/types/api';
import { Helmet } from 'react-helmet-async';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [attendees, setAttendees] = useState<User[]>([]);
  const [showAllAttendees, setShowAllAttendees] = useState(false);

  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: ['event', id],
    queryFn: () => id ? eventService.getEvent(id) : null,
    enabled: !!id,
  });

  const { data: isRegistered, refetch: refetchRegistration } = useQuery({
    queryKey: ['eventRegistration', id],
    queryFn: () => id ? eventService.isUserRegistered(id) : false,
    enabled: !!id && !!auth.user,
  });

  useEffect(() => {
    const fetchAttendees = async () => {
      if (id) {
        const fetchedAttendees = await eventService.getEventAttendees(id);
        setAttendees(fetchedAttendees);
      }
    };

    fetchAttendees();
  }, [id, isRegistered]);

  const handleRegister = async () => {
    if (!auth.user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to register for this event.",
      });
      navigate('/login');
      return;
    }

    if (!id) return;

    setIsRegistering(true);
    try {
      const success = await eventService.registerForEvent(id);
      if (success) {
        toast({
          title: "Registration Successful",
          description: "You have successfully registered for this event.",
        });
        refetchRegistration();
        refetch();
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Failed to register for this event. Please try again.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Failed to register for this event. Please try again.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!auth.user || !id) return;

    setIsRegistering(true);
    try {
      const success = await eventService.cancelEventRegistration(id);
      if (success) {
        toast({
          title: "Registration Cancelled",
          description: "Your registration has been cancelled.",
        });
        refetchRegistration();
        refetch();
      } else {
        toast({
          variant: "destructive",
          title: "Cancellation Failed",
          description: "Failed to cancel your registration. Please try again.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel your registration. Please try again.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const getEventStatus = (event: EventWithDetails): string => {
    const now = new Date();
    const startDate = parseISO(`${event.startDate}T${event.startTime || '00:00'}`);
    const endDate = parseISO(`${event.endDate}T${event.endTime || '23:59'}`);

    if (isAfter(now, endDate)) {
      return 'completed';
    } else if (isAfter(now, startDate) && isBefore(now, endDate)) {
      return 'in-progress';
    } else {
      return 'upcoming';
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </Shell>
    );
  }

  if (error || !event) {
    return (
      <Shell>
        <PageTitle heading="Event Not Found" text="The event you're looking for doesn't exist or has been removed." />
        <div className="flex justify-center my-8">
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </Shell>
    );
  }

  const eventStatus = getEventStatus(event);
  const displayAttendees = showAllAttendees ? attendees : attendees.slice(0, 5);

  return (
    <Shell>
      <Helmet>
        <title>{event.title} | Community Platform</title>
      </Helmet>

      <div className="flex justify-between items-start mb-6">
        <PageTitle heading={event.title} text={event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '')} />
        <Button variant="outline" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Organized by {event.organizer.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.imageUrl && (
                <div className="rounded-md overflow-hidden mb-4 h-64">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p>
                      {event.startDate === event.endDate
                        ? format(parseISO(event.startDate), 'MMMM d, yyyy')
                        : `${format(parseISO(event.startDate), 'MMM d')} - ${format(parseISO(event.endDate), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p>
                      {event.startTime && event.endTime
                        ? `${event.startTime} - ${event.endTime}`
                        : 'All day'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {event.isVirtual 
                    ? <Globe className="h-5 w-5 mr-2 text-primary" />
                    : <MapPin className="h-5 w-5 mr-2 text-primary" />
                  }
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p>{event.isVirtual ? 'Virtual Event' : event.location || 'TBD'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                    <p>
                      {event.currentAttendees} 
                      {event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="my-6">
                <Badge className="mr-2" variant={event.isVirtual ? "outline" : "secondary"}>
                  {event.isVirtual ? 'Virtual' : 'In-person'}
                </Badge>
                {event.category && (
                  <Badge variant="outline">{event.category}</Badge>
                )}
                <Badge 
                  className="ml-2" 
                  variant={
                    eventStatus === 'completed' ? 'secondary' : 
                    eventStatus === 'in-progress' ? 'default' : 
                    'outline'
                  }
                >
                  {eventStatus === 'completed' ? 'Completed' : 
                   eventStatus === 'in-progress' ? 'In Progress' : 
                   'Upcoming'}
                </Badge>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center w-full justify-between">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>

                {event.maxAttendees && event.currentAttendees >= event.maxAttendees && !isRegistered ? (
                  <Button disabled variant="secondary">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Event Full
                  </Button>
                ) : eventStatus === 'completed' ? (
                  <Button disabled variant="secondary">
                    Event Ended
                  </Button>
                ) : isRegistered ? (
                  <Button 
                    onClick={handleCancelRegistration}
                    variant="destructive"
                    disabled={isRegistering}
                  >
                    {isRegistering ? <Spinner className="mr-2" size="sm" /> : null}
                    Cancel Registration
                  </Button>
                ) : (
                  <Button 
                    onClick={handleRegister} 
                    disabled={isRegistering || !auth.user}
                  >
                    {isRegistering ? <Spinner className="mr-2" size="sm" /> : null}
                    Register
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                  <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{event.organizer.name}</p>
                  <p className="text-sm text-muted-foreground">Organizer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendees ({event.currentAttendees})</CardTitle>
            </CardHeader>
            <CardContent>
              {attendees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No one has registered yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {displayAttendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={attendee.avatar} alt={attendee.name} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm">{attendee.name}</p>
                    </div>
                  ))}

                  {attendees.length > 5 && (
                    <Button 
                      variant="link" 
                      onClick={() => setShowAllAttendees(!showAllAttendees)}
                      className="px-0"
                    >
                      {showAllAttendees ? 'Show Less' : `Show All (${attendees.length})`}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
};

export default EventDetailPage;
