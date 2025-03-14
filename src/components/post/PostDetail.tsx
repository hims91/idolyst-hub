
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, BookmarkCheck, Eye, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PostDetail as PostDetailType } from '@/types/api';
import { format } from 'date-fns';

interface PostDetailProps {
  post: PostDetailType;
  onVote: (type: 'up' | 'down') => void;
  onSave: () => void;
  onShare: () => void;
}

const PostDetail = ({ post, onVote, onSave, onShare }: PostDetailProps) => {
  return (
    <article className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <header className="p-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">{post.title}</h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <UserAvatar name={post.author.name} src={post.author.avatar} size="md" />
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <span>{post.author.role}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              <span>{post.views.toLocaleString()} views</span>
            </div>
            <Badge variant="secondary" className="ml-1">
              {post.category}
            </Badge>
          </div>
        </div>
      </header>
      
      {post.imageUrl && (
        <div className="px-6">
          <div className="w-full h-[300px] md:h-[400px] rounded-md overflow-hidden mb-6">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      
      <div className="px-6 py-4">
        <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <footer className="px-6 py-4 border-t flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "px-2 h-8",
                    post.isVoted === 'up' && "text-green-600 dark:text-green-500 font-medium"
                  )}
                  onClick={() => onVote('up')}
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>{post.upvotes}</span>
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
                    post.isVoted === 'down' && "text-red-600 dark:text-red-500 font-medium"
                  )}
                  onClick={() => onVote('down')}
                >
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span>{post.downvotes}</span>
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
                className="px-2 h-8"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{post.commentCount}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Comments</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
                <span className="sm:hidden">{post.shares}</span>
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
                  "h-8 px-3",
                  post.isSaved && "text-primary"
                )}
                onClick={onSave}
              >
                {post.isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{post.isSaved ? 'Unsave' : 'Save'}</TooltipContent>
          </Tooltip>
        </div>
      </footer>
    </article>
  );
};

export default PostDetail;
