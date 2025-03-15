
import React from 'react';
import BadgesSection from '@/components/gamification/BadgesSection';
import LeaderboardSection from '@/components/gamification/LeaderboardSection';
import ChallengesSection from '@/components/gamification/ChallengesSection';

interface RewardsSectionProps {
  type: 'available' | 'earned' | 'leaderboard' | 'challenges';
}

const RewardsSection: React.FC<RewardsSectionProps> = ({ type }) => {
  if (type === 'available' || type === 'earned') {
    return <BadgesSection type={type} />;
  }
  
  if (type === 'leaderboard') {
    return <LeaderboardSection />;
  }

  if (type === 'challenges') {
    return <ChallengesSection type={type} />;
  }
  
  return null;
};

export default RewardsSection;
