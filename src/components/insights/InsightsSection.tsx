
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Activity,
  BarChart2, PieChart as PieChartIcon
} from 'lucide-react';

interface InsightsSectionProps {
  type: 'market' | 'user' | 'funding';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const InsightsSection: React.FC<InsightsSectionProps> = ({ type }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['insights', type],
    queryFn: () => {
      switch (type) {
        case 'market':
          return apiService.getMarketInsights();
        case 'user':
          return apiService.getUserActivityInsights();
        case 'funding':
          return apiService.getFundingInsights();
        default:
          return Promise.resolve({});
      }
    }
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const renderContent = () => {
    switch (type) {
      case 'market':
        return renderMarketInsights(data);
      case 'user':
        return renderUserInsights(data);
      case 'funding':
        return renderFundingInsights(data);
      default:
        return null;
    }
  };
  
  const renderMarketInsights = (data: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Startup Trends by Category</CardTitle>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.categoryTrends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="startups" fill="#8884d8" name="# of Startups" />
                  <Bar dataKey="funding" fill="#82ca9d" name="Funding ($M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Investment Growth</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.investmentGrowth}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="amount" fill="#8884d8" stroke="#8884d8" name="Investment Amount ($M)" />
                  <Area type="monotone" dataKey="deals" fill="#82ca9d" stroke="#82ca9d" name="Number of Deals" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.keyMetrics?.map((metric: any, index: number) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {metric.trend === 'up' ? 
                  <TrendingUp className="h-8 w-8 text-green-500 mb-2" /> : 
                  <TrendingDown className="h-8 w-8 text-red-500 mb-2" />
                }
                <div className="text-3xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{metric.label}</div>
                <div className={`text-xs mt-2 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change} ({metric.trend === 'up' ? '+' : ''}{metric.percentage}%)
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
  
  const renderUserInsights = (data: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">User Activity Over Time</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data?.activityOverTime}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="posts" stroke="#8884d8" activeDot={{ r: 8 }} name="Posts" />
                  <Line type="monotone" dataKey="comments" stroke="#82ca9d" name="Comments" />
                  <Line type="monotone" dataKey="logins" stroke="#ffc658" name="Logins" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">User Demographics</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.userDemographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.userDemographics?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.engagementMetrics?.map((metric: any, index: number) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground mt-2">{metric.label}</div>
                <div className={`text-xs mt-2 ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}% from last week
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
  
  const renderFundingInsights = (data: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Funding by Stage</CardTitle>
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.fundingByStage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.fundingByStage?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Monthly Funding Trends</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.monthlyFunding}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" name="Funding Amount ($M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Top Funded Startups</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Startup</th>
                  <th className="text-left py-3 px-4">Industry</th>
                  <th className="text-left py-3 px-4">Stage</th>
                  <th className="text-right py-3 px-4">Raised</th>
                  <th className="text-right py-3 px-4">Valuation</th>
                </tr>
              </thead>
              <tbody>
                {data?.topFundedStartups?.map((startup: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{startup.name}</td>
                    <td className="py-3 px-4">{startup.industry}</td>
                    <td className="py-3 px-4">{startup.stage}</td>
                    <td className="py-3 px-4 text-right">${startup.raised}M</td>
                    <td className="py-3 px-4 text-right">${startup.valuation}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default InsightsSection;
