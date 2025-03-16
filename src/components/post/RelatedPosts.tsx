
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/ui/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/types/api';

// Mock data - will be replaced with API call
const mockRelatedPosts: Post[] = [
  {
    id: '2',
    title: 'Top 5 growth hacking techniques for early-stage startups',
    content: 'Short excerpt of the content...',
    author: {
      id: 'user2',
      name: 'Mike Johnson',
      role: 'Growth Consultant',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson',
    },
    category: 'Growth Strategies',
    upvotes: 156,
    downvotes: 2,
    commentCount: 23,
    timeAgo: '5d ago',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['growth-hacking', 'early-stage', 'marketing'],
    comments: [],
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false
  },
  {
    id: '3',
    title: 'How we got our first 1,000 customers without paid ads',
    content: 'Short excerpt of the content...',
    author: {
      id: 'user3',
      name: 'Emma Liu',
      role: 'Marketing Lead',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Liu',
    },
    category: 'Growth Strategies',
    upvotes: 210,
    downvotes: 4,
    commentCount: 35,
    timeAgo: '1w ago',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['customer-acquisition', 'organic-growth', 'marketing'],
    comments: [],
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false
  },
  {
    id: '4',
    title: 'Product-led growth: A case study of our journey',
    content: 'Short excerpt of the content...',
    author: {
      id: 'user4',
      name: 'David Smith',
      role: 'Product Manager',
      avatar: 'https://ui-avatars.com/api/?name=David+Smith',
    },
    category: 'Product Strategy',
    upvotes: 178,
    downvotes: 1,
    commentCount: 19,
    timeAgo: '3d ago',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['product-led-growth', 'saas', 'product-strategy'],
    comments: [],
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false
  },
];

interface RelatedPostsProps {
  category: string;
  tags?: string[];
  currentPostId: string;
}

const RelatedPosts = ({ category, tags, currentPostId }: RelatedPostsProps) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      setIsLoading(true);
      
      try {
        // In real implementation, fetch from API based on category and tags
        // For now, use mock data and filter out current post
        setTimeout(() => {
          setPosts(mockRelatedPosts.filter(post => post.id !== currentPostId));
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching related posts:', error);
        setIsLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [category, tags, currentPostId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="h-[220px]">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No related posts found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map(post => (
        <Card 
          key={post.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              {post.content.replace(/<[^>]*>/g, '')}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags?.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {post.tags && post.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 2} more
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserAvatar name={post.author.name} src={post.author.avatar} size="sm" />
                <span className="text-xs text-muted-foreground">{post.author.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RelatedPosts;
