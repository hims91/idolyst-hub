
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/types/api";
import { safeQueryResult } from "@/utils/supabaseHelpers";
import { formatTimeAgo } from "@/lib/utils";

const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        parent_id,
        user_id,
        author:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      data.map(async (comment) => {
        const { data: replies, error: repliesError } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            parent_id,
            user_id,
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
          return formatComment(comment, []);
        }
        
        return formatComment(comment, replies.map(reply => formatComment(reply, [])));
      })
    );

    return commentsWithReplies;
  } catch (error) {
    console.error("Error in getComments:", error);
    return [];
  }
};

const createComment = async (postId: string, content: string, parentId?: string): Promise<Comment> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        content,
        parent_id: parentId || null,
        user_id: userData.user.id
      })
      .select(`
        id,
        content,
        created_at,
        parent_id,
        user_id,
        author:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      throw error;
    }

    return formatComment(data, []);
  } catch (error) {
    console.error("Error in createComment:", error);
    throw error;
  }
};

// Helper function to format comment data
const formatComment = (comment: any, replies: Comment[]): Comment => {
  return {
    id: comment.id,
    content: comment.content,
    author: {
      id: comment.author?.id || comment.user_id,
      name: comment.author?.name || 'Unknown User',
      avatar: comment.author?.avatar || '',
      role: comment.author?.role || 'user',
    },
    createdAt: comment.created_at,
    timeAgo: formatTimeAgo(comment.created_at),
    upvotes: 0,
    downvotes: 0,
    isUpvoted: false,
    isDownvoted: false,
    replies: replies || [],
  };
};

export const commentService = {
  getComments,
  createComment
};

export default commentService;
