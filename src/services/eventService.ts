
import { supabase } from "@/integrations/supabase/client";
import { Event, EventFilter, EventFormData, EventWithDetails, PaginatedResponse } from "@/types/api";
import { formatTimeAgo } from "@/lib/utils";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";

// Get all events with pagination and filtering
export const getEvents = async (
  page: number = 1,
  pageSize: number = 10,
  filter: EventFilter = {}
): Promise<PaginatedResponse<Event>> => {
  try {
    const { category, location, dateRange, isVirtual, searchQuery } = filter;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (
          id,
          name,
          avatar
        )
      `, { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].toISOString();
      const endDate = dateRange[1].toISOString();
      query = query.gte('start_date', startDate).lte('end_date', endDate);
    }

    if (isVirtual !== undefined) {
      query = query.eq('is_virtual', isVirtual);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Add pagination
    const { data, error, count } = await query
      .order('start_date', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Error fetching events:", error);
      return {
        items: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
        hasMore: false
      };
    }

    const events = data.map(event => {
      // Create a safe organizer object whether or not the join succeeded
      const organizer = event.organizer || { 
        id: event.organizer_id || '',
        name: 'Unknown',
        avatar: '' 
      };

      // If organizer is an error object, create a default organizer
      if (typeof organizer === 'object' && 'code' in organizer) {
        organizer.id = event.organizer_id || '';
        organizer.name = 'Unknown';
        organizer.avatar = '';
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location || undefined,
        isVirtual: event.is_virtual || false,
        startDate: event.start_date,
        startTime: format(parseISO(event.start_date), 'HH:mm'),
        endDate: event.end_date,
        endTime: format(parseISO(event.end_date), 'HH:mm'),
        category: event.category || 'General',
        imageUrl: event.image_url,
        maxAttendees: event.max_attendees,
        currentAttendees: event.current_attendees || 0,
        organizer: {
          id: organizer.id,
          name: organizer.name,
          avatar: organizer.avatar
        },
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        isRegistered: false // Will be updated by the checkEventRegistration function
      };
    });

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      items: events,
      total: count || 0,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages
    };
  } catch (error) {
    console.error("Error in getEvents:", error);
    throw error;
  }
};

// Get a single event by ID
export const getEvent = async (eventId: string): Promise<EventWithDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (
          id,
          name,
          avatar
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Create a safe organizer object
    const organizer = data.organizer || { 
      id: data.organizer_id || '',
      name: 'Unknown',
      avatar: '' 
    };

    // If organizer is an error object, create a default organizer
    if (typeof organizer === 'object' && 'code' in organizer) {
      organizer.id = data.organizer_id || '';
      organizer.name = 'Unknown';
      organizer.avatar = '';
    }

    // Determine event status
    const now = new Date();
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    
    let status: 'upcoming' | 'ongoing' | 'past';
    if (isBefore(now, startDate)) {
      status = 'upcoming';
    } else if (isAfter(now, endDate)) {
      status = 'past';
    } else {
      status = 'ongoing';
    }

    // Check if current user is registered
    const user = (await supabase.auth.getUser()).data.user;
    let isRegistered = false;
    
    if (user) {
      const { data: registration } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();
      
      isRegistered = !!registration;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      location: data.location || undefined,
      isVirtual: data.is_virtual || false,
      startDate: data.start_date,
      startTime: format(parseISO(data.start_date), 'HH:mm'),
      endDate: data.end_date,
      endTime: format(parseISO(data.end_date), 'HH:mm'),
      category: data.category || 'General',
      imageUrl: data.image_url,
      maxAttendees: data.max_attendees,
      currentAttendees: data.current_attendees || 0,
      organizer: {
        id: organizer.id,
        name: organizer.name,
        avatar: organizer.avatar
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status,
      timeAgo: formatTimeAgo(data.created_at),
      attendees: data.current_attendees || 0,
      isRegistered
    };
  } catch (error) {
    console.error("Error in getEvent:", error);
    throw error;
  }
};

// Check if the current user is registered for an event
export const checkEventRegistration = async (eventId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error checking event registration:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error in checkEventRegistration:", error);
    return false;
  }
};

// Register for an event
export const registerForEvent = async (eventId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: user.id
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

// Cancel event registration
export const cancelEventRegistration = async (eventId: string): Promise<boolean> => {
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

// Create a new event
export const createEvent = async (eventData: EventFormData): Promise<string | null> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const startDateTime = `${eventData.startDate}T${eventData.startTime}:00`;
    const endDateTime = `${eventData.endDate}T${eventData.endTime}:00`;
    
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location || null,
        is_virtual: eventData.isVirtual,
        start_date: startDateTime,
        end_date: endDateTime,
        category: eventData.category,
        image_url: eventData.imageUrl || null,
        max_attendees: eventData.maxAttendees || null,
        organizer_id: user.id
      })
      .select('id')
      .single();
    
    if (error) {
      console.error("Error creating event:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in createEvent:", error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId: string, eventData: EventFormData): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const startDateTime = `${eventData.startDate}T${eventData.startTime}:00`;
    const endDateTime = `${eventData.endDate}T${eventData.endTime}:00`;
    
    const { error } = await supabase
      .from('events')
      .update({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location || null,
        is_virtual: eventData.isVirtual,
        start_date: startDateTime,
        end_date: endDateTime,
        category: eventData.category,
        image_url: eventData.imageUrl || null,
        max_attendees: eventData.maxAttendees || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .eq('organizer_id', user.id);
    
    if (error) {
      console.error("Error updating event:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateEvent:", error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('organizer_id', user.id);
    
    if (error) {
      console.error("Error deleting event:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    throw error;
  }
};

// Get event categories
export const getEventCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      console.error("Error fetching event categories:", error);
      return [];
    }
    
    // Extract unique categories
    const categories = [...new Set(data.map(event => event.category))];
    return categories.filter(Boolean);
  } catch (error) {
    console.error("Error in getEventCategories:", error);
    return [];
  }
};

// Get events created by the current user
export const getUserEvents = async (): Promise<Event[]> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (
          id,
          name,
          avatar
        )
      `)
      .eq('organizer_id', user.id)
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error("Error fetching user events:", error);
      return [];
    }
    
    return data.map(event => {
      // Create a safe organizer object
      const organizer = event.organizer || { 
        id: event.organizer_id || '',
        name: 'Unknown',
        avatar: '' 
      };

      // If organizer is an error object, create a default organizer
      if (typeof organizer === 'object' && 'code' in organizer) {
        organizer.id = event.organizer_id || '';
        organizer.name = 'Unknown';
        organizer.avatar = '';
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location || undefined,
        isVirtual: event.is_virtual || false,
        startDate: event.start_date,
        startTime: format(parseISO(event.start_date), 'HH:mm'),
        endDate: event.end_date,
        endTime: format(parseISO(event.end_date), 'HH:mm'),
        category: event.category || 'General',
        imageUrl: event.image_url,
        maxAttendees: event.max_attendees,
        currentAttendees: event.current_attendees || 0,
        organizer: {
          id: organizer.id,
          name: organizer.name,
          avatar: organizer.avatar
        },
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        isRegistered: true
      };
    });
  } catch (error) {
    console.error("Error in getUserEvents:", error);
    throw error;
  }
};

const eventService = {
  getEvents,
  getEvent,
  checkEventRegistration,
  registerForEvent,
  cancelEventRegistration,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventCategories,
  getUserEvents
};

export default eventService;
