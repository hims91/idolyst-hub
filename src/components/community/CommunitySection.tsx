
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MessageSquare, ThumbsUp, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Define the community item interface
interface CommunityItem {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  membersCount: number;
  postsCount: number;
  tags: string[];
  isJoined: boolean;
  createdAt: string;
}

// Props interface with section type
interface CommunitySectionProps {
  sectionType: 'featured' | 'recommended' | 'trending' | 'my-communities';
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ sectionType }) => {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would be an API call to fetch communities based on the section type
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        // Mock data - in production, this would be an API call
        setTimeout(() => {
          const mockCommunities: CommunityItem[] = [
            {
              id: '1',
              title: 'AI Startups Network',
              description: 'Connect with founders building AI-powered startups and discuss latest trends.',
              author: {
                id: 'user-1',
                name: 'Alex Chen',
                avatar: 'https://ui-avatars.com/api/?name=Alex+Chen',
              },
              membersCount: 1248,
              postsCount: 342,
              tags: ['ai', 'startups', 'machine-learning'],
              isJoined: sectionType === 'my-communities',
              createdAt: '2023-08-15T10:30:00Z',
            },
            {
              id: '2',
              title: 'Bootstrapped Founders',
              description: 'A community for self-funded entrepreneurs sharing experiences and advice.',
              author: {
                id: 'user-2',
                name: 'Sarah Johnson',
                avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson',
              },
              membersCount: 876,
              postsCount: 215,
              tags: ['bootstrapping', 'indie-hackers', 'funding'],
              isJoined: false,
              createdAt: '2023-09-22T14:15:00Z',
            },
            {
              id: '3',
              title: 'SaaS Growth Strategies',
              description: 'Discuss and share effective strategies for growing SaaS businesses.',
              author: {
                id: 'user-3',
                name: 'Michael Wong',
                avatar: 'https://ui-avatars.com/api/?name=Michael+Wong',
              },
              membersCount: 1563,
              postsCount: 487,
              tags: ['saas', 'growth', 'marketing'],
              isJoined: sectionType === 'trending',
              createdAt: '2023-07-05T09:45:00Z',
            },
            {
              id: '4',
              title: 'Crypto Startups Hub',
              description: 'For founders and investors in the cryptocurrency and blockchain space.',
              author: {
                id: 'user-4',
                name: 'Elena Martinez',
                avatar: 'https://ui-avatars.com/api/?name=Elena+Martinez',
              },
              membersCount: 2134,
              postsCount: 752,
              tags: ['crypto', 'blockchain', 'web3'],
              isJoined: sectionType === 'featured',
              createdAt: '2023-05-18T16:20:00Z',
            },
          ];
          
          setCommunities(mockCommunities);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching communities:', error);
        toast({
          title: "Error loading communities",
          description: "Failed to load community data. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, [sectionType, toast]);

  const handleJoinCommunity = (communityId: string) => {
    // In a real app, this would be an API call to join a community
    setCommunities(prevCommunities => 
      prevCommunities.map(community => 
        community.id === communityId 
          ? { ...community, isJoined: true } 
          : community
      )
    );
    
    toast({
      title: "Community joined",
      description: "You have successfully joined this community",
    });
  };

  const handleLeaveCommunity = (communityId: string) => {
    // In a real app, this would be an API call to leave a community
    setCommunities(prevCommunities => 
      prevCommunities.map(community => 
        community.id === communityId 
          ? { ...community, isJoined: false } 
          : community
      )
    );
    
    toast({
      title: "Community left",
      description: "You have left this community",
    });
  };

  // Display titles based on section type
  const getSectionTitle = () => {
    switch (sectionType) {
      case 'featured':
        return 'Featured Communities';
      case 'recommended':
        return 'Recommended For You';
      case 'trending':
        return 'Trending Communities';
      case 'my-communities':
        return 'My Communities';
      default:
        return 'Communities';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{getSectionTitle()}</h2>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-muted/20 h-28"></CardHeader>
              <CardContent className="mt-4 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="h-9 bg-muted rounded w-20"></div>
                <div className="h-9 bg-muted rounded w-20"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map((community) => (
            <Card key={community.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={community.author.avatar} alt={community.author.name} />
                      <AvatarFallback>{community.author.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{community.title}</CardTitle>
                      <CardDescription>
                        Created by {community.author.name}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {community.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {community.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    <span>{community.membersCount.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    <span>{community.postsCount.toLocaleString()} posts</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                {community.isJoined ? (
                  <Button 
                    variant="outline" 
                    onClick={() => handleLeaveCommunity(community.id)}
                    className="w-full"
                  >
                    Leave
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleJoinCommunity(community.id)}
                    className="w-full"
                  >
                    Join Community
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {communities.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">No communities found</CardTitle>
          <CardDescription>
            {sectionType === 'my-communities' 
              ? "You haven't joined any communities yet." 
              : "No communities available in this category at the moment."}
          </CardDescription>
          {sectionType === 'my-communities' && (
            <Button className="mt-4">Explore Communities</Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default CommunitySection;
