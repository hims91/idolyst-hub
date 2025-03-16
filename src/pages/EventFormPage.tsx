import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shell } from '@/components/ui/shell';
import { PageTitle } from '@/components/ui/page-title';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import eventService from '@/services/eventService';
import notificationService from '@/services/notificationService';
import { EventFormData } from '@/types/api';

const EventFormPage = () => {
  const { eventId: eventIdParam } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(!!eventIdParam);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    isVirtual: false,
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: '09:00',
    endDate: format(new Date(), "yyyy-MM-dd"),
    endTime: '17:00',
    category: 'General',
    imageUrl: '',
    maxAttendees: '',
  });

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await eventService.getEventCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch event categories:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load event categories. Please try again.",
        });
      }
    };

    fetchCategories();
  }, [toast]);

  useEffect(() => {
    if (isEditing && eventIdParam) {
      const fetchEventData = async () => {
        try {
          const eventData = await eventService.getEvent(eventIdParam);
          setFormData({
            title: eventData.title,
            description: eventData.description,
            location: eventData.location || '',
            isVirtual: eventData.isVirtual,
            startDate: eventData.startDate,
            startTime: eventData.startTime || '09:00',
            endDate: eventData.endDate,
            endTime: eventData.endTime || '17:00',
            category: eventData.category,
            imageUrl: eventData.imageUrl || '',
            maxAttendees: eventData.maxAttendees?.toString() || '',
          });
        } catch (error) {
          console.error("Failed to fetch event data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load event data. Please try again.",
          });
          navigate('/events');
        }
      };

      fetchEventData();
    }
  }, [isEditing, eventIdParam, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isVirtual: checked,
      location: checked ? '' : formData.location,
    });
  };

  const handleDateChange = (date: Date | undefined, field: string) => {
    if (date) {
      setFormData({
        ...formData,
        [field]: format(date, "yyyy-MM-dd"),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert form values where needed
      const eventData: EventFormData = {
        title: formData.title,
        description: formData.description,
        location: formData.isVirtual ? undefined : formData.location,
        isVirtual: formData.isVirtual,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,
        category: formData.category,
        imageUrl: formData.imageUrl,
        // Convert maxAttendees to number or undefined
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees, 10) : undefined
      };

      let eventId: string;

      if (isEditing && eventIdParam) {
        await eventService.updateEvent(eventIdParam, eventData);
        eventId = eventIdParam;
        toast({
          title: "Event Updated",
          description: "Your event has been updated successfully.",
        });
      } else {
        eventId = await eventService.createEvent(eventData);
        
        // Convert maxAttendees to number for notification message
        const maxAttendees = formData.maxAttendees ? parseInt(formData.maxAttendees, 10) : undefined;
        
        toast({
          title: "Event Created",
          description: "Your event has been created successfully.",
        });

        if (auth.user) {
          // Notify followers about the new event
          await notificationService.notifyFollowers(
            auth.user.id,
            "New Event",
            `${auth.user.name} has created a new event: ${formData.title}`,
            "event",
            `/events/${eventId}`
          );
        }
      }

      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save event. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Shell>
      <PageTitle heading={isEditing ? "Edit Event" : "Create Event"} text={isEditing ? "Update your event details." : "Share your event with the community."} />
      <Card>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" defaultValue={formData.category} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="isVirtual">Virtual Event</Label>
              <Switch
                id="isVirtual"
                name="isVirtual"
                checked={formData.isVirtual}
                onCheckedChange={handleSwitchChange}
              />
            </div>
            {!formData.isVirtual && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required={!formData.isVirtual}
                  disabled={formData.isVirtual}
                />
              </div>
            )}
            <div>
              <Label htmlFor="maxAttendees">Max Attendees</Label>
              <Input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(new Date(formData.startDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate ? new Date(formData.startDate) : undefined}
                      onSelect={(date) => handleDateChange(date, "startDate")}
                      disabled={false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="hidden"
                  name="startDate"
                  value={formData.startDate}
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(new Date(formData.endDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate ? new Date(formData.endDate) : undefined}
                      onSelect={(date) => handleDateChange(date, "endDate")}
                      disabled={false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="hidden"
                  name="endDate"
                  value={formData.endDate}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Shell>
  );
};

export default EventFormPage;
