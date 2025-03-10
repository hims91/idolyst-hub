
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, UserPlus, Calendar, Search, Plus } from 'lucide-react';
import { apiService } from '@/services/api';

interface CommunityMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  joined: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  type: 'virtual' | 'in-person' | 'hybrid';
}

interface CommunityDiscussion {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  replies: number;
  views: number;
  lastActivity: string;
  tags: string[];
}

interface CommunitySectionProps {
  type: 'discussions' | 'members' | 'events';
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ type }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['community', type, searchQuery],
    queryFn: () => {
      switch (type) {
        case 'discussions':
          return apiService.getCommunityDiscussions(searchQuery);
        case 'members':
          return apiService.getCommunityMembers(searchQuery);
        case 'events':
          return apiService.getCommunityEvents(searchQuery);
        default:
          return Promise.resolve([]);
      }
    }
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const renderContent = () => {
    switch (type) {
      case 'discussions':
        return renderDiscussions(data as CommunityDiscussion[]);
      case 'members':
        return renderMembers(data as CommunityMember[]);
      case 'events':
        return renderEvents(data as CommunityEvent[]);
      default:
        return null;
    }
  };
  
  const renderDiscussions = (discussions: CommunityDiscussion[]) => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search discussions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>
      
      <div className="space-y-4">
        {discussions?.map(discussion => (
          <Card key={discussion.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{discussion.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {discussion.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={discussion.author.avatar} alt={discussion.author.name} />
                      <AvatarFallback>{discussion.author.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span>{discussion.author.name}</span>
                    <span className="mx-2">•</span>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="mr-3">{discussion.replies}</span>
                    <span className="mr-3">• {discussion.views} views</span>
                    <span>• Updated {discussion.lastActivity}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
  
  const renderMembers = (members: CommunityMember[]) => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members?.map(member => (
          <Card key={member.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <p className="text-xs text-muted-foreground">Joined {member.joined}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
  
  const renderEvents = (events: CommunityEvent[]) => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>
      
      <div className="space-y-4">
        {events?.map(event => (
          <Card key={event.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{event.date}</span>
                    <span className="mx-2">•</span>
                    <span>{event.location}</span>
                    <span className="mx-2">•</span>
                    <span>{event.attendees} attendees</span>
                  </div>
                  <Badge variant={
                    event.type === 'virtual' ? 'outline' : 
                    event.type === 'in-person' ? 'secondary' : 'default'
                  }>
                    {event.type === 'virtual' ? 'Virtual' : 
                     event.type === 'in-person' ? 'In-Person' : 'Hybrid'}
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  RSVP
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
  
  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default CommunitySection;
