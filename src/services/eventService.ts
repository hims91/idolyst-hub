
import { supabase } from '@/integrations/supabase/client';
import { Event, EventWithDetails, User, EventFilter, EventFormData } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';
import { safeGetProperty, formatEventFromSupabase } from '@/utils/supabaseHelpers';

// Get a list of events with optional filtering
export const getEvents = async (
  filter: EventFilter = {}
): Promise<{ events: Event[]; totalEvents: number; currentPage: number; totalPages: number }> => {
  try {
    const {
      category,
      location,
      dateRange,
      isVirtual,
      searchQuery,
      page = 1,
      status = 'all',
      limit = 10
    } = filter;

    // Build the query
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (
          id,
          name,
          avatar,
          role
        ),
        is_registered:event_attendees!inner(id)
      `, { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange;
      query = query.gte('start_date', startDate.toISOString().split('T')[0])
                  .lte('end_date', endDate.toISOString().split('T')[0]);
    }

    if (isVirtual !== undefined) {
      query = query.eq('is_virtual', isVirtual);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Get authenticated user if available
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      query = query.eq('event_attendees.user_id', user.id);
    } else {
      // If no user is logged in, we need to modify the query to not filter by registration
      query = supabase
        .from('events')
        .select(`
          *,
          organizer:organizer_id (
            id,
            name,
            avatar,
            role
          )
        `, { count: 'exact' });
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    
    // Execute the query with pagination
    const { data, error, count } = await query
      .order('start_date', { ascending: true })
      .range(startIndex, startIndex + limit - 1);

    if (error) {
      console.error('Error fetching events:', error);
      return { events: [], totalEvents: 0, currentPage: page, totalPages: 0 };
    }

    // Format the events data
    const formattedEvents: Event[] = data.map(event => formatEventFromSupabase(event));

    // Calculate total pages
    const totalPages = Math.ceil((count || 0) / limit);

    return {
      events: formattedEvents,
      totalEvents: count || 0,
      currentPage: page,
      totalPages
    };
  } catch (error) {
    console.error('Error in getEvents:', error);
    return { events: [], totalEvents: 0, currentPage: 1, totalPages: 0 };
  }
};

// Get a single event by ID with details
export const getEvent = async (eventId: string): Promise<EventWithDetails | null> => {
  try {
    // Get authenticated user if available to check registration status
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch event details
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    // Check if the user is registered for this event
    let isRegistered = false;
    if (user) {
      const { data: registrationData, error: registrationError } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();
        
      if (!registrationError && registrationData) {
        isRegistered = true;
      }
    }

    // Format and return the event with details
    const formattedEvent = formatEventFromSupabase(data);
    if (formattedEvent) {
      formattedEvent.isRegistered = isRegistered;
      formattedEvent.timeAgo = formatDistanceToNow(new Date(formattedEvent.createdAt), { addSuffix: true });
    }
    
    return formattedEvent;
  } catch (error) {
    console.error('Error in getEvent:', error);
    return null;
  }
};

// Get attendees for an event
export const getEventAttendees = async (eventId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        user_id,
        user:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching event attendees:', error);
      return [];
    }

    // Extract and format user data from attendees
    const attendees: User[] = data.map(attendee => {
      // Make sure to handle the case where user might be null
      if (!attendee.user || typeof attendee.user === 'object' && 'code' in attendee.user) {
        return {
          id: attendee.user_id || 'unknown',
          name: 'Unknown User',
          avatar: '',
          role: 'user'
        };
      }
      
      return {
        id: attendee.user.id || attendee.user_id || 'unknown',
        name: attendee.user.name || 'Unknown User',
        avatar: attendee.user.avatar || '',
        role: attendee.user.role || 'user'
      };
    });

    return attendees;
  } catch (error) {
    console.error('Error in getEventAttendees:', error);
    return [];
  }
};

// Check if the current user is registered for an event
export const isUserRegistered = async (eventId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        return false;
      }
      console.error('Error checking registration status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isUserRegistered:', error);
    return false;
  }
};

// Register for an event
export const registerForEvent = async (eventId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to register for an event.');
    }
    
    // Check if the event exists and has capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('current_attendees, max_attendees')
      .eq('id', eventId)
      .single();
      
    if (eventError) {
      console.error('Error fetching event for registration:', eventError);
      throw new Error('Event not found.');
    }
    
    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      throw new Error('Event is full. Registration is closed.');
    }
    
    // Check if already registered
    const { data: existingRegistration, error: registrationCheckError } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();
      
    if (!registrationCheckError && existingRegistration) {
      throw new Error('You are already registered for this event.');
    }
    
    // Register for the event
    const { error: registrationError } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: user.id,
        status: 'registered'
      });
      
    if (registrationError) {
      console.error('Error registering for event:', registrationError);
      throw new Error('Failed to register for the event. Please try again.');
    }
    
    return true;
  } catch (error) {
    console.error('Error in registerForEvent:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred during registration.');
  }
};

// Cancel event registration
export const cancelEventRegistration = async (eventId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to cancel registration.');
    }
    
    // Delete the registration record
    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error cancelling event registration:', error);
      throw new Error('Failed to cancel registration. Please try again.');
    }
    
    return true;
  } catch (error) {
    console.error('Error in cancelEventRegistration:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred during cancellation.');
  }
};

// Create a new event
export const createEvent = async (eventData: EventFormData): Promise<Event | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to create an event.');
    }
    
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        is_virtual: eventData.isVirtual,
        start_date: eventData.startDate,
        start_time: eventData.startTime,
        end_date: eventData.endDate,
        end_time: eventData.endTime,
        category: eventData.category,
        image_url: eventData.imageUrl,
        max_attendees: eventData.maxAttendees,
        organizer_id: user.id,
        status: 'upcoming'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event. Please try again.');
    }
    
    return formatEventFromSupabase(data);
  } catch (error) {
    console.error('Error in createEvent:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while creating the event.');
  }
};

// Update an existing event
export const updateEvent = async (eventId: string, eventData: Partial<EventFormData>): Promise<Event | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to update an event.');
    }
    
    // Check if the user is the organizer
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();
      
    if (eventError) {
      console.error('Error fetching event for update:', eventError);
      throw new Error('Event not found.');
    }
    
    if (event.organizer_id !== user.id) {
      throw new Error('You are not authorized to update this event.');
    }
    
    // Update the event
    const { data, error } = await supabase
      .from('events')
      .update({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        is_virtual: eventData.isVirtual,
        start_date: eventData.startDate,
        start_time: eventData.startTime,
        end_date: eventData.endDate,
        end_time: eventData.endTime,
        category: eventData.category,
        image_url: eventData.imageUrl,
        max_attendees: eventData.maxAttendees,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event. Please try again.');
    }
    
    return formatEventFromSupabase(data);
  } catch (error) {
    console.error('Error in updateEvent:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while updating the event.');
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to delete an event.');
    }
    
    // Check if the user is the organizer
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();
      
    if (eventError) {
      console.error('Error fetching event for deletion:', eventError);
      throw new Error('Event not found.');
    }
    
    if (event.organizer_id !== user.id) {
      throw new Error('You are not authorized to delete this event.');
    }
    
    // Delete the event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
      
    if (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event. Please try again.');
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while deleting the event.');
  }
};

export const eventService = {
  getEvents,
  getEvent,
  getEventAttendees,
  isUserRegistered,
  registerForEvent,
  cancelEventRegistration,
  createEvent,
  updateEvent,
  deleteEvent
};

export default eventService;
