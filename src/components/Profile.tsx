
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import UserAvatar from '@/components/ui/UserAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import PostCard from './ui/PostCard';

// Mock user posts for profile
const userPosts = [
  {
    id: '1',
    title: 'My first startup journey',
    content: 'This is my experience launching my first startup...',
    author: {
      id: '1',
      name: 'Demo User',
      role: 'Startup Founder',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User',
    },
    category: 'Startup News',
    upvotes: 24,
    downvotes: 2,
    commentCount: 8,
    timeAgo: '2d ago',
    createdAt: new Date().toISOString(),
    tags: ['startup', 'journey', 'experience'],
  },
  {
    id: '2',
    title: 'How I secured my first funding',
    content: 'After months of pitching, I finally secured my first funding round...',
    author: {
      id: '1',
      name: 'Demo User',
      role: 'Startup Founder',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User',
    },
    category: 'Funding Updates',
    upvotes: 42,
    downvotes: 0,
    commentCount: 15,
    timeAgo: '5d ago',
    createdAt: new Date().toISOString(),
    tags: ['funding', 'venture-capital', 'pitching'],
  },
];

// Mock user investments for profile
const userInvestments = [
  {
    id: 'inv-1',
    name: 'TechStart Inc',
    amount: '$25,000',
    date: '2023-02-15',
    type: 'Seed',
    status: 'Active',
  },
  {
    id: 'inv-2',
    name: 'Green Energy Solutions',
    amount: '$50,000',
    date: '2023-05-22',
    type: 'Series A',
    status: 'Active',
  },
];

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'Demo User',
    role: user?.role || 'Startup Founder',
    bio: user?.bio || 'Passionate entrepreneur dedicated to creating innovative solutions for everyday problems.',
    location: user?.location || 'San Francisco, CA',
    website: user?.website || 'https://example.com',
    email: user?.email || 'demo@example.com',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    // In a real app, we would send this to the server
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-500">
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute right-4 top-4"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
        
        <div className="relative px-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12">
            <UserAvatar 
              name={profile.name} 
              src={user?.avatar}
              size="xl"
              className="border-4 border-background relative"
            />
            
            <div className="space-y-1 flex-1 pt-4 md:pt-0">
              {isEditing ? (
                <Input 
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="text-xl h-10 font-semibold"
                />
              ) : (
                <h2 className="text-2xl md:text-3xl font-bold">{profile.name}</h2>
              )}
              
              {isEditing ? (
                <Input 
                  name="role"
                  value={profile.role}
                  onChange={handleChange}
                  className="text-muted-foreground"
                />
              ) : (
                <p className="text-muted-foreground">{profile.role}</p>
              )}
            </div>
            
            {isEditing && (
              <Button onClick={handleSave}>Save Changes</Button>
            )}
          </div>
        </div>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Bio</h3>
                {isEditing ? (
                  <Textarea 
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Location</h3>
                  {isEditing ? (
                    <Input 
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.location}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Website</h3>
                  {isEditing ? (
                    <Input 
                      name="website"
                      value={profile.website}
                      onChange={handleChange}
                    />
                  ) : (
                    <a 
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Stats</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold">42</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">3.8K</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-xs text-muted-foreground">Startups</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">25</div>
                      <div className="text-xs text-muted-foreground">Investments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Contact</CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-2">
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    {isEditing ? (
                      <Input 
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        type="email"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {profile.email}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="flex w-full max-w-xs mx-auto bg-muted">
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          <TabsTrigger value="investments" className="flex-1">Investments</TabsTrigger>
          <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6 space-y-6">
          {userPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>
        
        <TabsContent value="investments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userInvestments.map(investment => (
                  <Card key={investment.id}>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">{investment.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-sm font-medium">Amount</div>
                          <div className="text-base">{investment.amount}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Type</div>
                          <div className="text-base">{investment.type}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Date</div>
                          <div className="text-base">{new Date(investment.date).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Status</div>
                          <div className="text-base">{investment.status}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent activity to show.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
