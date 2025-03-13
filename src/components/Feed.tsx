
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './ui/PostCard';
import { useFeed } from '@/hooks/useFeed';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  AlertCircle, 
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useInView } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useMediaQuery } from '@/hooks/use-mobile';

interface FeedProps {
  category?: string;
}

const Feed: React.FC<FeedProps> = ({ category }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { 
    posts,
    isLoading, 
    hasNextPage,
    isFetchingNextPage,
    loadMore,
    refreshFeed,
    hasNewPosts,
    error
  } = useFeed({ category, sortOrder });
  
  // Infinite scroll loading reference
  const loadMoreRef = useRef(null);
  const isLoadMoreVisible = useInView(loadMoreRef);
  
  // Trigger load more when the element comes into view
  useEffect(() => {
    if (isLoadMoreVisible && hasNextPage && !isFetchingNextPage) {
      loadMore();
    }
  }, [isLoadMoreVisible, hasNextPage, isFetchingNextPage, loadMore]);

  // Filter posts by selected tags
  const filteredPosts = selectedTags.length > 0
    ? posts.filter(post => post.tags?.some(tag => selectedTags.includes(tag)))
    : posts;

  // Get all unique tags from posts
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
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
      {/* Filter and sort controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              #{tag}
              <span className="ml-1">×</span>
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => setSelectedTags([])}
            >
              Clear all
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className="gap-1">
                <Filter className="h-4 w-4" />
                {!isMobile && <span>Filter</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[200px] overflow-y-auto p-1">
                {allTags.map(tag => (
                  <DropdownMenuItem 
                    key={tag} 
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-4 h-4 border rounded flex items-center justify-center">
                      {selectedTags.includes(tag) && '✓'}
                    </div>
                    #{tag}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className="gap-1">
                {sortOrder === 'newest' ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
                {!isMobile && <span>Sort</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setSortOrder('newest')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <SortDesc className="h-4 w-4" />
                Newest first
                {sortOrder === 'newest' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortOrder('popular')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <SortAsc className="h-4 w-4" />
                Most popular
                {sortOrder === 'popular' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
        {filteredPosts.map((post, index) => (
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
      {filteredPosts.length === 0 && !isLoading && !error && (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No posts found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {selectedTags.length > 0 
              ? 'Try removing some filters or changing your search.' 
              : 'Be the first to share in this category!'}
          </p>
          {selectedTags.length > 0 && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedTags([])}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
