import React, { useState } from 'react';
import { Event, EventFilter } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Users, VideoIcon } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';

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
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [virtualOnly, setVirtualOnly] = useState(false);

  // Filter events based on search query, category, and virtual only
  const filteredEvents = eventData.filter(event => {
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
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (activeTab === 'upcoming' && isAfter(now, endDate)) {
      return false;
    }

    if (activeTab === 'past' && isBefore(now, startDate)) {
      return false;
    }

    return true;
  });

  const applyFilters = () => {
    // Here we would normally call an API with the filter params
    // For this demo, we're just filtering the local data
    
    // In a real implementation, we would call a function like:
    onPageChange(1); // Reset to first page when filters change
  };

  const renderEventCard = (event: Event) => (
    <Card key={event.id}>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 opacity-70" />
          {event.location || 'Virtual Event'}
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 opacity-70" />
          {format(new Date(event.startDate), 'MMM d, yyyy')}
        </div>
        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4 opacity-70" />
          {event.maxAttendees ? `${event.currentAttendees}/${event.maxAttendees} Attendees` : 'Unlimited Attendees'}
        </div>
        {event.isVirtual && (
          <div className="flex items-center">
            <VideoIcon className="mr-2 h-4 w-4 opacity-70" />
            Virtual Event
          </div>
        )}
        <Badge variant="secondary">{event.category}</Badge>
      </CardContent>
      <CardFooter>
        <Button>Register</Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        
        <select
          className="border p-2 rounded-md md:w-1/3"
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <div className="flex items-center md:w-1/3">
          <input
            type="checkbox"
            id="virtualOnly"
            checked={virtualOnly}
            onChange={(e) => setVirtualOnly(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="virtualOnly">Virtual Events Only</label>
          
          <Button onClick={applyFilters} className="ml-auto">
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
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredEvents.map(event => renderEventCard(event))}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-0">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredEvents.map(event => renderEventCard(event))}
          </div>
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredEvents.map(event => renderEventCard(event))}
          </div>
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
