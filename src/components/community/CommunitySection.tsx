import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Users, MessageSquare, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';

const CommunitySection = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discussions');
  
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Community</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="discussions" value={activeTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="discussions" onClick={() => handleTabChange('discussions')}>
                Discussions
              </TabsTrigger>
              <TabsTrigger value="members" onClick={() => handleTabChange('members')}>
                Members
              </TabsTrigger>
              <TabsTrigger value="events" onClick={() => handleTabChange('events')}>
                Events
              </TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8 rounded-full bg-muted/50"
              />
            </div>
          </div>
          
          <TabsContent value="discussions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Recent Discussions</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Topic
              </Button>
            </div>
            
            <ScrollArea className="h-[300px]">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="py-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://avatar.vercel.sh/${item}${item}`} />
                      <AvatarFallback>U{item}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Discussion topic {item}</h4>
                        <span className="text-xs text-muted-foreground">2h ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {item * 3} replies
                        </span>
                        <span>•</span>
                        <span>Started by User{item}</span>
                      </div>
                    </div>
                  </div>
                  {item < 5 && <Separator className="mt-3" />}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Community Members</h3>
              <Button size="sm" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://avatar.vercel.sh/member${item}`} />
                      <AvatarFallback>M{item}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Member Name {item}</h4>
                        <Button size="sm" variant="ghost" className="h-8 px-2">
                          Follow
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">Founder</Badge>
                        <span>•</span>
                        <span>Joined 2 months ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Upcoming Events</h3>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>
            
            <ScrollArea className="h-[300px]">
              {[1, 2, 3].map((item) => (
                <div key={item} className="py-3">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 w-16 h-16">
                      <span className="font-bold text-primary">JUN</span>
                      <span className="text-xl font-bold">{item + 15}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">Startup Networking Event {item}</h4>
                      <p className="text-sm text-muted-foreground">
                        Connect with fellow entrepreneurs and investors in this monthly meetup.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Virtual</span>
                        <span>•</span>
                        <span>7:00 PM - 9:00 PM</span>
                        <span>•</span>
                        <span>{item * 10 + 20} attending</span>
                      </div>
                    </div>
                  </div>
                  {item < 3 && <Separator className="mt-3" />}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommunitySection;
