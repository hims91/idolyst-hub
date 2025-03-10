
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { 
  Card, CardContent, CardHeader, CardTitle,
  CardDescription, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Eye, CheckCircle, XCircle, FileText, Rocket } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';

const AdminContent = () => {
  const [contentType, setContentType] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'content', contentType, searchQuery, statusFilter, page],
    queryFn: () => {
      if (contentType === 'posts') {
        return apiService.getAdminPosts({ searchQuery, statusFilter, page, limit: 10 });
      } else {
        return apiService.getAdminCampaigns({ searchQuery, statusFilter, page, limit: 10 });
      }
    },
  });
  
  const handleDelete = async () => {
    if (!selectedItemId) return;
    
    try {
      if (contentType === 'posts') {
        await apiService.deletePost(selectedItemId);
      } else {
        await apiService.deleteCampaign(selectedItemId);
      }
      
      toast({
        title: contentType === 'posts' ? 'Post deleted' : 'Campaign deleted',
        description: `The ${contentType === 'posts' ? 'post' : 'campaign'} has been deleted successfully`,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: `An error occurred while deleting the ${contentType === 'posts' ? 'post' : 'campaign'}`,
        variant: 'destructive',
      });
    }
    
    setSelectedItemId(null);
  };
  
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (contentType === 'posts') {
        await apiService.updatePostStatus(id, !currentStatus);
      } else {
        await apiService.updateCampaignStatus(id, !currentStatus);
      }
      
      toast({
        title: currentStatus ? `${contentType === 'posts' ? 'Post' : 'Campaign'} hidden` : `${contentType === 'posts' ? 'Post' : 'Campaign'} published`,
        description: `The ${contentType === 'posts' ? 'post' : 'campaign'} has been ${currentStatus ? 'hidden' : 'published'} successfully`,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: `An error occurred while updating the ${contentType === 'posts' ? 'post' : 'campaign'} status`,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>
            Manage posts, campaigns, and other content
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs 
            defaultValue="posts" 
            className="mb-6"
            onValueChange={(value) => setContentType(value)}
          >
            <TabsList>
              <TabsTrigger value="posts" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center">
                <Rocket className="h-4 w-4 mr-2" />
                Campaigns
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={`Search ${contentType}...`}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="w-full md:w-auto">
              {contentType === 'posts' ? (
                <FileText className="h-4 w-4 mr-2" />
              ) : (
                <Rocket className="h-4 w-4 mr-2" />
              )}
              Add {contentType === 'posts' ? 'Post' : 'Campaign'}
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Author</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">{contentType === 'posts' ? 'Posted' : 'Created'}</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="flex animate-pulse">
                          <div className="h-4 w-full bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  data?.items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium truncate max-w-xs">{item.title}</div>
                      </td>
                      <td className="py-3 px-4">{item.author.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{item.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${item.published ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>{item.published ? 'Published' : 'Hidden'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{item.date}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/admin/${contentType}/${item.id}`}>
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/admin/${contentType}/${item.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(item.id, item.published)}
                          >
                            {item.published ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedItemId(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {contentType === 'posts' ? 'Post' : 'Campaign'}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this {contentType === 'posts' ? 'post' : 'campaign'}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        
        <CardFooter>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {[...Array(Math.min(5, data?.totalPages || 1))].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {(data?.totalPages || 1) > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => p < (data?.totalPages || 1) ? p + 1 : p)}
                  className={page >= (data?.totalPages || 1) ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminContent;
