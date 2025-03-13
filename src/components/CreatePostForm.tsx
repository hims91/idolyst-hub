
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const postFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.string().optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface CreatePostFormProps {
  onSuccess?: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      tags: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Image too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (values: PostFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a post',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process tags if provided
      const processedTags = values.tags 
        ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      // In a real app, we would upload the image to a storage service
      // and get back a URL to store with the post
      
      // await apiService.createPost({
      //   ...values,
      //   tags: processedTags,
      //   image: selectedImage,
      // });
      
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Post created',
        description: 'Your post has been published successfully',
      });
      
      // Reset form
      form.reset();
      removeImage();
      setIsExpanded(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Failed to create post',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-lg border p-4 bg-muted/10 text-center mb-6">
        <p className="text-muted-foreground">
          Please sign in to create a post.
        </p>
      </div>
    );
  }

  // Mobile-friendly collapsed view
  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border shadow-sm overflow-hidden mb-6"
      >
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <UserAvatar name={user.name} src={user.avatar} size="sm" />
            <Button 
              variant="ghost" 
              className="text-muted-foreground text-sm h-auto py-2 px-3 justify-start flex-grow text-left font-normal rounded-md hover:bg-muted/50"
              onClick={() => setIsExpanded(true)}
            >
              What's on your mind?
            </Button>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <Button 
              type="button" 
              variant="ghost"
              size="sm" 
              className="text-muted-foreground"
              onClick={() => {
                document.getElementById('image-upload')?.click();
                setIsExpanded(true);
              }}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Image
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={() => setIsExpanded(true)}
            >
              Create Post
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border shadow-sm overflow-hidden mb-6"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <UserAvatar name={user.name} src={user.avatar} size="sm" />
            <div className="font-medium">{user.name}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Title" 
                      className="text-lg font-medium" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="What's on your mind?" 
                      className="min-h-[120px] resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {previewUrl && (
              <div className="relative rounded-md overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-auto max-h-[300px] object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[180px]">
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Startup News">Startup News</SelectItem>
                        <SelectItem value="Expert Opinions">Expert Opinions</SelectItem>
                        <SelectItem value="Funding Updates">Funding Updates</SelectItem>
                        <SelectItem value="Tech Trends">Tech Trends</SelectItem>
                        <SelectItem value="Product Launch">Product Launch</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[180px]">
                    <FormControl>
                      <Input 
                        placeholder="Tags (comma separated)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-muted-foreground"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Add Image
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </Button>

              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : 'Publish'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};

export default CreatePostForm;
