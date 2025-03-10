
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, TrendingUp, Award, BarChart, Users } from 'lucide-react';
import CrowdfundingCard, { CampaignData } from './ui/CrowdfundingCard';

// Mock data for campaigns
const MOCK_CAMPAIGNS: CampaignData[] = [
  {
    id: '1',
    title: 'EcoHarvest: Revolutionizing urban farming with AI and IoT',
    shortDescription: 'Smart city farming solution using AI and IoT technology',
    description: 'EcoHarvest is developing a revolutionary urban farming solution that leverages AI and IoT technology to optimize crop growth in urban environments. Our smart vertical farming units can be installed in office buildings, restaurants, and homes, reducing food miles and providing fresh produce year-round.',
    founders: [
      {
        name: 'Jennifer Kim',
        role: 'CEO & Founder',
      },
      {
        name: 'Michael Chen',
        role: 'CTO',
      }
    ],
    category: 'CleanTech',
    tags: ['Sustainable', 'AgTech', 'IoT', 'AI'],
    raisedAmount: 420000,
    goalAmount: 750000,
    investorCount: 142,
    daysLeft: 21,
    timeline: [
      { name: 'Week 1', value: 125000 },
      { name: 'Week 2', value: 210000 },
      { name: 'Week 3', value: 290000 },
      { name: 'Week 4', value: 380000 },
      { name: 'Week 5', value: 420000 },
    ],
    featured: true,
    trending: true,
  },
  {
    id: '2',
    title: 'MediConnect: Blockchain-based health record platform',
    shortDescription: 'Secure health records platform using blockchain technology',
    description: 'MediConnect is building a secure, transparent platform for health records using blockchain technology. Our solution enables patients to control their medical data while allowing authorized healthcare providers seamless access to critical information. This improves care coordination and reduces medical errors.',
    founders: [
      {
        name: 'Dr. James Wilson',
        role: 'CEO',
      }
    ],
    category: 'HealthTech',
    tags: ['Blockchain', 'HealthTech', 'Data Privacy'],
    raisedAmount: 850000,
    goalAmount: 1000000,
    investorCount: 230,
    daysLeft: 12,
    timeline: [
      { name: 'Week 1', value: 300000 },
      { name: 'Week 2', value: 450000 },
      { name: 'Week 3', value: 600000 },
      { name: 'Week 4', value: 720000 },
      { name: 'Week 5', value: 850000 },
    ],
  },
  {
    id: '3',
    title: 'QuantumSec: Next-gen quantum-resistant encryption',
    shortDescription: 'Future-proof encryption resistant to quantum computing threats',
    description: 'QuantumSec is developing encryption solutions that can withstand attacks from quantum computers. As quantum computing advances, traditional encryption methods will become vulnerable. Our technology ensures that sensitive data remains secure in the post-quantum computing era.',
    founders: [
      {
        name: 'Alex Rahman',
        role: 'Founder & Chief Scientist',
      }
    ],
    category: 'CyberSecurity',
    tags: ['Quantum', 'Encryption', 'Security', 'Enterprise'],
    raisedAmount: 1200000,
    goalAmount: 1500000,
    investorCount: 85,
    daysLeft: 45,
    timeline: [
      { name: 'Week 1', value: 250000 },
      { name: 'Week 2', value: 500000 },
      { name: 'Week 3', value: 750000 },
      { name: 'Week 4', value: 950000 },
      { name: 'Week 5', value: 1200000 },
    ],
    featured: true,
  },
  {
    id: '4',
    title: 'CircleLoop: Subscription-based electric vehicle sharing',
    shortDescription: 'Monthly subscription for unlimited EV access',
    description: 'CircleLoop offers a monthly subscription service that provides unlimited access to a fleet of electric vehicles. Members can pick up and drop off vehicles at convenient locations throughout the city, eliminating the hassles of car ownership while reducing carbon emissions.',
    founders: [
      {
        name: 'Olivia Martinez',
        role: 'Co-Founder & CEO',
      }
    ],
    category: 'Mobility',
    tags: ['Electric Vehicles', 'Subscription', 'Sharing Economy'],
    raisedAmount: 680000,
    goalAmount: 1200000,
    investorCount: 170,
    daysLeft: 18,
    timeline: [
      { name: 'Week 1', value: 180000 },
      { name: 'Week 2', value: 320000 },
      { name: 'Week 3', value: 450000 },
      { name: 'Week 4', value: 590000 },
      { name: 'Week 5', value: 680000 },
    ],
    trending: true,
  },
];

const categories = [
  { id: 'all', name: 'All Campaigns' },
  { id: 'featured', name: 'Featured' },
  { id: 'trending', name: 'Trending' },
  { id: 'new', name: 'Newest' },
  { id: 'ending', name: 'Ending Soon' },
];

const Crowdfunding: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter campaigns based on active category and search query
  const filterCampaigns = () => {
    let filteredCampaigns = [...MOCK_CAMPAIGNS];
    
    // Filter by category
    if (activeCategory === 'featured') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.featured);
    } else if (activeCategory === 'trending') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.trending);
    } else if (activeCategory === 'ending') {
      filteredCampaigns = filteredCampaigns.sort((a, b) => a.daysLeft - b.daysLeft);
    } else if (activeCategory === 'new') {
      filteredCampaigns = [...filteredCampaigns].reverse();
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(
        campaign =>
          campaign.title.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query) ||
          campaign.category.toLowerCase().includes(query) ||
          campaign.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filteredCampaigns;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Fundraising Campaigns</h2>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns by name, category or tags"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center">
              {category.id === 'featured' && <Award className="h-4 w-4 mr-2" />}
              {category.id === 'trending' && <TrendingUp className="h-4 w-4 mr-2" />}
              {category.id === 'new' && <BarChart className="h-4 w-4 mr-2" />}
              {category.id === 'ending' && <Clock className="h-4 w-4 mr-2" />}
              {category.id === 'all' && <Users className="h-4 w-4 mr-2" />}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filterCampaigns().map(campaign => (
            <CrowdfundingCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default Crowdfunding;
