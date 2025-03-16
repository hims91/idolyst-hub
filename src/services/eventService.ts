
import { supabase } from '@/integrations/supabase/client';
import { Event, EventFormData, EventFilter, PaginatedResponse, EventAttendee } from '@/types/api';
import { formatTimeAgo } from '@/lib/utils';

/**
 * Get events with optional filtering and pagination
 */
export const getEvents = async (filters?: EventFilter): Promise<PaginatedResponse<Event>> => {
  try {
    const {
      query,
      category,
      startDate,
      endDate,
      isVirtual,
      status = 'upcoming',
      page = 1,
      limit = 10
    } = filters || {};

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Start building the query
    let queryBuilder = supabase
      .from('events')
      .select(`
        *,
        profiles:organizer_id (
          id,
          name,
          avatar
        ),
        event_attendees!inner(user_id, status)
      `, { count: 'exact' });

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (startDate) {
      queryBuilder = queryBuilder.gte('start_date', new Date(startDate).toISOString());
    }

    if (endDate) {
      queryBuilder = queryBuilder.lte('end_date', new Date(endDate).toISOString());
    }

    if (isVirtual !== undefined) {
      queryBuilder = queryBuilder.eq('is_virtual', isVirtual);
    }

    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }

    // Get current user to check registration status
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData?.session?.user?.id;

    // Add pagination
    queryBuilder = queryBuilder.range(from, to).order('start_date', { ascending: true });

    // Execute query
    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Error fetching events:', error);
      return { items: [], currentPage: page, totalPages: 0, total: 0 };
    }

    // Transform data to match the Event interface
    const events: Event[] = await Promise.all(data.map(async (event) => {
      // Check if current user is registered for this event
      let isRegistered = false;
      
      if (currentUserId) {
        const { data: registrationData } = await supabase
          .from('event_attendees')
          .select('*')
          .eq('event_id', event.id)
          .eq('user_id', currentUserId)
          .single();
        
        isRegistered = !!registrationData;
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location || '',
        isVirtual: event.is_virtual,
        startDate: event.start_date,
        endDate: event.end_date,
        category: event.category || 'Other',
        maxAttendees: event.max_attendees,
        currentAttendees: event.current_attendees,
        imageUrl: event.image_url,
        status: event.status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
        organizer: {
          id: event.profiles?.id || '',
          name: event.profiles?.name || 'Unknown',
          avatar: event.profiles?.avatar
        },
        isRegistered,
        createdAt: event.created_at
      };
    }));

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return {
      items: events,
      currentPage: page,
      totalPages,
      total: count || 0
    };
  } catch (error) {
    console.error('Error in getEvents:', error);
    return { items: [], currentPage: 1, totalPages: 0, total: 0 };
  }
};

/**
 * Get a single event by ID
 */
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:organizer_id (
          id,
          name,
          avatar
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    // Get current user to check registration status
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData?.session?.user?.id;

    // Check if current user is registered for this event
    let isRegistered = false;
    
    if (currentUserId) {
      const { data: registrationData } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', currentUserId)
        .single();
      
      isRegistered = !!registrationData;
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location || '',
      isVirtual: event.is_virtual,
      startDate: event.start_date,
      endDate: event.end_date,
      category: event.category || 'Other',
      maxAttendees: event.max_attendees,
      currentAttendees: event.current_attendees,
      imageUrl: event.image_url,
      status: event.status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
      organizer: {
        id: event.profiles?.id || '',
        name: event.profiles?.name || 'Unknown',
        avatar: event.profiles?.avatar
      },
      isRegistered,
      createdAt: event.created_at
    };
  } catch (error) {
    console.error('Error in getEventById:', error);
    return null;
  }
};

/**
 * Create a new event
 */
export const createEvent = async (eventData: EventFormData): Promise<Event | null> => {
  try {
    // Get current user
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData?.session?.user?.id;

    if (!currentUserId) {
      throw new Error('User must be authenticated to create an event');
    }

    // Format dates
    const startDateISO = new Date(eventData.startDate).toISOString();
    const endDateISO = new Date(eventData.endDate).toISOString();

    // Insert new event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        is_virtual: eventData.isVirtual,
        start_date: startDateISO,
        end_date: endDateISO,
        category: eventData.category,
        max_attendees: eventData.maxAttendees || null,
        image_url: eventData.imageUrl,
        organizer_id: currentUserId,
        status: 'upcoming'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    // Get organizer info
    const { data: organizer } = await supabase
      .from('profiles')
      .select('id, name, avatar')
      .eq('id', currentUserId)
      .single();

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location || '',
      isVirtual: event.is_virtual,
      startDate: event.start_date,
      endDate: event.end_date,
      category: event.category || 'Other',
      maxAttendees: event.max_attendees,
      currentAttendees: 0,
      imageUrl: event.image_url,
      status: event.status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
      organizer: {
        id: organizer?.id || currentUserId,
        name: organizer?.name || 'Unknown',
        avatar: organizer?.avatar
      },
      isRegistered: false,
      createdAt: event.created_at
    };
  } catch (error) {
    console.error('Error in createEvent:', error);
    return null;
  }
};

