
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
import adminService from '@/services/api/admin';

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
    queryFn: async () => adminService.getAdminContent(state)
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
              <TableCell>{typeof post.author === 'string' ? post.author : post.author.name}</TableCell>
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

export default AdminContent;
