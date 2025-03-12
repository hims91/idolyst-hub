
import { useEffect, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { PostData } from '@/components/ui/PostCard';

interface UseFeedOptions {
  category?: string;
  pageSize?: number;
  enableRealtime?: boolean;
}

export function useFeed({ 
  category, 
  pageSize = 10, 
  enableRealtime = true 
}: UseFeedOptions = {}) {
  const { toast } = useToast();
  const [realtimeUpdates, setRealtimeUpdates] = useState<PostData[]>([]);
  const [hasNewPosts, setHasNewPosts] = useState(false);

  // Fetch posts with infinite query
  const feedQuery = useInfiniteQuery({
    queryKey: ['feed', category],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await apiService.getPosts(category, pageParam, pageSize);
        return response;
      } catch (error) {
        console.error('Failed to fetch feed:', error);
        toast({
          title: 'Error loading feed',
          description: 'Failed to load posts. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  // Function to load more posts
  const loadMore = useCallback(() => {
    if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
      feedQuery.fetchNextPage();
    }
  }, [feedQuery]);

  // Function to refresh feed and incorporate realtime updates
  const refreshFeed = useCallback(() => {
    setHasNewPosts(false);
    setRealtimeUpdates([]);
    feedQuery.refetch();
  }, [feedQuery]);

  // Simulate realtime updates with polling (would use WebSockets in production)
  useEffect(() => {
    if (!enableRealtime) return;
    
    const checkNewPosts = async () => {
      try {
        // In a real app, this would be a WebSocket connection or a
        // specialized endpoint to fetch only new posts since last check
        const latestPosts = await apiService.getLatestPosts(category, 3);
        const currentTopPost = feedQuery.data?.pages[0]?.[0];
        
        if (currentTopPost && latestPosts.length > 0) {
          const newPosts = latestPosts.filter(post => 
            !feedQuery.data?.pages.some(page => 
              page.some(p => p.id === post.id)
            )
          );
          
          if (newPosts.length > 0) {
            setRealtimeUpdates(newPosts);
            setHasNewPosts(true);
          }
        }
      } catch (error) {
        console.error('Failed to check for new posts:', error);
      }
    };
    
    const intervalId = setInterval(checkNewPosts, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [category, feedQuery.data, enableRealtime]);

  // Flatten posts from all pages
  const posts = feedQuery.data?.pages.flat() || [];
  
  // Combine with any realtime updates when showing them
  const allPosts = hasNewPosts 
    ? [...realtimeUpdates, ...posts]
    : posts;

  return {
    posts: allPosts,
    isLoading: feedQuery.isLoading,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    hasNextPage: feedQuery.hasNextPage,
    loadMore,
    refreshFeed,
    hasNewPosts,
    error: feedQuery.error,
  };
}