/**
 * Update an existing event
 */
export const updateEvent = async (eventId: string, eventData: Partial<EventFormData>): Promise<boolean> => {
  try {
    // Get current user
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData?.session?.user?.id;

    if (!currentUserId) {
      throw new Error('User must be authenticated to update an event');
    }

    // Ensure user is the organizer of the event
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();

    if (event?.organizer_id !== currentUserId) {
      throw new Error('Only the organizer can update this event');
    }

    // Prepare update data
    const updateData: any = {};
    
    if (eventData.title) updateData.title = eventData.title;
    if (eventData.description) updateData.description = eventData.description;
    if (eventData.location !== undefined) updateData.location = eventData.location;
    if (eventData.isVirtual !== undefined) updateData.is_virtual = eventData.isVirtual;
    if (eventData.startDate) updateData.start_date = new Date(eventData.startDate).toISOString();
    if (eventData.endDate) updateData.end_date = new Date(eventData.endDate).toISOString();
    if (eventData.category) updateData.category = eventData.category;
    if (eventData.maxAttendees !== undefined) updateData.max_attendees = eventData.maxAttendees;
    if (eventData.imageUrl !== undefined) updateData.image_url = eventData.imageUrl;
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update the event
    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId);

    if (error) {
      console.error('Error updating event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return false;
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData?.session?.user?.id;

    if (!currentUserId) {
      throw new Error('User must be authenticated to delete an event');
    }

    // Ensure user is the organizer of the event
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();

    if (event?.organizer_id !== currentUserId) {
      throw new Error('Only the organizer can delete this event');
    }

    // Delete the event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return false;
  }
};

/**
 * Register for an event
 */
export const registerForEvent = async (eventId: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData?.session?.user?.id;

    if (!currentUserId) {
      throw new Error('User must be authenticated to register for an event');
    }

    // Check if already registered
    const { data: existingRegistration } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', currentUserId)
      .single();

    if (existingRegistration) {
      return true; // Already registered
    }

    // Check if event is at capacity
    const { data: event } = await supabase
      .from('events')
      .select('max_attendees, current_attendees')
      .eq('id', eventId)
      .single();

    if (event && event.max_attendees && event.current_attendees >= event.max_attendees) {
      throw new Error('This event is at capacity');
    }

    // Register for the event
    const { error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: currentUserId,
        status: 'registered'
      });

    if (error) {
      console.error('Error registering for event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in registerForEvent:', error);
    return false;
  }
};

/**
 * Cancel registration for an event
 */
export const cancelEventRegistration = async (eventId: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData?.session?.user?.id;

    if (!currentUserId) {
      throw new Error('User must be authenticated to cancel registration');
    }

    // Delete the registration
    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', currentUserId);

    if (error) {
      console.error('Error cancelling registration:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in cancelEventRegistration:', error);
    return false;
  }
};

/**
 * Get attendees for an event
 */
export const getEventAttendees = async (eventId: string): Promise<EventAttendee[]> => {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        *,
        profiles:user_id (
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

    return data.map(attendee => ({
      id: attendee.profiles.id,
      name: attendee.profiles.name || 'Anonymous',
      avatar: attendee.profiles.avatar,
      role: attendee.profiles.role,
      registeredAt: attendee.registered_at,
      status: attendee.status as 'registered' | 'attended' | 'cancelled'
    }));
  } catch (error) {
    console.error('Error in getEventAttendees:', error);
    return [];
  }
};

/**
 * Get featured or upcoming events
 */
export const getFeaturedEvents = async (limit: number = 3): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:organizer_id (
          id,
          name,
          avatar
        )
      `)
      .eq('status', 'upcoming')
      .gt('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured events:', error);
      return [];
    }

    // Transform data to match the Event interface
    return data.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location || '',
      isVirtual: event.is_virtual,
      startDate: event.start_date,
      endDate: event.end_date,
      category: event.category || 'Other',
      maxAttendees: event.max_attendees,
      currentAttendees: event.current_attendees,
      imageUrl: event.image_url,
      status: event.status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
      organizer: {
        id: event.profiles?.id || '',
        name: event.profiles?.name || 'Unknown',
        avatar: event.profiles?.avatar
      },
      createdAt: event.created_at
    }));
  } catch (error) {
    console.error('Error in getFeaturedEvents:', error);
    return [];
  }
};

/**
 * Get event categories
 */
export const getEventCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching event categories:', error);
      return [];
    }

    // Extract unique categories
    const categories = new Set<string>();
    data.forEach(event => {
      if (event.category) categories.add(event.category);
    });

    return Array.from(categories);
  } catch (error) {
    console.error('Error in getEventCategories:', error);
    return [];
  }
};

const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getEventAttendees,
  getFeaturedEvents,
  getEventCategories
};

export default eventService;
