
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Comment } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, ArrowDown, Reply, MoreHorizontal, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from './ui/UserAvatar';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
}

const formSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment is too long')
});

type FormData = z.infer<typeof formSchema>;

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments, onAddComment }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: ''
    }
  });
  
  const handleSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to comment',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAddComment(data.content);
      form.reset();
      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to add comment',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReply = async (data: FormData, parentId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to reply',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAddComment(data.content, parentId);
      setReplyingTo(null);
      form.reset();
      toast({
        title: 'Reply added',
        description: 'Your reply has been added successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to add reply',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Component to render a single comment
  const CommentItem = ({ comment, depth = 0, isLast = false }: { comment: Comment, depth?: number, isLast?: boolean }) => {
    const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
    const [votes, setVotes] = useState({ up: comment.upvotes, down: comment.downvotes });
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(true);
    
    const replyForm = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        content: ''
      }
    });
    
    const handleVote = (type: 'up' | 'down') => {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to vote',
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
    
    const toggleReply = () => {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to reply',
          variant: 'destructive',
        });
        return;
      }
      
      setIsReplying(!isReplying);
      if (isReplying) {
        replyForm.reset();
      }
    };
    
    const onReplySubmit = async (data: FormData) => {
      await handleReply(data, comment.id);
      setIsReplying(false);
      replyForm.reset();
    };
    
    return (
      <div className={cn("flex group", depth > 0 && "ml-6")}>
        {/* Vertical line connecting replies */}
        {depth > 0 && (
          <div className="mr-4 relative">
            <div className={cn(
              "absolute left-2 w-px bg-gray-200 dark:bg-gray-700",
              "top-6 bottom-0",
              isLast ? "h-6" : "h-full"
            )} />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            <UserAvatar name={comment.author.name} src={comment.author.avatar} size="sm" />
            
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center">
                <div className="font-medium text-sm">{comment.author.name}</div>
                <span className="mx-1 text-muted-foreground">•</span>
                <div className="text-xs text-muted-foreground">
                  {comment.timeAgo}
                </div>
              </div>
              
              <div className="text-sm text-foreground">
                {comment.content}
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-1">
                <button 
                  className={cn(
                    "inline-flex items-center hover:text-foreground",
                    voteStatus === 'up' && "text-green-500 dark:text-green-400"
                  )} 
                  onClick={() => handleVote('up')}
                >
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>{votes.up}</span>
                </button>
                
                <button 
                  className={cn(
                    "inline-flex items-center hover:text-foreground",
                    voteStatus === 'down' && "text-red-500 dark:text-red-400"
                  )}
                  onClick={() => handleVote('down')}
                >
                  <ArrowDown className="h-3 w-3 mr-1" />
                  <span>{votes.down}</span>
                </button>
                
                <button 
                  className="inline-flex items-center hover:text-foreground" 
                  onClick={toggleReply}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  <span>Reply</span>
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center hover:text-foreground">
                      <MoreHorizontal className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem>
                      Report
                    </DropdownMenuItem>
                    {user && user.id === comment.author.id && (
                      <>
                        <DropdownMenuItem>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 dark:text-red-400">
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Reply form */}
              <AnimatePresence>
                {isReplying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2"
                  >
                    <Form {...replyForm}>
                      <form onSubmit={replyForm.handleSubmit(onReplySubmit)} className="space-y-2">
                        <FormField
                          control={replyForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder={`Reply to ${comment.author.name}...`}
                                  className="max-h-40 resize-y"
                                  disabled={isSubmitting}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsReplying(false);
                              replyForm.reset();
                            }}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                Posting...
                              </>
                            ) : 'Post Reply'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Nested replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pt-2">
                  {/* Replies toggle button for deep nesting */}
                  {depth > 1 && comment.replies.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs py-0 h-6 my-1"
                      onClick={() => setShowReplies(!showReplies)}
                    >
                      {showReplies ? 'Hide replies' : `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                    </Button>
                  )}
                  
                  {/* Replies list */}
                  <AnimatePresence>
                    {(depth <= 1 || showReplies) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pt-2 space-y-4"
                      >
                        {comment.replies.map((reply, index) => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            depth={depth + 1}
                            isLast={index === comment.replies.length - 1}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Add comment form */}
      <div className="pb-4">
        <h4 className="text-base font-medium mb-3">Add a comment</h4>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts..."
                      className="max-h-40 resize-y"
                      disabled={isSubmitting || !user}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !user}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : 'Post Comment'}
              </Button>
            </div>
          </form>
        </Form>
        
        {!user && (
          <div className="text-center mt-3 text-sm text-muted-foreground">
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              onClick={() => window.location.href = '/login'}
            >
              Sign in
            </Button> to join the conversation
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Comments list */}
      <div className="space-y-6">
        <h4 className="text-base font-medium">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h4>
        
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground italic">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
