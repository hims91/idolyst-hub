
import { supabase } from "@/integrations/supabase/client";
import { Post, PostDetail } from "@/types/api";
import { safeQueryResult } from "@/utils/supabaseHelpers";
import { formatTimeAgo } from "@/lib/utils";

const getPosts = async (page: number = 1, limit: number = 10): Promise<Post[]> => {
  try {
    const startIndex = (page - 1) * limit;
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        image_url,
        created_at,
        updated_at,
        upvotes,
        downvotes,
        user_id,
        author:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    // Get comment counts for each post
    const postsWithCommentCounts = await Promise.all(
      data.map(async (post) => {
        const { count, error: countError } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);
          
        if (countError) {
          console.error("Error fetching comment count:", countError);
          return formatPost(post, 0);
        }
        
        return formatPost(post, count || 0);
      })
    );

    return postsWithCommentCounts;
  } catch (error) {
    console.error("Error in getPosts:", error);
    return [];
  }
};

const getPost = async (postId: string): Promise<PostDetail | null> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        image_url,
        created_at,
        updated_at,
        upvotes,
        downvotes,
        user_id,
        author:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return null;
    }

    // Get comment count
    const { count: commentCount, error: countError } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
      
    if (countError) {
      console.error("Error fetching comment count:", countError);
    }

    // Get related posts (same user or similar content)
    const { data: relatedPosts, error: relatedError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        image_url,
        created_at,
        updated_at,
        upvotes,
        downvotes,
        user_id,
        author:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('user_id', data.user_id)
      .neq('id', postId)
      .limit(3);
      
    if (relatedError) {
      console.error("Error fetching related posts:", relatedError);
    }

    const formattedPost = formatPost(data, commentCount || 0) as PostDetail;
    
    if (relatedPosts) {
      formattedPost.relatedPosts = relatedPosts.map(post => formatPost(post, 0));
    }
    
    return formattedPost;
  } catch (error) {
    console.error("Error in getPost:", error);
    return null;
  }
};

// Helper function to format post data
const formatPost = (post: any, commentCount: number): Post => {
  return {
    id: post.id,
    title: post.title || post.content.substring(0, 50) + '...',
    content: post.content,
    category: post.category || 'General',
    author: {
      id: post.author?.id || post.user_id,
      name: post.author?.name || 'Unknown User',
      avatar: post.author?.avatar || '',
      role: post.author?.role || 'user', // Ensure role is always present
    },
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    timeAgo: formatTimeAgo(post.created_at),
    upvotes: post.upvotes || 0,
    downvotes: post.downvotes || 0,
    commentCount: commentCount,
    comments: [],
    isUpvoted: false,
    isDownvoted: false,
    isBookmarked: false,
    imageUrl: post.image_url,
  };
};

export const postService = {
  getPosts,
  getPost
};

export default postService;
