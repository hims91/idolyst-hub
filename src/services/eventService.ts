
import { supabase } from '@/integrations/supabase/client';
import { Event, EventFilter, EventFormData, EventWithDetails, PaginatedResponse, User } from '@/types/api';
import { formatEventFromSupabase, safeGetProperty, safeQueryResult, safeSupabaseOperation } from '@/utils/supabaseHelpers';

const EVENTS_TABLE = 'events';
const EVENT_ATTENDEES_TABLE = 'event_attendees';

// Function to get all events with pagination and optional filters
export const getEvents = async (filter: EventFilter = {}): Promise<{ events: Event[]; totalEvents: number; currentPage: number; totalPages: number; } | null> => {
  const page = filter.page || 1;
  const limit = filter.limit || 12;
  const startIndex = (page - 1) * limit;
  let query = supabase
    .from(EVENTS_TABLE)
    .select(`*, organizer:user_id (id, name, avatar, role)`, { count: 'exact' })
    .order('start_date', { ascending: true });

  if (filter.category) {
    query = query.eq('category', filter.category);
  }

  if (filter.location) {
    query = query.ilike('location', `%${filter.location}%`);
  }

  if (filter.isVirtual !== undefined) {
    query = query.eq('is_virtual', filter.isVirtual);
  }

  if (filter.searchQuery) {
    query = query.ilike('title', `%${filter.searchQuery}%`);
  }

  const { data: events, error, count } = await query
    .range(startIndex, startIndex + limit - 1);

  if (error) {
    console.error("Error fetching events:", error);
    return null;
  }

  const totalEvents = count || 0;
  const totalPages = Math.ceil(totalEvents / limit);

  // Format events to include organizer details
  const formattedEvents = (events || []).map(event => formatEventFromSupabase(event));

  return {
    events: formattedEvents,
    totalEvents,
    currentPage: page,
    totalPages,
  };
};

// Function to get a single event by ID
export const getEvent = async (id: string): Promise<EventWithDetails | null> => {
  const { data: event, error } = await supabase
    .from(EVENTS_TABLE)
    .select(`*, organizer:user_id (id, name, avatar, role)`)
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }

  return formatEventFromSupabase(event);
};

// Function to create a new event
export const createEvent = async (eventData: EventFormData): Promise<string | null> => {
  const { title, description, location, isVirtual, startDate, startTime, endDate, endTime, category, imageUrl, maxAttendees } = eventData;

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("User not authenticated.");
      return null;
    }
    
    const userId = userData.user.id;

    const newEvent = {
      title,
      description,
      location,
      is_virtual: isVirtual,
      start_date: startDate,
      start_time: startTime,
      end_date: endDate,
      end_time: endTime,
      category,
      image_url: imageUrl,
      max_attendees: maxAttendees,
      current_attendees: 0,
      user_id: userId,
      status: 'upcoming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .insert([newEvent])
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("Error in createEvent:", error);
    return null;
  }
};

// Function to update an existing event
export const updateEvent = async (id: string, eventData: EventFormData): Promise<boolean> => {
  const { title, description, location, isVirtual, startDate, startTime, endDate, endTime, category, imageUrl, maxAttendees } = eventData;

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("User not authenticated.");
      return false;
    }

    const updatedEvent = {
      title,
      description,
      location,
      is_virtual: isVirtual,
      start_date: startDate,
      start_time: startTime,
      end_date: endDate,
      end_time: endTime,
      category,
      image_url: imageUrl,
      max_attendees: maxAttendees,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .update(updatedEvent)
      .eq('id', id)
      .select()
      .single();

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

// Function to delete an event
export const deleteEvent = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from(EVENTS_TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting event:", error);
    return false;
  }

  return true;
};

// Function to get all event categories
export const getEventCategories = async (): Promise<string[]> => {
  try {
    // Direct query to distinct categories from events table
    const { data, error } = await supabase
      .from('events')
      .select('category')
      .order('category');

    if (error) {
      console.error("Error fetching event categories:", error);
      // Return default categories as fallback
      return ['Workshop', 'Conference', 'Meetup', 'Webinar', 'General'];
    }

    // Extract unique categories
    const categories = Array.from(new Set(
      data
        .filter(item => item.category)
        .map(item => item.category)
    ));

    return categories.length > 0 ? categories : ['Workshop', 'Conference', 'Meetup', 'Webinar', 'General'];
  } catch (error) {
    console.error("Error in getEventCategories:", error);
    return ['Workshop', 'Conference', 'Meetup', 'Webinar', 'General'];
  }
};

// Function to register a user for an event
export const registerForEvent = async (eventId: string): Promise<boolean> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    console.error("User not authenticated.");
    return false;
  }
  
  const userId = userData.user.id;

  const registration = {
    event_id: eventId,
    user_id: userId,
    registered_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(EVENT_ATTENDEES_TABLE)
    .insert([registration]);

  if (error) {
    console.error("Error registering for event:", error);
    return false;
  }

  // Increment current_attendees count in events table is handled by a database trigger
  return true;
};

// Function to cancel a user's registration for an event
export const cancelEventRegistration = async (eventId: string): Promise<boolean> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    console.error("User not authenticated.");
    return false;
  }
  
  const userId = userData.user.id;

  const { error } = await supabase
    .from(EVENT_ATTENDEES_TABLE)
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) {
    console.error("Error cancelling event registration:", error);
    return false;
  }

  // Decrement current_attendees count in events table is handled by a database trigger
  return true;
};

// Function to check if a user is registered for an event
export const isUserRegistered = async (eventId: string): Promise<boolean> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    console.warn("User not authenticated, assuming not registered.");
    return false;
  }
  
  const userId = userData.user.id;

  const { data, error } = await supabase
    .from(EVENT_ATTENDEES_TABLE)
    .select('*', { count: 'exact' })
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) {
    console.error("Error checking event registration:", error);
    return false;
  }

  return (data?.length || 0) > 0;
};

// Function to get event attendees
export const getEventAttendees = async (eventId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        id,
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

    // Safely transform the attendees data
    const attendees = Array.isArray(data) ? data.map(attendee => {
      const user = attendee.user;
      if (!user) return null;
      
      return {
        id: safeGetProperty(user, 'id', ''),
        name: safeGetProperty(user, 'name', 'Unknown User'),
        avatar: safeGetProperty(user, 'avatar', ''),
        role: safeGetProperty(user, 'role', 'user')
      };
    }).filter(Boolean) as User[] : [];

    return attendees;
  } catch (error) {
    console.error('Error in getEventAttendees:', error);
    return [];
  }
};

// No duplicate export block at the end - this was causing the errors
