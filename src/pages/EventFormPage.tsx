
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Shell } from '@/components/ui/shell';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { ChevronLeft, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { EventFormData } from '@/types/api';
import eventService from '@/services/eventService';
import { notificationService } from '@/services/notificationService';
import { Helmet } from 'react-helmet';

const formSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters.',
  }),
  description: z.string().min(20, {
    message: 'Description must be at least 20 characters.',
  }),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  startDate: z.string().min(1, {
    message: 'Start date is required.',
  }),
  startTime: z.string().min(1, {
    message: 'Start time is required.',
  }),
  endDate: z.string().min(1, {
    message: 'End date is required.',
  }),
  endTime: z.string().min(1, {
    message: 'End time is required.',
  }),
  category: z.string().min(1, {
    message: 'Category is required.',
  }),
  maxAttendees: z.string().optional(),
  imageUrl: z.string().optional(),
});

const EventFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!id;

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    toast({
      title: 'Authentication required',
      description: 'Please sign in to create or edit events',
      variant: 'destructive',
    });
  }

  const {
    data: event,
    isLoading: eventLoading,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEvent(id || ''),
    enabled: isEditMode,
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['eventCategories'],
    queryFn: () => eventService.getEventCategories(),
    initialData: [],
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      isVirtual: false,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '18:00',
      endDate: format(new Date(), 'yyyy-MM-dd'),
      endTime: '21:00',
      category: 'General',
      maxAttendees: '',
      imageUrl: '',
    },
  });

  // Update form with event data when editing
  React.useEffect(() => {
    if (event && isEditMode) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      form.reset({
        title: event.title,
        description: event.description,
        location: event.location || '',
        isVirtual: event.isVirtual,
        startDate: format(startDate, 'yyyy-MM-dd'),
        startTime: event.startTime || format(startDate, 'HH:mm'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        endTime: event.endTime || format(endDate, 'HH:mm'),
        category: event.category || 'General',
        maxAttendees: event.maxAttendees ? String(event.maxAttendees) : '',
        imageUrl: event.imageUrl || '',
      });
    }
  }, [event, isEditMode, form]);

  const createMutation = useMutation({
    mutationFn: (data: EventFormData) => eventService.createEvent(data),
    onSuccess: (eventId) => {
      toast({
        title: 'Event created',
        description: 'Your event has been successfully created',
      });
      
      // Send notification to followers
      if (user) {
        notificationService.notifyFollowers(
          user.id,
          'New Event Created',
          `${user.name} created a new event: ${form.getValues().title}`,
          'event',
          `/events/${eventId}`
        );
      }
      
      navigate(`/events/${eventId}`);
    },
    onError: (error) => {
      toast({
        title: 'Failed to create event',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EventFormData) => {
      if (!id) throw new Error('Event ID is missing');
      return eventService.updateEvent(id, data);
    },
    onSuccess: () => {
      toast({
        title: 'Event updated',
        description: 'Your event has been successfully updated',
      });
      
      navigate(`/events/${id}`);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update event',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (eventLoading && isEditMode) {
    return (
      <Shell>
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </Shell>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Event' : 'Create Event'} | Events</title>
      </Helmet>

      <Shell>
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <PageTitle
          heading={isEditMode ? 'Edit Event' : 'Create a New Event'}
          text={
            isEditMode
              ? 'Update your event details'
              : 'Fill out the form below to create a new event'
          }
        />

        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Leave empty for unlimited"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: limit the number of attendees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isVirtual"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Virtual Event</FormLabel>
                      <FormDescription>
                        Is this event happening online?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch('isVirtual') && (
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Event location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="URL to event image or poster"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: add an image for your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    loading
                  }
                >
                  {(createMutation.isPending ||
                    updateMutation.isPending ||
                    loading) && <Spinner className="mr-2" size="sm" />}
                  {isEditMode ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Shell>
    </>
  );
};

export default EventFormPage;
