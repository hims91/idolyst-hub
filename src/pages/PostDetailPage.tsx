
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  BookmarkIcon,
  HeartIcon,
  MessageSquare,
  Share2Icon,
  ThumbsDown,
  ThumbsUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Reply,
  UserRound,
  Calendar,
  Clock,
  Link2,
  MapPin,
  Tag,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { commentService } from '@/services/commentService';
import { postService } from '@/services/postService';
import { userService } from '@/services/userService'; // Fix import to use named export
import { Post, Comment } from '@/types/api';

interface PostDetailProps {
  post: Post;
}

interface CommentProps {
  comment: Comment;
  replies?: Comment[];
  onReply?: (commentId: string) => void;
}

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const auth = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyToComment, setReplyToComment] = useState<string | null>(null);

  const { data: post, isLoading: postLoading, refetch: refetchPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postService.getPost(postId || ''),
    enabled: !!postId,
  });

  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentService.getComments(postId || ''),
    enabled: !!postId,
  });
  
  // Submit comment handler
  const handleCommentSubmit = async (content: string, parentId?: string) => {
    if (!auth.user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!postId) return;

    setIsSubmittingComment(true);

    try {
      const newComment = await commentService.createComment(postId, content, parentId);
      
      // Update comments state
      if (parentId) {
        // Add reply to parent comment
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === parentId 
              ? { 
                  ...comment, 
                  replies: [...(comment.replies || []), newComment] 
                }
              : comment
          )
        );
      } else {
        // Add top-level comment
        setComments(prevComments => [...prevComments, newComment]);
      }

      setCommentContent("");
      setReplyToComment(null);

      toast({
        title: "Comment Posted",
        description: "Your comment has been posted successfully."
      });
      
      // Refetch comments to update the UI
      refetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyToComment(commentId);
  };

  const handleCancelReply = () => {
    setReplyToComment(null);
    setCommentContent('');
  };

  const renderCommentForm = (parentId: string | null = null) => (
    <div className="mb-4">
      <Textarea
        id="comment"
        placeholder={parentId ? "Write your reply here..." : "Write your comment here..."}
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        className="mt-2 resize-none"
      />
      <div className="flex justify-end mt-2">
        {parentId && (
          <Button variant="ghost" size="sm" onClick={handleCancelReply} className="mr-2">
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => handleCommentSubmit(commentContent, parentId || undefined)}
          disabled={isSubmittingComment}
        >
          {isSubmittingComment ? "Submitting..." : parentId ? "Submit Reply" : "Submit Comment"}
        </Button>
      </div>
    </div>
  );

  const CommentComponent: React.FC<CommentProps> = ({ comment, replies, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

    return (
      <div className="mb-4">
        <div className="flex items-start space-x-3">
          <Avatar>
            <AvatarImage src={comment.author.avatar || "https://github.com/shadcn.png"} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{comment.author.name}</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open dropdown menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground">
              {comment.content}
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <time dateTime={comment.createdAt} className="block">
                {timeAgo}
              </time>
              <span>•</span>
              <button className="hover:underline">Upvote</button>
              <span>•</span>
              <button className="hover:underline">Downvote</button>
              <span>•</span>
              {onReply && (
                <button className="hover:underline" onClick={() => {
                  setIsReplying(true);
                  onReply(comment.id);
                }}>
                  Reply
                </button>
              )}
            </div>
          </div>
        </div>
        {replies && replies.length > 0 && (
          <div className="ml-8">
            {replies.map(reply => (
              <CommentComponent key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (postLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!post) {
    return (
      <Card className="w-full">
        <CardContent>
          Post not found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>
          By {post.author.name} - {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{post.content}</p>
        <Separator />
        <div className="flex space-x-2">
          <Badge variant="secondary"><Tag className="mr-2 h-4 w-4" /> {post.category}</Badge>
          <Badge variant="outline"><Eye className="mr-2 h-4 w-4" /> {post.views || 0} Views</Badge>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Button variant="ghost">
              <ThumbsUp className="mr-2 h-4 w-4" /> Upvote
            </Button>
            <Button variant="ghost">
              <ThumbsDown className="mr-2 h-4 w-4" /> Downvote
            </Button>
            <Button variant="ghost">
              <MessageSquare className="mr-2 h-4 w-4" /> Comment
            </Button>
            <Button variant="ghost">
              <Share2Icon className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
          <Button variant="ghost">
            <BookmarkIcon className="mr-2 h-4 w-4" /> Bookmark
          </Button>
        </div>
        <Separator />
        {renderCommentForm()}
        <ScrollArea className="h-[300px] w-full">
          <div className="space-y-4">
            {commentsData && commentsData.map(comment => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                replies={comment.replies}
                onReply={handleReply}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PostDetailPage;
