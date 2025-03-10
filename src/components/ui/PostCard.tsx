
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import { Button } from '@/components/ui/button';

export interface PostData {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  category: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timeAgo: string;
}

interface PostCardProps {
  post: PostData;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [votes, setVotes] = useState({ up: post.upvotes, down: post.downvotes });
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);

  const handleVote = (type: 'up' | 'down') => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg border shadow-sm overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <UserAvatar name={post.author.name} src={post.author.avatar} size="md" />
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-sm text-muted-foreground">{post.author.role} • {post.timeAgo}</div>
            </div>
          </div>
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-primary">
              {post.category}
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-4">{post.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "px-2 h-8",
                  voteStatus === 'up' && "text-primary font-medium"
                )}
                onClick={() => handleVote('up')}
              >
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>{votes.up}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "px-2 h-8",
                  voteStatus === 'down' && "text-primary font-medium"
                )}
                onClick={() => handleVote('down')}
              >
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>{votes.down}</span>
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" className="px-2 h-8">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{post.commentCount}</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
