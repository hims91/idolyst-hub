
import { PaginatedResponse, AdminContentState, EmailSettingsForm } from '@/types/api';
import { PostData } from '@/components/ui/PostCard';
import { User } from './types';

export class AdminService {
  async getAdminPosts(params: AdminContentState): Promise<PaginatedResponse<PostData>> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock paginated response
    return {
      items: [], // Add mock data here
      totalPages: 10,
      currentPage: params.page,
      totalItems: 100,
      itemsPerPage: 10
    };
  }

  async getAdminUsers(params: AdminContentState): Promise<PaginatedResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      items: [], // Add mock data here
      totalPages: 10,
      currentPage: params.page,
      totalItems: 100,
      itemsPerPage: 10
    };
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'pending'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async deleteUser(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async updateEmailSettings(settings: EmailSettingsForm): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const adminService = new AdminService();
