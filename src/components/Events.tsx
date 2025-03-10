
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, Calendar, MapPin, Tag, Clock, 
  Video, Users, ArrowRight, CheckSquare, Globe
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

interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  category: string;
  tags: string[];
  organizerName: string;
  price: string | null;
  imageSrc?: string;
  attendees: number;
  featured?: boolean;
}

// Mock events data
const MOCK_EVENTS: EventData[] = [
  {
    id: 'event-1',
    title: 'Silicon Valley Startup Summit 2023',
    description: 'Join the largest gathering of entrepreneurs, investors, and industry leaders in Silicon Valley. Network with fellow founders, pitch to VCs, and learn from expert panels on emerging technologies and market trends.',
    startDate: '2023-10-15T09:00:00',
    endDate: '2023-10-17T18:00:00',
    location: 'San Francisco Convention Center, CA',
    type: 'in-person',
    category: 'Conference',
    tags: ['Networking', 'Fundraising', 'Tech Trends'],
    organizerName: 'Silicon Valley Startup Association',
    price: '$299',
    attendees: 1200,
    featured: true,
  },
  {
    id: 'event-2',
    title: 'Fintech Revolution: Digital Banking Webinar',
    description: 'Explore the latest innovations in digital banking and financial technology with industry experts. Learn about emerging trends, regulatory challenges, and how startups are disrupting traditional banking models.',
    startDate: '2023-09-28T14:00:00',
    endDate: '2023-09-28T16:00:00',
    location: 'Zoom',
    type: 'virtual',
    category: 'Webinar',
    tags: ['Fintech', 'Digital Banking', 'Regulation'],
    organizerName: 'Future of Finance Foundation',
    price: 'Free',
    attendees: 450,
  },
  {
    id: 'event-3',
    title: 'AI for Startups Workshop Series',
    description: 'A hands-on workshop series teaching founders how to leverage AI in their products and operations. Perfect for technical and non-technical founders alike.',
    startDate: '2023-10-05T10:00:00',
    endDate: '2023-10-05T16:00:00',
    location: 'TechHub Coworking Space, New York & Online',
    type: 'hybrid',
    category: 'Workshop',
    tags: ['AI', 'Machine Learning', 'Product Development'],
    organizerName: 'AI Founders Alliance',
    price: '$149',
    attendees: 80,
  },
  {
    id: 'event-4',
    title: 'Women in Tech Mentorship Meetup',
    description: 'Monthly networking event connecting women entrepreneurs with experienced mentors in the tech industry. Share challenges, get advice, and build lasting professional relationships.',
    startDate: '2023-09-21T18:00:00',
    endDate: '2023-09-21T21:00:00',
    location: 'Innovation Lounge, Austin, TX',
    type: 'in-person',
    category: 'Networking',
    tags: ['Women in Tech', 'Mentorship', 'Diversity'],
    organizerName: 'TechWomen Collective',
    price: '$25',
    attendees: 60,
  },
  {
    id: 'event-5',
    title: 'Fundraising Bootcamp for Seed-Stage Startups',
    description: 'Intensive two-day bootcamp for founders preparing to raise seed funding. Learn how to craft your pitch, build financial models, approach investors, and negotiate terms.',
    startDate: '2023-11-04T09:00:00',
    endDate: '2023-11-05T17:00:00',
    location: 'Startup Incubator, Boston, MA',
    type: 'in-person',
    category: 'Workshop',
    tags: ['Fundraising', 'Pitch Training', 'Seed Funding'],
    organizerName: 'Venture Catalyst Group',
    price: '$399',
    attendees: 40,
    featured: true,
  },
  {
    id: 'event-6',
    title: 'Global SaaS Trends Virtual Conference',
    description: 'Discover the latest trends, strategies, and technologies shaping the future of SaaS. Featuring keynotes from industry leaders and breakout sessions on product-led growth, customer acquisition, and retention.',
    startDate: '2023-10-12T08:00:00',
    endDate: '2023-10-13T17:00:00',
    location: 'Online',
    type: 'virtual',
    category: 'Conference',
    tags: ['SaaS', 'Product Strategy', 'Growth'],
    organizerName: 'SaaS Founders Hub',
    price: '$79',
    attendees: 3000,
  },
];

const categories = [
  { id: 'all', name: 'All Events' },
  { id: 'upcoming', name: 'Upcoming' },
  { id: 'virtual', name: 'Virtual' },
  { id: 'in-person', name: 'In-Person' },
  { id: 'featured', name: 'Featured' },
];

const EventCard: React.FC<{ event: EventData }> = ({ event }) => {
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
              <span>{event.attendees} attending</span>
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
              <span>{event.location}</span>
            </div>
            <div className="flex items-start">
              {event.type === 'virtual' ? (
                <Video className="h-4 w-4 mr-2 text-primary mt-0.5" />
              ) : event.type === 'hybrid' ? (
                <Globe className="h-4 w-4 mr-2 text-primary mt-0.5" />
              ) : (
                <Users className="h-4 w-4 mr-2 text-primary mt-0.5" />
              )}
              <span className="capitalize">{event.type} Event</span>
            </div>
            <div className="flex items-start">
              <Tag className="h-4 w-4 mr-2 text-primary mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {event.tags.map((tag, index) => (
                  <span key={index} className="bg-secondary/50 px-1.5 py-0.5 rounded-sm text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="font-medium">
            {event.price === 'Free' ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span>{event.price}</span>
            )}
          </div>
          <Button size="sm">
            Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Events: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter events based on active category and search query
  const filterEvents = () => {
    let filteredEvents = [...MOCK_EVENTS];
    
    // Filter by category
    if (activeCategory === 'virtual') {
      filteredEvents = filteredEvents.filter(event => event.type === 'virtual');
    } else if (activeCategory === 'in-person') {
      filteredEvents = filteredEvents.filter(event => event.type === 'in-person');
    } else if (activeCategory === 'featured') {
      filteredEvents = filteredEvents.filter(event => event.featured);
    } else if (activeCategory === 'upcoming') {
      filteredEvents = filteredEvents.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredEvents = filteredEvents.filter(
        event =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query) ||
          event.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filteredEvents;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Community Events</h2>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
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
      
      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center">
              {category.id === 'all' && <Calendar className="h-4 w-4 mr-2" />}
              {category.id === 'upcoming' && <Clock className="h-4 w-4 mr-2" />}
              {category.id === 'virtual' && <Video className="h-4 w-4 mr-2" />}
              {category.id === 'in-person' && <Users className="h-4 w-4 mr-2" />}
              {category.id === 'featured' && <CheckSquare className="h-4 w-4 mr-2" />}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterEvents().map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default Events;
