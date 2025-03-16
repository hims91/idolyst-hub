
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useRequireAuth } from '@/hooks/use-auth-route';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import eventService from '@/services/eventService';
import { EventFormData } from '@/types/api';

// Form validation schema
const eventFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Start time must be in 24-hour format (HH:MM)",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "End time must be in 24-hour format (HH:MM)",
  }),
  category: z.string().min(1, { message: 'Category is required' }),
  maxAttendees: z.union([
    z.number().int().positive(),
    z.string().transform((val) => {
      const parsed = parseInt(val);
      return isNaN(parsed) ? undefined : parsed;
    }),
    z.undefined()
  ]).optional(),
  imageUrl: z.string().optional(),
}).refine(data => {
  const start = new Date(
    data.startDate.getFullYear(),
    data.startDate.getMonth(),
    data.startDate.getDate(),
    ...data.startTime.split(':').map(Number)
  );
  
  const end = new Date(
    data.endDate.getFullYear(),
    data.endDate.getMonth(),
    data.endDate.getDate(),
    ...data.endTime.split(':').map(Number)
  );
  
  return end > start;
}, {
  message: "End date/time must be after start date/time",
  path: ["endDate"],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const EventFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useRequireAuth();
  
  // Get event data if in edit mode
  const { data: event, isLoading: isEventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id as string),
    enabled: isEditMode,
  });
  
  // Get categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['event-categories'],
    queryFn: eventService.getEventCategories,
  });
  
  // Default form values
  const getDefaultValues = (): Partial<EventFormValues> => {
    if (isEditMode && event) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      return {
        title: event.title,
        description: event.description,
        location: event.location,
        isVirtual: event.isVirtual,
        startDate: startDate,
        startTime: format(startDate, 'HH:mm'),
        endDate: endDate,
        endTime: format(endDate, 'HH:mm'),
        category: event.category,
        maxAttendees: event.maxAttendees || undefined,
        imageUrl: event.imageUrl,
      };
    }
    
    // Default values for new event
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    return {
      title: '',
      description: '',
      location: '',
      isVirtual: false,
      startDate: now,
      startTime: format(now, 'HH:mm'),
      endDate: oneHourLater,
      endTime: format(oneHourLater, 'HH:mm'),
      category: '',
      maxAttendees: undefined,
      imageUrl: '',
    };
  };
  
  // Initialize form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: getDefaultValues(),
  });
  
  // Update form when event data is loaded
  useEffect(() => {
    if (isEditMode && event) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      form.reset({
        title: event.title,
        description: event.description,
        location: event.location,
        isVirtual: event.isVirtual,
        startDate: startDate,
        startTime: format(startDate, 'HH:mm'),
        endDate: endDate,
        endTime: format(endDate, 'HH:mm'),
        category: event.category,
        maxAttendees: event.maxAttendees || undefined,
        imageUrl: event.imageUrl,
      });
    }
  }, [isEditMode, event, form]);
  
  // Create event mutation
  const createMutation = useMutation({
    mutationFn: (data: EventFormData) => eventService.createEvent(data),
    onSuccess: (data) => {
      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
      navigate(`/events/${data?.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating event",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<EventFormData> }) => 
      eventService.updateEvent(id, data),
    onSuccess: () => {
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully",
      });
      navigate(`/events/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Error updating event",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  
  // Form submission handler
  const onSubmit = (values: EventFormValues) => {
    // Combine date and time
    const startDateTime = combineDateAndTime(values.startDate, values.startTime);
    const endDateTime = combineDateAndTime(values.endDate, values.endTime);
    
    const eventData: EventFormData = {
      title: values.title,
      description: values.description,
      location: values.isVirtual ? 'Virtual Event' : (values.location || ''),
      isVirtual: values.isVirtual,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      category: values.category,
      maxAttendees: values.maxAttendees,
      imageUrl: values.imageUrl,
    };
    
    if (isEditMode) {
      updateMutation.mutate({ id: id as string, data: eventData });
    } else {
      createMutation.mutate(eventData);
    }
  };
  
  // Helper to combine date and time
  const combineDateAndTime = (date: Date, timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };
  
  // Loading state
  if (isEditMode && isEventLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Header title={isEditMode ? "Edit Event" : "Create Event"} />
          <div className="flex-1 container max-w-3xl py-12 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        </div>
      </PageTransition>
    );
  }
  
  // Check if user is organizer when editing
  if (isEditMode && event && user?.id !== event.organizer.id) {
    toast({
      title: "Permission denied",
      description: "You don't have permission to edit this event",
      variant: "destructive",
    });
    navigate(`/events/${id}`);
    return null;
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header title={isEditMode ? "Edit Event" : "Create Event"} />
        
        <main className="flex-1 container max-w-3xl py-6">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => navigate(isEditMode ? `/events/${id}` : '/events')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {isEditMode ? 'Back to Event' : 'Back to Events'}
          </Button>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a clear, descriptive title for your event
                    </FormDescription>
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
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about what attendees can expect
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < form.getValues('startDate')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                name="isVirtual"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Virtual Event</FormLabel>
                      <FormDescription>
                        Toggle if this is an online event
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
                        <Input placeholder="Enter event location" {...field} />
                      </FormControl>
                      <FormDescription>
                        Where will the event take place?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Conference, Workshop, Networking" 
                        list="categories"
                        {...field} 
                      />
                    </FormControl>
                    <datalist id="categories">
                      {categories.map((category, index) => (
                        <option key={index} value={category} />
                      ))}
                    </datalist>
                    <FormDescription>
                      Choose an existing category or create a new one
                    </FormDescription>
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
                        min={1}
                        {...field}
                        value={field.value === undefined ? '' : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : parseInt(value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Set a limit for the number of attendees, or leave empty for no limit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter image URL for event banner" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a URL for an image to display on your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting && <Spinner size="sm" className="mr-2" />}
                  {isEditMode ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          </Form>
        </main>
      </div>
    </PageTransition>
  );
};

export default EventFormPage;
