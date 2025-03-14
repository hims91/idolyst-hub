
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, MessageSquare, Share2, MoreHorizontal, Bookmark, BookmarkCheck, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import CommentSection from '@/components/CommentSection';
import { apiService } from '@/services/api';

export interface PostData {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  category: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timeAgo: string;
  createdAt: string;
  tags?: string[];
  imageUrl?: string;
  status?: string;
  comments?: any[];
}

interface PostCardProps {
  post: PostData;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState({ up: post.upvotes, down: post.downvotes });
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const isContentLong = post.content.length > 280;

  const handleVote = (type: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to vote on posts',
        variant: 'destructive',
      });
      return;
    }

    if (voteStatus === type) {
      // Remove vote
      setVotes(prev => ({
        up: type === 'up' ? prev.up - 1 : prev.up,
        down: type === 'down' ? prev.down - 1 : prev.down
      }));
      setVoteStatus(null);
    } else {
      // Change vote
      setVotes(prev => ({
        up: type === 'up' ? prev.up + 1 : voteStatus === 'up' ? prev.up - 1 : prev.up,
        down: type === 'down' ? prev.down + 1 : voteStatus === 'down' ? prev.down - 1 : prev.down
      }));
      setVoteStatus(type);
    }
  };

  const toggleSaved = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save posts',
        variant: 'destructive',
      });
      return;
    }

    setSaved(!saved);
    toast({
      title: saved ? 'Post removed from saved' : 'Post saved',
      description: saved ? 'This post has been removed from your saved items' : 'This post has been added to your saved items',
    });
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({
      title: 'Link copied',
      description: 'Post link has been copied to clipboard',
    });
  };
  
  const handleAddComment = async (content: string, parentId?: string) => {
    try {
      const newComment = await apiService.addComment(post.id, content, parentId);
      
      if (parentId) {
        // Add reply to existing comment
        const updatedComments = comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...comment.replies, newComment]
            };
          }
          return comment;
        });
        setComments(updatedComments);
      } else {
        // Add new top-level comment
        setComments([...comments, newComment]);
        setCommentCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const navigateToPost = (e: React.MouseEvent) => {
    // Don't navigate if the click was on a button or link
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a')
    ) {
      return;
    }
    
    navigate(`/post/${post.id}`);
  };

  const navigateToUserProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/${post.author.id}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg border shadow-sm overflow-hidden cursor-pointer"
      onClick={navigateToPost}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={navigateToUserProfile}
          >
            <UserAvatar name={post.author.name} src={post.author.avatar} size="md" />
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <span>{post.author.role}</span>
                <span className="mx-1">•</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{post.timeAgo}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {post.category}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleSaved(); }}>
                  {saved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                  {saved ? 'Unsave post' : 'Save post'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShare(); }}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigateToUserProfile(e); }}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Follow author
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>

        {post.imageUrl && (
          <div className="mb-4 rounded-md overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        <div className="text-muted-foreground mb-4">
          {isContentLong && !isExpanded ? (
            <>
              <p>{post.content.substring(0, 280)}...</p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                className="p-0 h-auto text-primary font-normal"
              >
                Show more
              </Button>
            </>
          ) : (
            <p>{post.content}</p>
          )}
          
          {isContentLong && isExpanded && (
            <Button 
              variant="link" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="p-0 h-auto text-primary font-normal mt-1"
            >
              Show less
            </Button>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "px-2 h-8",
                      voteStatus === 'up' && "text-green-600 dark:text-green-500 font-medium"
                    )}
                    onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>{votes.up}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upvote</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "px-2 h-8",
                      voteStatus === 'down' && "text-red-600 dark:text-red-500 font-medium"
                    )}
                    onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
                  >
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span>{votes.down}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Downvote</TooltipContent>
              </Tooltip>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "px-2 h-8",
                    showComments && "text-primary font-medium"
                  )}
                  onClick={(e) => { e.stopPropagation(); toggleComments(); }}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{commentCount}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showComments ? 'Hide comments' : 'Show comments'}
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 w-8 p-0",
                    saved && "text-primary"
                  )}
                  onClick={(e) => { e.stopPropagation(); toggleSaved(); }}
                >
                  {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{saved ? 'Unsave' : 'Save'}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Comments section - collapsed by default */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t bg-muted/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <CommentSection 
                postId={post.id}
                comments={comments}
                onAddComment={handleAddComment}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
