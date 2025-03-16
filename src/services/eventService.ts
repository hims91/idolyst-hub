
import { supabase } from '@/integrations/supabase/client';
import { Event, EventWithDetails, EventFilter, EventFormData, User, PaginatedResponse } from '@/types/api';
import { safeGetProperty, formatEventFromSupabase, safeSupabaseOperation } from '@/utils/supabaseHelpers';

// Get all events with pagination and filters
const getEvents = async (
  page: number = 1, 
  limit: number = 12, 
  filters: EventFilter = {}
): Promise<PaginatedResponse<Event>> => {
  try {
    const startIndex = (page - 1) * limit;
    
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        location,
        is_virtual,
        start_date,
        start_time,
        end_date,
        end_time,
        category,
        image_url,
        max_attendees,
        current_attendees,
        created_at,
        updated_at,
        status,
        organizer:organizer_id (
          id,
          name,
          avatar,
          role
        ),
        is_registered:event_attendees(user_id)
      `,
      { count: 'exact' }
      )
      .order('start_date', { ascending: false });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.isVirtual !== undefined) {
      query = query.eq('is_virtual', filters.isVirtual);
    }
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Paginate results
    query = query.range(startIndex, startIndex + limit - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      throw new Error(error.message);
    }

    const formattedEvents: Event[] = events.map(event => formatEventFromSupabase(event));

    const totalEvents = count || 0;
    const totalPages = Math.ceil(totalEvents / limit);

    return {
      items: formattedEvents,
      total: totalEvents,
      currentPage: page,
      totalPages: totalPages
    };
  } catch (error) {
    console.error("Error in getEvents:", error);
    return {
      items: [],
      total: 0,
      currentPage: 1,
      totalPages: 1
    };
  }
};

// Get a single event by ID
const getEvent = async (eventId: string): Promise<EventWithDetails | null> => {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        location,
        is_virtual,
        start_date,
        start_time,
        end_date,
        end_time,
        category,
        image_url,
        max_attendees,
        current_attendees,
        created_at,
        updated_at,
        status,
        organizer:organizer_id (
          id,
          name,
          avatar,
          role
        ),
        is_registered:event_attendees(user_id)
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return null;
    }

    return formatEventFromSupabase(event);
  } catch (error) {
    console.error("Error in getEvent:", error);
    return null;
  }
};

// Get event attendees
const getEventAttendees = async (eventId: string): Promise<User[]> => {
  try {
    const { data: attendees, error } = await supabase
      .from('event_attendees')
      .select(`
        user:user_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('event_id', eventId);

    if (error) {
      console.error("Error fetching event attendees:", error);
      return [];
    }

    return attendees.map(item => ({
      id: safeGetProperty(item.user, 'id', ''),
      name: safeGetProperty(item.user, 'name', 'Attendee'),
      avatar: safeGetProperty(item.user, 'avatar', ''),
      role: safeGetProperty(item.user, 'role', 'member')
    }));
  } catch (error) {
    console.error("Error in getEventAttendees:", error);
    return [];
  }
};

// Check if user is registered for an event
const isUserRegistered = async (eventId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      console.error("Error checking registration:", error);
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking if user is registered:", error);
    return false;
  }
};

// Create a new event
const createEvent = async (eventData: EventFormData): Promise<string | null> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: newEvent, error } = await supabase
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
        status: 'upcoming',
        current_attendees: 0
      })
      .select('id')
      .single();

    if (error) {
      console.error("Error creating event:", error);
      throw new Error(error.message);
    }

    return newEvent?.id || null;
  } catch (error) {
    console.error("Error in createEvent:", error);
    return null;
  }
};

// Update an existing event
const updateEvent = async (eventId: string, eventData: EventFormData): Promise<boolean> => {
  try {
    // Check if user is the organizer first
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching event:", fetchError);
      return false;
    }
    
    if (existingEvent.organizer_id !== user.id) {
      throw new Error("Only the event organizer can update this event");
    }
    
    const { error } = await supabase
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
      .eq('id', eventId);

    if (error) {
      console.error("Error updating event:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateEvent:", error);
    return false;
  }
};

// Delete an event
const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    // Check if user is the organizer first
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching event:", fetchError);
      return false;
    }
    
    if (existingEvent.organizer_id !== user.id) {
      throw new Error("Only the event organizer can delete this event");
    }
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error("Error deleting event:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    return false;
  }
};

// Register a user for an event
const registerForEvent = async (eventId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Check if already registered
    const { data: existing, error: checkError } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id);
      
    if (checkError) {
      console.error("Error checking existing registration:", checkError);
      return false;
    }
    
    if (existing && existing.length > 0) {
      return true; // Already registered
    }

    // Check if event has reached max capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('max_attendees, current_attendees')
      .eq('id', eventId)
      .single();
      
    if (eventError) {
      console.error("Error fetching event details:", eventError);
      return false;
    }
    
    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      throw new Error("Event has reached maximum capacity");
    }

    const { error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: user.id,
        registered_at: new Date().toISOString(),
        status: 'registered'
      });

    if (error) {
      console.error("Error registering for event:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in registerForEvent:", error);
    throw error;
  }
};

// Cancel a user's event registration
const cancelEventRegistration = async (eventId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error cancelling event registration:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in cancelEventRegistration:", error);
    throw error;
  }
};

// Get all event categories
const getEventCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('category')
      .not('category', 'is', null);
      
    if (error) {
      console.error("Error fetching categories:", error);
      return ['General', 'Technology', 'Music', 'Sports', 'Web3', 'AI'];
    }
    
    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];
    
    // Ensure we always have some default categories
    const defaultCategories = ['General', 'Technology', 'Music', 'Sports', 'Web3', 'AI'];
    const mergedCategories = [...new Set([...categories, ...defaultCategories])];
    
    return mergedCategories;
  } catch (error) {
    console.error("Error in getEventCategories:", error);
    return ['General', 'Technology', 'Music', 'Sports', 'Web3', 'AI'];
  }
};

// Search events by title or description
const searchEvents = async (query: string): Promise<Event[]> => {
  try {
    if (!query) return [];
    
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        location,
        is_virtual,
        start_date,
        start_time,
        end_date,
        end_time,
        category,
        image_url,
        max_attendees,
        current_attendees,
        created_at,
        updated_at,
        status,
        organizer:organizer_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('start_date', { ascending: false });

    if (error) {
      console.error("Error searching events:", error);
      return [];
    }

    return events.map(event => formatEventFromSupabase(event));
  } catch (error) {
    console.error("Error in searchEvents:", error);
    return [];
  }
};

const eventService = {
  getEvents,
  getEvent,
  getEventAttendees,
  isUserRegistered,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getEventCategories,
  searchEvents
};

export default eventService;
