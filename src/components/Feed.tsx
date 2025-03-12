
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './ui/PostCard';
import { useFeed } from '@/hooks/useFeed';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useInView } from 'framer-motion';

interface FeedProps {
  category?: string;
}

const Feed: React.FC<FeedProps> = ({ category }) => {
  const { 
    posts,
    isLoading, 
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    refreshFeed,
    hasNewPosts,
    error
  } = useFeed({ category });
  
  // Infinite scroll loading reference
  const loadMoreRef = useRef(null);
  const isLoadMoreVisible = useInView(loadMoreRef);
  
  // Trigger load more when the element comes into view
  useEffect(() => {
    if (isLoadMoreVisible && hasNextPage && !isFetchingNextPage) {
      loadMore();
    }
  }, [isLoadMoreVisible, hasNextPage, isFetchingNextPage, loadMore]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error loading posts</h3>
        <p className="text-red-600 dark:text-red-300 mt-2 mb-4">We couldn't load the feed. Please try again later.</p>
        <Button onClick={() => refreshFeed()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New posts notification */}
      {hasNewPosts && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10"
        >
          <Button 
            variant="outline" 
            className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
            onClick={refreshFeed}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            New posts available! Click to refresh
          </Button>
        </motion.div>
      )}

      {/* Posts list */}
      <AnimatePresence initial={false}>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
            layout
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading more indicator */}
      {(isFetchingNextPage || hasNextPage) && (
        <div 
          ref={loadMoreRef} 
          className="py-4 flex justify-center"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-primary animate-pulse"></div>
              <div className="h-4 w-4 rounded-full bg-primary animate-pulse delay-150"></div>
              <div className="h-4 w-4 rounded-full bg-primary animate-pulse delay-300"></div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={loadMore}
              disabled={!hasNextPage}
            >
              Load more
            </Button>
          )}
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 && !isLoading && !error && (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No posts yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Be the first to share in this category!
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;
