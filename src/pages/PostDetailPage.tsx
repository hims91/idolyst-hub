import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import PostDetail from '@/components/post/PostDetail';
import CommentSection from '@/components/CommentSection';
import RelatedPosts from '@/components/post/RelatedPosts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { PostDetail as PostDetailType, Comment } from '@/types/api';

const mockPostDetail: PostDetailType = {
  id: '1',
  title: 'How I scaled my SaaS startup to 10,000 users in 6 months',
  content: `
    <p>When I first launched my SaaS product, I had no idea if anyone would use it. The first month was slow - only 50 sign-ups. But I kept iterating based on user feedback.</p>
    
    <p>Here's what worked for us:</p>
    
    <ol>
      <li><strong>Content marketing</strong> - We wrote detailed guides solving problems our target users had</li>
      <li><strong>Community engagement</strong> - We became active in relevant communities and provided value</li>
      <li><strong>Strategic partnerships</strong> - We integrated with complementary tools</li>
      <li><strong>Focus on retention</strong> - We made sure existing users were happy before pursuing growth</li>
    </ol>
    
    <p>The growth wasn't overnight. Month 2: 150 users. Month 3: 450 users. Month 4: 1,200 users. Month 5: 4,000 users. Month 6: 10,200 users.</p>
    
    <p>Key lesson: Growth compounds when you focus on delivering real value.</p>
  `,
  author: {
    id: 'user1',
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen',
  },
  category: 'Growth Strategies',
  upvotes: 247,
  downvotes: 5,
  commentCount: 42,
  timeAgo: '2d ago',
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  tags: ['saas', 'growth', 'marketing', 'founders'],
  imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
  views: 1250,
  shares: 89,
  isBookmarked: false,
  isUpvoted: false,
  isDownvoted: false,
  comments: [],
};

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<PostDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        setTimeout(() => {
          const postData = {...mockPostDetail, comments: []};
          setPost(postData);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load post details. Please try again.');
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  const handleVote = (type: 'up' | 'down') => {
    if (!post) return;
    
    setPost(prev => {
      if (!prev) return prev;
      
      if ((type === 'up' && prev.isUpvoted) || (type === 'down' && prev.isDownvoted)) {
        return {
          ...prev,
          isUpvoted: type === 'up' ? false : prev.isUpvoted,
          isDownvoted: type === 'down' ? false : prev.isDownvoted,
          upvotes: type === 'up' ? prev.upvotes - 1 : prev.upvotes,
          downvotes: type === 'down' ? prev.downvotes - 1 : prev.downvotes
        };
      } else {
        const wasUpvoted = prev.isUpvoted;
        const wasDownvoted = prev.isDownvoted;
        
        return {
          ...prev,
          isUpvoted: type === 'up',
          isDownvoted: type === 'down',
          upvotes: type === 'up' 
            ? prev.upvotes + 1 
            : (wasUpvoted ? prev.upvotes - 1 : prev.upvotes),
          downvotes: type === 'down' 
            ? prev.downvotes + 1 
            : (wasDownvoted ? prev.downvotes - 1 : prev.downvotes)
        };
      }
    });
  };

  const handleSave = () => {
    if (!post) return;
    
    setPost(prev => {
      if (!prev) return prev;
      return { ...prev, isBookmarked: !prev.isBookmarked };
    });
    
    toast({
      title: post.isBookmarked ? 'Post removed from saved' : 'Post saved',
      description: post.isBookmarked 
        ? 'This post has been removed from your saved items' 
        : 'This post has been added to your saved items',
    });
  };

  const handleShare = () => {
    if (!post) return;
    
    navigator.clipboard.writeText(window.location.href);
    
    setPost(prev => {
      if (!prev) return prev;
      return { ...prev, shares: prev.shares + 1 };
    });
    
    toast({
      title: 'Link copied',
      description: 'Post link has been copied to clipboard',
    });
  };

  const handleAddComment = async (content: string, parentId?: string): Promise<void> => {
    if (!post) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      content,
      author: {
        id: 'currentUser',
        name: 'Current User',
        role: 'User',
        avatar: 'https://ui-avatars.com/api/?name=Current+User',
      },
      createdAt: new Date().toISOString(),
      timeAgo: 'just now',
      upvotes: 0,
      downvotes: 0,
      replies: [],
    };
    
    setPost(prev => {
      if (!prev) return prev;
      
      const currentComments = prev.comments || [];
      
      if (parentId) {
        const updatedComments = currentComments.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies: [...(comment.replies || []), newComment] } 
            : comment
        );
        
        return {
          ...prev,
          commentCount: prev.commentCount + 1,
          comments: updatedComments
        };
      } else {
        return {
          ...prev,
          commentCount: prev.commentCount + 1,
          comments: [...currentComments, newComment]
        };
      }
    });
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="Post" />
          
          <main className="flex-1 container py-6 px-4 max-w-5xl">
            <div className="mb-6">
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            
            <Skeleton className="h-72 w-full mb-8" />
            
            <div className="space-y-4 mb-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            <Skeleton className="h-36 w-full" />
          </main>
        </div>
      </PageTransition>
    );
  }

  if (error || !post) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title="Post" />
          
          <main className="flex-1 container py-6 px-4 max-w-5xl">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "We couldn't find the post you're looking for."}
              </p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title={post?.title || 'Post'} />
        
        <main className="flex-1 container py-6 px-4 md:px-6 max-w-5xl">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PostDetail 
              post={post} 
              onVote={handleVote}
              onSave={handleSave}
              onShare={handleShare}
            />

            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-semibold mb-6">Comments ({post.commentCount})</h2>
              <CommentSection 
                postId={post.id}
                comments={post.comments || []}
                onAddComment={handleAddComment}
              />
            </div>

            <div className="mt-12 border-t pt-8">
              <h2 className="text-xl font-semibold mb-6">Related Posts</h2>
              <RelatedPosts category={post.category} tags={post.tags} currentPostId={post.id} />
            </div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default PostDetailPage;
