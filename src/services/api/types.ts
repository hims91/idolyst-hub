
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface AdminStats {
  users: number;
  posts: number;
  comments: number;
  events: number;
  recentUsers?: any[];
  recentPosts?: any[];
  activityGraph?: any[];
}
