
import React from 'react';
import { motion } from 'framer-motion';
import PostCard, { PostData } from './ui/PostCard';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

interface FeedProps {
  category?: string;
}

const Feed: React.FC<FeedProps> = ({ category }) => {
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['posts', category],
    queryFn: () => apiService.getPosts(category),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading posts. Please try again later.</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
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
