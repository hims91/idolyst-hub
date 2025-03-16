
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Users, VideoIcon, Clock } from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

export interface EventsProps {
  eventData: Event[];
  categories: string[];
  totalEvents: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Events: React.FC<EventsProps> = ({ 
  eventData, 
  categories, 
  totalEvents, 
  currentPage, 
  totalPages,
  onPageChange 
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [virtualOnly, setVirtualOnly] = useState(false);

  // Filter events based on search query, category, and virtual only
  const filteredEvents = useMemo(() => {
    return eventData.filter(event => {
      // Filter by search query
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !event.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by category
      if (selectedCategory && event.category !== selectedCategory) {
        return false;
      }

      // Filter by virtual only
      if (virtualOnly && !event.isVirtual) {
        return false;
      }

      // Filter by tab (upcoming, past, all)
      const now = new Date();
      const startDate = parseISO(event.startDate);
      const endDate = parseISO(event.endDate);

      if (activeTab === 'upcoming' && isAfter(now, endDate)) {
        return false;
      }

      if (activeTab === 'past' && isBefore(now, startDate)) {
        return false;
      }

      return true;
    });
  }, [eventData, searchQuery, selectedCategory, virtualOnly, activeTab]);

  const applyFilters = () => {
    // Reset to first page when filters change
    onPageChange(1);
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const renderEventCard = (event: Event) => (
    <Card key={event.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2">{event.description}</CardDescription>
          </div>
          {event.isVirtual && (
            <Badge variant="outline" className="ml-2 flex items-center">
              <VideoIcon className="mr-1 h-3 w-3" />
              Virtual
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 pb-3 flex-grow">
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 opacity-70" />
          <span className="text-sm">{formatDate(event.startDate)}</span>
        </div>
        {event.startTime && (
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 opacity-70" />
            <span className="text-sm">{event.startTime}</span>
          </div>
        )}
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 opacity-70" />
          <span className="text-sm">{event.location || 'Virtual Event'}</span>
        </div>
        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4 opacity-70" />
          <span className="text-sm">
            {event.maxAttendees 
              ? `${event.currentAttendees}/${event.maxAttendees} Attendees` 
              : `${event.currentAttendees} Attendees`}
          </span>
        </div>
        <Badge variant="secondary" className="w-fit">{event.category}</Badge>
      </CardContent>
      <CardFooter className="pt-1">
        <Button 
          variant="default" 
          className="w-full" 
          onClick={() => handleEventClick(event.id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        
        <Select 
          value={selectedCategory || ""} 
          onValueChange={(value) => setSelectedCategory(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="virtualOnly" 
              checked={virtualOnly}
              onCheckedChange={(checked) => setVirtualOnly(checked === true)}
            />
            <Label htmlFor="virtualOnly">Virtual Events Only</Label>
          </div>
          
          <Button onClick={applyFilters} size="sm">
            Apply Filters
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value: 'all' | 'upcoming' | 'past') => setActiveTab(value)}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {filteredEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredEvents.map(event => renderEventCard(event))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No events found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-0">
          {filteredEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredEvents.map(event => renderEventCard(event))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No upcoming events found</h3>
              <p className="text-muted-foreground">Check back later for new events</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          {filteredEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredEvents.map(event => renderEventCard(event))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No past events found</h3>
              <p className="text-muted-foreground">There are no past events in this category</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default Events;
