
import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Users, TrendingUp, Share2, MoreHorizontal, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import UserAvatar from './UserAvatar';
import { Badge } from '@/components/ui/badge';

export interface CampaignData {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  founders: {
    name: string;
    avatar?: string;
    role: string;
  }[];
  category: string;
  tags: string[];
  raisedAmount: number;
  goalAmount: number;
  investorCount: number;
  daysLeft: number;
  timeline: { name: string; value: number }[];
  featured?: boolean;
  trending?: boolean;
}

interface CrowdfundingCardProps {
  campaign: CampaignData;
  variant?: 'default' | 'compact';
}

const CrowdfundingCard: React.FC<CrowdfundingCardProps> = ({ 
  campaign, 
  variant = 'default' 
}) => {
  const percentRaised = Math.round((campaign.raisedAmount / campaign.goalAmount) * 100);
  const isCompact = variant === 'compact';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg border shadow-sm overflow-hidden"
    >
      <div className={`p-4 ${isCompact ? 'pb-3' : 'pb-4'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <UserAvatar name={campaign.founders[0].name} src={campaign.founders[0].avatar} size="md" />
            <div>
              <div className="font-medium">{campaign.founders[0].name}</div>
              <div className="text-sm text-muted-foreground">{campaign.founders[0].role}</div>
            </div>
          </div>
          <div className="flex space-x-2">
            {campaign.featured && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                <Award className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {campaign.trending && (
              <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            )}
            <Badge variant="outline">{campaign.category}</Badge>
          </div>
        </div>
        
        <h3 className={`font-semibold ${isCompact ? 'text-base mb-1' : 'text-lg mb-2'}`}>
          {campaign.title}
        </h3>
        
        <p className={`text-muted-foreground ${isCompact ? 'text-sm mb-3 line-clamp-2' : 'mb-4'}`}>
          {isCompact ? campaign.shortDescription : campaign.description}
        </p>
        
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium">${campaign.raisedAmount.toLocaleString()} raised</span>
              <span className="text-muted-foreground">${campaign.goalAmount.toLocaleString()} goal</span>
            </div>
            <Progress value={percentRaised} className="h-2" />
          </div>
          
          {!isCompact && (
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={campaign.timeline}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Amount']} 
                  labelFormatter={() => ''} 
                  contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e2e8f0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className={`flex ${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground mb-4`}>
          <div className="flex items-center mr-4">
            <Users className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} mr-1 text-primary`} />
            <span>{campaign.investorCount} investors</span>
          </div>
          <div className="flex items-center">
            <Clock className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} mr-1 text-primary`} />
            <span>{campaign.daysLeft} days left</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button className="flex-1 mr-2">
            View Details
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="ml-1">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CrowdfundingCard;
