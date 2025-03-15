
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent } from '@/components/ui/card';
import { AdminContent } from '@/components/admin/AdminContent';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminStats } from '@/types/api';

interface DashboardCardProps {
  title: string;
  value: number | string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
}

const DashboardCard = ({ title, value, description, trend = 'neutral', percentage = 0 }: DashboardCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline justify-between">
          <h4 className="text-3xl font-semibold">{value}</h4>
          {percentage !== 0 && (
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
              {percentage > 0 ? '+' : ''}{percentage}%
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const AdminPage = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      // Fetch counts for high-level statistics
      const [
        usersCount,
        postsCount,
        commentsCount
      ] = await Promise.all([
        // Since we don't have access to auth.users directly, estimate based on posts
        supabase.from('posts').select('user_id', { count: 'exact', head: true }).then(res => ({ count: res.count })),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true })
      ]);
      
      // For new users in last 7 days (estimated)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: newUsersCount } = await supabase
        .from('posts')
        .select('user_id', { count: 'exact', head: true, distinct: true })
        .gte('created_at', oneWeekAgo.toISOString());
      
      // For active users (those with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: activeUsersCount } = await supabase
        .from('posts')
        .select('user_id', { count: 'exact', head: true, distinct: true })
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      const stats: AdminStats = {
        users: {
          total: usersCount.count || 0,
          new: newUsersCount || 0,
          active: activeUsersCount || 0
        },
        content: {
          posts: postsCount.count || 0,
          comments: commentsCount.count || 0
        },
        engagement: {
          upvotes: 0, // Would need a separate count query
          comments: commentsCount.count || 0,
          shares: 0
        },
        gamification: {
          pointsAwarded: 0, // Would need a separate count query
          badgesEarned: 0,
          challengesCompleted: 0
        }
      };
      
      return stats;
    }
  });

  const stats = statsData || {
    users: { total: 0, new: 0, active: 0 },
    content: { posts: 0, comments: 0 },
    engagement: { upvotes: 0, comments: 0, shares: 0 },
    gamification: { pointsAwarded: 0, badgesEarned: 0, challengesCompleted: 0 }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title="Admin Dashboard" />
        
        <main className="flex-1 container py-6 px-4 max-w-7xl">
          <Tabs defaultValue="dashboard">
            <TabsList className="mb-6 grid grid-cols-4 max-w-sm">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <DashboardCard 
                  title="Total Users" 
                  value={stats.users.total} 
                  description={`${stats.users.new} new users this week`}
                  trend="up"
                  percentage={5.8}
                />
                <DashboardCard 
                  title="Total Posts" 
                  value={stats.content.posts} 
                  description="User generated content"
                  trend="up"
                  percentage={12.3}
                />
                <DashboardCard 
                  title="Engagement Rate" 
                  value={`${(stats.engagement.comments / Math.max(stats.content.posts, 1) * 100).toFixed(1)}%`} 
                  description="Comments per post"
                  trend={stats.engagement.comments > 0 ? "up" : "neutral"}
                  percentage={3.1}
                />
                <DashboardCard 
                  title="Active Users" 
                  value={stats.users.active} 
                  description="Users active in the last 30 days"
                  trend="down"
                  percentage={-2.3}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                    {statsLoading ? (
                      <p>Loading activity data...</p>
                    ) : (
                      <p>Activity data would be displayed here</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Content Distribution</h3>
                    {statsLoading ? (
                      <p>Loading content data...</p>
                    ) : (
                      <p>Content distribution chart would be displayed here</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="content">
              <AdminContent />
            </TabsContent>
            
            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Admin Settings</h3>
                  <p>Settings options would be displayed here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default AdminPage;
