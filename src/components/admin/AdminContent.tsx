
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/api/admin';
import { AdminContentState, PaginatedResponse, AdminPost } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';

export const AdminContent = () => {
  const [state, setState] = useState<AdminContentState>({
    page: 1,
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin', 'posts', state],
    queryFn: () => adminService.getAdminPosts(),
  });

  const handleStatusChange = async (postId: string, status: string) => {
    // await adminService.updatePostStatus(postId, status);
  };

  const handleDelete = async (postId: string) => {
    // await adminService.deletePost(postId);
  };

  if (postsLoading) {
    return <div>Loading...</div>;
  }

  const paginatedPosts = postsData ? {
    items: postsData,
    currentPage: 1,
    totalPages: 1,
    total: postsData.length
  } : { items: [], currentPage: 1, totalPages: 1, total: 0 };

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
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
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
              <TableCell>
                <Button onClick={() => handleStatusChange(post.id, 'active')}>Approve</Button>
                <Button onClick={() => handleStatusChange(post.id, 'rejected')}>Reject</Button>
                <Button onClick={() => handleDelete(post.id)}>Delete</Button>
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
