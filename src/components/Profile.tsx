
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import UserAvatar from './ui/UserAvatar';
import { PostData } from './ui/PostCard';
import { CampaignData } from './ui/CrowdfundingCard';
import PostCard from './ui/PostCard';
import CrowdfundingCard from './ui/CrowdfundingCard';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { 
  User, Mail, MapPin, Link as LinkIcon, 
  Edit, Users, Calendar, Award, Rocket, 
  BarChart3, MessageSquare, FileText
} from 'lucide-react';

// Mock posts by user
const MOCK_USER_POSTS: PostData[] = [
  {
    id: 'post-1',
    title: 'Five lessons I learned raising our Series A',
    content: "After three months of pitching to VCs, we've successfully closed our Series A round. Here are the five most important lessons I learned along the way that might help other founders on the same journey...",
    author: {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
    },
    category: 'Founder Advice',
    upvotes: 89,
    downvotes: 2,
    commentCount: 14,
    timeAgo: '2d ago',
  },
  {
    id: 'post-2',
    title: 'Product-market fit: How we found ours in an unexpected place',
    content: "We started building for enterprise customers, but discovered our product actually solved a bigger pain point for mid-market companies. Here's how we identified the shift and quickly pivoted our go-to-market strategy...",
    author: {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
    },
    category: 'Product Development',
    upvotes: 124,
    downvotes: 5,
    commentCount: 21,
    timeAgo: '1w ago',
  },
];

// Mock campaigns by user
const MOCK_USER_CAMPAIGNS: CampaignData[] = [
  {
    id: 'campaign-1',
    title: 'TechNova Solutions: AI-powered growth platform for startups',
    shortDescription: 'Smart growth platform for startups using AI',
    description: "TechNova is building an all-in-one growth platform for early stage startups. Using AI algorithms, we analyze market data and user behavior to provide actionable growth strategies tailored to each startup's unique position.",
    founders: [
      {
        name: 'Alex Johnson',
        role: 'Founder & CEO',
      }
    ],
    category: 'SaaS',
    tags: ['AI', 'Analytics', 'Growth', 'Startup Tools'],
    raisedAmount: 580000,
    goalAmount: 750000,
    investorCount: 94,
    daysLeft: 15,
    timeline: [
      { name: 'Week 1', value: 150000 },
      { name: 'Week 2', value: 280000 },
      { name: 'Week 3', value: 390000 },
      { name: 'Week 4', value: 490000 },
      { name: 'Week 5', value: 580000 },
    ],
    featured: true,
  },
];

const Profile: React.FC = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile', 'user-1'],
    queryFn: () => apiService.getUserProfile('user-1'),
  });
  
  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };
  
  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center animate-pulse">
              <div className="h-24 w-24 rounded-full bg-gray-200 mb-4 md:mb-0 md:mr-6"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <UserAvatar name={user.name} src={user.avatar} size="lg" className="h-24 w-24 mb-4 md:mb-0 md:mr-6" />
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">@{user.name.toLowerCase().replace(' ', '')} • {user.role} at {user.company}</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Button variant="outline" size="sm" onClick={toggleFollow}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button size="sm" variant="default">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
              
              <p className="mb-4">{user.bio}</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center text-sm text-muted-foreground space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-primary" />
                  <span>{user.role}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-1 text-primary" />
                  <a href={`https://${user.website}`} className="hover:text-primary">{user.website}</a>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-primary" />
                  <a href={`mailto:${user.email}`} className="hover:text-primary">{user.email}</a>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {user.badges.map(badge => {
                  const IconComponent = 
                    badge.name === 'Top Contributor' ? Award :
                    badge.name === 'Verified Founder' ? User :
                    badge.name === 'Angel Investor' ? Rocket : Award;
                  
                  return (
                    <div key={badge.id} className="flex items-center bg-secondary px-2 py-1 rounded-full text-xs">
                      <IconComponent className="h-3 w-3 mr-1 text-primary" />
                      {badge.name}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <div key={index} className="bg-secondary/50 px-2 py-1 rounded-full text-xs">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="font-semibold">{user.followers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{user.following.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{user.posts.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{user.startups.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Startups</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{user.investments.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Investments</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="posts" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center">
            <Rocket className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Network
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          {MOCK_USER_POSTS.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-4">
          {MOCK_USER_CAMPAIGNS.map(campaign => (
            <CrowdfundingCard key={campaign.id} campaign={campaign} />
          ))}
        </TabsContent>
        
        <TabsContent value="connections" className="p-4 bg-card rounded-lg border">
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Connections coming soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We're currently building the network features. Check back soon to see {user.name}'s professional connections.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="p-4 bg-card rounded-lg border">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Analytics coming soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Profile analytics will be available in the next release. This feature will show engagement metrics, content performance, and more.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
