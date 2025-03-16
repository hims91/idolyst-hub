
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { CalendarDays, MapPin, Search, Filter } from 'lucide-react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { EventFilter } from '@/types/api';
import eventService from '@/services/eventService';
import Events from '@/components/Events';

const EventsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<EventFilter>({
    searchQuery: '',
    category: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  const auth = useAuthSession();
  
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', page, filter],
    queryFn: () => eventService.getEvents(page, 6, filter),
  });
  
  // Fetch event categories
  const { isLoading: categoriesLoading } = useQuery({
    queryKey: ['eventCategories'],
    queryFn: eventService.getEventCategories,
    onSuccess: (data) => setCategories(data || []),
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter is already set by the input change, just prevent form submission
  };
  
  const handleCategoryFilter = (category: string) => {
    setFilter(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
    setPage(1);
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Header title="Events" />
        
        <main className="container py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Community Events</h1>
              <p className="text-muted-foreground mt-1">Discover and join events around you</p>
            </div>
            
            {auth?.isValidSession && (
              <Link to="/events/create">
                <Button size="lg">
                  Create Event
                </Button>
              </Link>
            )}
          </div>
          
          {/* Search and filters */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10"
                  value={filter.searchQuery}
                  onChange={e => {
                    setFilter(prev => ({
                      ...prev,
                      searchQuery: e.target.value
                    }));
                    setPage(1);
                  }}
                />
              </div>
              <Button type="submit" variant="secondary">Search</Button>
            </form>
            
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categoriesLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Button
                    variant={!filter.category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryFilter('')}
                  >
                    All
                  </Button>
                  
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={filter.category === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryFilter(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </>
              )}
            </div>
          </div>
          
          {/* Events grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : !eventsData || eventsData.items.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No events found</h3>
                <p className="text-muted-foreground mt-1">
                  {filter.searchQuery || filter.category
                    ? "Try adjusting your search or filters"
                    : "Be the first to create an event!"}
                </p>
                {auth?.isValidSession && (
                  <Link to="/events/create">
                    <Button className="mt-4">Create Event</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <Events
              events={eventsData.items}
              pagination={{
                currentPage: eventsData.currentPage,
                totalPages: eventsData.totalPages,
                onPageChange: setPage
              }}
            />
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default EventsPage;
