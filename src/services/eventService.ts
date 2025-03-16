import { supabase } from '@/integrations/supabase/client';
import { Event, EventWithDetails, EventFilter, EventFormData, User } from '@/types/api';

// Helper function to safely access properties from potentially null/error objects
const safeGet = <T extends object, K extends keyof T>(obj: T | null | undefined | { code?: string }, key: K, defaultValue?: T[K]): T[K] | undefined => {
  if (!obj || typeof obj !== 'object' || 'code' in obj) {
    return defaultValue;
  }
  return obj[key] !== undefined ? obj[key] : defaultValue;
};

// Get all events with pagination and filters
const getEvents = async (page: number = 1, limit: number = 12, filters: EventFilter = {}): Promise<{ items: Event[]; total: number; currentPage: number; totalPages: number }> => {
  try {
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
      query = query.ilike('title', `%${filters.query}%`);
    }

    // Paginate results
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      throw new Error(error.message);
    }

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location || '',
      isVirtual: event.is_virtual,
      startDate: event.start_date,
      startTime: event.start_time,
      endDate: event.end_date,
      endTime: event.end_time,
      category: event.category || 'General',
      imageUrl: event.image_url || '',
      maxAttendees: event.max_attendees,
      currentAttendees: event.current_attendees,
      organizer: {
        id: safeGet(event.organizer, 'id', ''),
        name: safeGet(event.organizer, 'name', 'Unknown'),
        avatar: safeGet(event.organizer, 'avatar', ''),
        role: safeGet(event.organizer, 'role', 'member')
      },
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      isRegistered: !!event.is_registered,
      status: event.status || 'upcoming' // Fix the missing status property
    }));

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
    throw error;
  }
};

// Get a single event by ID
const getEvent = async (eventId: string): Promise<EventWithDetails> => {
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
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      throw new Error(error.message);
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location || '',
      isVirtual: event.is_virtual,
      startDate: event.start_date,
      startTime: event.start_time,
      endDate: event.end_date,
      endTime: event.end_time,
      category: event.category || 'General',
      imageUrl: event.image_url || '',
      maxAttendees: event.max_attendees,
      currentAttendees: event.current_attendees,
      organizer: {
        id: safeGet(event.organizer, 'id', ''),
        name: safeGet(event.organizer, 'name', 'Unknown'),
        avatar: safeGet(event.organizer, 'avatar', ''),
        role: safeGet(event.organizer, 'role', 'member')
      },
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      status: event.status || 'upcoming'
    };
  } catch (error) {
    console.error("Error in getEvent:", error);
    throw error;
  }
};

// Get event attendees
const getEventAttendees = async (eventId: string): Promise<User[]> => {
  try {
    const { data: attendees, error } = await supabase
      .from('event_attendees')
      .select(`user_id`)
      .eq('event_id', eventId);

    if (error) {
      console.error("Error fetching event attendees:", error);
      throw new Error(error.message);
    }

    return attendees?.map(attendee => ({
      id: attendee.user_id,
      name: 'Attendee',
      avatar: '',
      role: 'member'
    })) || [];
  } catch (error) {
    console.error("Error in getEventAttendees:", error);
    throw error;
  }
};

// Create a new event
const createEvent = async (eventData: EventFormData): Promise<string> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data:newEvent, error } = await supabase
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
      .select('id')
      .single();

    if (error) {
      console.error("Error creating event:", error);
      throw new Error(error.message);
    }

    return newEvent.id;
  } catch (error) {
    console.error("Error in createEvent:", error);
    throw error;
  }
};

// Update an existing event
const updateEvent = async (eventId: string, eventData: EventFormData): Promise<void> => {
  try {
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
        max_attendees: eventData.maxAttendees
      })
      .eq('id', eventId);

    if (error) {
      console.error("Error updating event:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in updateEvent:", error);
    throw error;
  }
};

// Delete an event
const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error("Error deleting event:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    throw error;
  }
};

// Register a user for an event
const registerForEvent = async (eventId: string): Promise<void> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      throw new Error("User not authenticated");
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
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in registerForEvent:", error);
    throw error;
  }
};

// Cancel a user's event registration
const cancelEventRegistration = async (eventId: string): Promise<void> => {
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
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in cancelEventRegistration:", error);
    throw error;
  }
};

// Get all event categories
const getEventCategories = async (): Promise<string[]> => {
  try {
    // Mock categories for now
    return ['General', 'Technology', 'Music', 'Sports', 'Web3', 'AI'];
  } catch (error) {
    console.error("Error in getEventCategories:", error);
    return [];
  }
};

// Search events by title or description
const searchEvents = async (query: string): Promise<Event[]> => {
  try {
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
      .ilike('title', `%${query}%`)
      .order('start_date', { ascending: false });

    if (error) {
      console.error("Error searching events:", error);
      throw new Error(error.message);
    }

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location || '',
      isVirtual: event.is_virtual,
      startDate: event.start_date,
      startTime: event.start_time,
      endDate: event.end_date,
      endTime: event.end_time,
      category: event.category || 'General',
      imageUrl: event.image_url || '',
      maxAttendees: event.max_attendees,
      currentAttendees: event.current_attendees,
      organizer: {
        id: safeGet(event.organizer, 'id', ''),
        name: safeGet(event.organizer, 'name', 'Unknown'),
        avatar: safeGet(event.organizer, 'avatar', ''),
        role: safeGet(event.organizer, 'role', 'member')
      },
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      status: event.status || 'upcoming'
    }));

    return formattedEvents;
  } catch (error) {
    console.error("Error in searchEvents:", error);
    throw error;
  }
};

const eventService = {
  getEvents,
  getEvent,
  getEventAttendees,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getEventCategories,
  searchEvents
};

export default eventService;
