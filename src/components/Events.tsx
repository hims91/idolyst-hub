
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, Calendar, MapPin, Tag, Clock, 
  Video, Users, ArrowRight, CheckSquare, Globe, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaginatedResponse, Event, EventFilter } from '@/types/api';
import eventService from '@/services/eventService';
import { Pagination } from '@/components/ui/pagination';

interface EventsProps {
  eventData?: Event[];
  categories?: string[];
  totalEvents?: number;
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean;
}

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutate: registerMutation, isPending: isRegistering } = useMutation({
    mutationFn: () => eventService.registerForEvent(event.id),
    onSuccess: () => {
      toast({
        title: "Successfully registered!",
        description: `You have been registered for ${event.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
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
    mutationFn: () => eventService.cancelEventRegistration(event.id),
    onSuccess: () => {
      toast({
        title: "Registration cancelled",
        description: `You have cancelled your registration for ${event.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      toast({
        title: "Cancellation failed",
        description: error instanceof Error ? error.message : "Could not cancel registration",
        variant: "destructive",
      });
    }
  });

  // Format dates nicely
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };
  
  // Check if multi-day event
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();
  
  const dateDisplay = isMultiDay
    ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
    : `${formatDate(event.startDate)} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return;
    }

    if (event.isRegistered) {
      cancelRegistrationMutation();
    } else {
      registerMutation();
    }
  };
  
  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="capitalize">
              {event.category}
            </Badge>
            <div className="flex items-center text-muted-foreground text-sm">
              <Users className="h-3 w-3 mr-1" />
              <span>{event.currentAttendees} attending</span>
            </div>
          </div>
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2 flex-grow">
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <Calendar className="h-4 w-4 mr-2 text-primary mt-0.5" />
              <span>{dateDisplay}</span>
            </div>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 text-primary mt-0.5" />
              <span>{event.location || 'Online'}</span>
            </div>
            <div className="flex items-start">
              {event.isVirtual ? (
                <Video className="h-4 w-4 mr-2 text-primary mt-0.5" />
              ) : (
                <Users className="h-4 w-4 mr-2 text-primary mt-0.5" />
              )}
              <span className="capitalize">{event.isVirtual ? 'Virtual' : 'In-Person'} Event</span>
            </div>
            
            {event.organizer && (
              <div className="flex items-start">
                <Tag className="h-4 w-4 mr-2 text-primary mt-0.5" />
                <span>Organized by: {event.organizer.name}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button 
            variant={event.isRegistered ? "destructive" : "default"}
            size="sm"
            onClick={handleRegisterClick}
            disabled={isRegistering || isCancelling}
          >
            {isRegistering || isCancelling ? (
              <Spinner size="sm" className="mr-2" />
            ) : null}
            {event.isRegistered ? 'Cancel Registration' : 'Register'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Events: React.FC<EventsProps> = ({ 
  eventData = [], 
  categories = [],
  totalEvents = 0,
  currentPage = 1,
  totalPages = 1,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(currentPage);
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [filter, setFilter] = useState<EventFilter>({
    page: 1,
    limit: 9,
    status: 'upcoming'
  });

  const { data, isLoading: eventsLoading, refetch } = useQuery({
    queryKey: ['events', filter],
    queryFn: () => eventService.getEvents(filter),
    initialData: {
      items: eventData,
      total: totalEvents,
      currentPage,
      totalPages
    } as PaginatedResponse<Event>,
    enabled: !isLoading
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    let newFilter: EventFilter = { ...filter };
    
    if (value === 'virtual') {
      newFilter.isVirtual = true;
    } else if (value === 'in-person') {
      newFilter.isVirtual = false;
    } else if (value === 'upcoming') {
      newFilter.status = 'upcoming';
    } else if (value === 'all') {
      // Reset filter
      newFilter = {
        page: 1,
        limit: 9,
        status: 'upcoming'
      };
    }
    
    setFilter(newFilter);
  };
  
  // Handle search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        setFilter(prev => ({ ...prev, query: searchQuery, page: 1 }));
      } else if (filter.query) {
        setFilter(prev => {
          const newFilter = { ...prev };
          delete newFilter.query;
          return { ...newFilter, page: 1 };
        });
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setFilter(prev => ({ ...prev, page: newPage }));
  };
  
  // Handle create event
  const handleCreateEvent = () => {
    if (!user) {
      return navigate('/login');
    }
    navigate('/events/create');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Community Events</h2>
        <Button onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events by name, location, or category"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            All Events
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="virtual" className="flex items-center">
            <Video className="h-4 w-4 mr-2" />
            Virtual
          </TabsTrigger>
          <TabsTrigger value="in-person" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            In-Person
          </TabsTrigger>
        </TabsList>
        
        {eventsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">There are no events matching your criteria.</p>
            <Button onClick={handleCreateEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Create an Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
        
        {data && data.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default Events;
