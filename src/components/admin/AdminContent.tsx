
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminContentState, PaginatedResponse, AdminPost } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';

export const AdminContent = () => {
  const { toast } = useToast();
  const [state, setState] = useState<AdminContentState>({
    page: 1,
    search: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin', 'posts', state],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          user_id,
          category,
          visibility,
          created_at,
          profiles:user_id (
            id,
            name
          )
        `)
        .order(state.sortBy, { ascending: state.sortOrder === 'asc' });
      
      if (state.search) {
        query = query.ilike('title', `%${state.search}%`);
      }
      
      if (state.status !== 'all') {
        query = query.eq('visibility', state.status);
      }
      
      const { data, error, count } = await query.range(
        (state.page - 1) * 10, 
        state.page * 10 - 1
      );
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      const posts: AdminPost[] = data.map(post => ({
        id: post.id,
        title: post.title,
        author: {
          id: post.profiles.id,
          name: post.profiles.name
        },
        category: post.category || 'Uncategorized',
        status: post.visibility,
        createdAt: post.created_at,
        updatedAt: post.created_at, // Using created_at as a fallback
        upvotes: 0, // These would need to be calculated separately
        downvotes: 0,
        commentsCount: 0
      }));
      
      return {
        items: posts,
        currentPage: state.page,
        totalPages: Math.ceil((count || 10) / 10),
        total: count || 0
      } as PaginatedResponse<AdminPost>;
    }
  });

  const handleStatusChange = async (postId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ visibility: status })
        .eq('id', postId);
      
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Post status changed to ${status}`
      });
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      toast({
        title: "Post deleted",
        description: "The post has been permanently deleted"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  if (postsLoading) {
    return <div>Loading...</div>;
  }

  const paginatedPosts = postsData || { items: [], currentPage: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search posts..."
          value={state.search}
          onChange={(e) => setState(prev => ({ ...prev, search: e.target.value }))}
        />
        <Select
          value={state.status}
          onValueChange={(status) => setState(prev => ({ ...prev, status: status as AdminContentState['status'] }))}
        >
          <option value="all">All</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="draft">Draft</option>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPosts.items.map(post => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.author.name}</TableCell>
              <TableCell>{post.category}</TableCell>
              <TableCell>{post.status}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" onClick={() => handleStatusChange(post.id, 'public')}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {paginatedPosts && (
        <Pagination
          currentPage={paginatedPosts.currentPage}
          totalPages={paginatedPosts.totalPages}
          onPageChange={(page) => setState(prev => ({ ...prev, page }))}
        />
      )}
    </div>
  );
};
