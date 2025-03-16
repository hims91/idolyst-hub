
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import adminService from '@/services/api/admin';
import { AdminContentState, AdminUser } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';

export const AdminUsers = () => {
  const [state, setState] = useState<AdminContentState>({
    page: 1,
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', state],
    queryFn: () => adminService.getAdminUsers(),
  });

  const handleStatusChange = async (userId: string, status: 'active' | 'suspended') => {
    await adminService.updateUserStatus(userId, status);
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  const paginatedUsers = usersData ? {
    items: usersData,
    currentPage: 1,
    totalPages: 1,
    total: usersData.length
  } : { items: [], currentPage: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Manage Users</h2>
        <Button variant="outline">
          Add User
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search users..."
          value={state.search}
          onChange={(e) => setState(prev => ({ ...prev, search: e.target.value }))}
        />
        <Select
          value={state.status}
          onValueChange={(status) => setState(prev => ({ ...prev, status: status as AdminContentState['status'] }))}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.items.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                <Button onClick={() => handleStatusChange(user.id, 'active')}>Activate</Button>
                <Button onClick={() => handleStatusChange(user.id, 'suspended')}>Suspend</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {paginatedUsers && (
        <Pagination
          currentPage={paginatedUsers.currentPage}
          totalPages={paginatedUsers.totalPages}
          onPageChange={(page) => setState(prev => ({ ...prev, page }))}
        />
      )}
    </div>
  );
};

export default AdminUsers;
