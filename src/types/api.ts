
export interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface AdminContentState {
  page: number;
  search: string;
  status: 'all' | 'active' | 'pending' | 'rejected';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface EmailSettingsForm {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  enableEmailNotifications: boolean;
}
