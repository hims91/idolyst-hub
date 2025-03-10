
import React from 'react';
import { motion } from 'framer-motion';
import PostCard, { PostData } from './ui/PostCard';

// Mock data for posts
const MOCK_POSTS: PostData[] = [
  {
    id: '1',
    title: 'Announcing our $10M Series A funding round',
    content: 'We're thrilled to announce that we've secured $10M in Series A funding led by Sequoia Capital, with participation from Y Combinator and angel investors. This funding will help us scale our platform and bring our solution to more customers globally.',
    author: {
      name: 'Sarah Johnson',
      role: 'Founder & CEO at TechFlow',
    },
    category: 'Funding Updates',
    upvotes: 124,
    downvotes: 4,
    commentCount: 28,
    timeAgo: '3h ago',
  },
  {
    id: '2',
    title: 'The future of AI in startup ecosystems',
    content: 'Artificial intelligence is fundamentally changing how startups operate and scale. From automating routine tasks to enabling data-driven decision making, AI tools are becoming essential for competitive advantage. Here's my take on how founders should approach AI integration...',
    author: {
      name: 'David Chen',
      role: 'Tech Analyst',
    },
    category: 'Expert Opinions',
    upvotes: 87,
    downvotes: 12,
    commentCount: 15,
    timeAgo: '6h ago',
  },
  {
    id: '3',
    title: 'Regulatory changes impacting fintech startups in 2023',
    content: 'New regulations coming into effect this quarter will significantly impact how fintech startups operate, particularly around data privacy and open banking. Here's a breakdown of what founders need to know and how to prepare your compliance strategy.',
    author: {
      name: 'Miguel Rodriguez',
      role: 'Fintech Investor',
    },
    category: 'Startup News',
    upvotes: 56,
    downvotes: 3,
    commentCount: 12,
    timeAgo: '12h ago',
  },
];

interface FeedProps {
  category?: string;
}

const Feed: React.FC<FeedProps> = ({ category }) => {
  // Filter posts by category if provided
  const filteredPosts = category
    ? MOCK_POSTS.filter(post => post.category === category)
    : MOCK_POSTS;

  return (
    <div className="space-y-4">
      {filteredPosts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <PostCard post={post} />
        </motion.div>
      ))}
    </div>
  );
};

export default Feed;
