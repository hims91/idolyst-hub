
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/types/api";
import { safeQueryResult } from "@/utils/supabaseHelpers";

const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        user_id,
        post_id,
        parent_id,
        created_at,
        author:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    // Fetch replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      data.map(async (comment) => {
        const { data: replies, error: repliesError } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            user_id,
            post_id,
            parent_id,
            created_at,
            author:user_id (
              id,
              name,
              avatar,
              role
            )
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        if (repliesError) {
          console.error("Error fetching replies:", repliesError);
          return formatComment(comment);
        }

        return {
          ...formatComment(comment),
          replies: replies.map(formatComment)
        };
      })
    );

    return commentsWithReplies;
  } catch (error) {
    console.error("Error in getComments:", error);
    return [];
  }
};

const createComment = async (
  postId: string,
  content: string,
  parentId?: string
): Promise<Comment> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content,
        post_id: postId,
        user_id: user.id,
        parent_id: parentId || null
      })
      .select(`
        id,
        content,
        user_id,
        post_id,
        parent_id,
        created_at,
        author:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return formatComment(data);
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

// Helper function to format comment data
const formatComment = (comment: any): Comment => {
  // Make sure to include a default role if it's missing
  return {
    id: comment.id,
    content: comment.content,
    author: {
      id: comment.author?.id || comment.user_id,
      name: comment.author?.name || 'Unknown User',
      avatar: comment.author?.avatar || '',
      role: comment.author?.role || 'user', // Ensure role is always present
    },
    createdAt: comment.created_at,
    timeAgo: getTimeAgo(comment.created_at),
    upvotes: 0,
    downvotes: 0,
    isUpvoted: false,
    isDownvoted: false,
    replies: comment.replies || []
  };
};

// Simple time ago function
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return 'just now';
};

export const commentService = {
  getComments,
  createComment
};

export default commentService;
