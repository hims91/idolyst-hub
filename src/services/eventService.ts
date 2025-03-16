
import { supabase } from "@/integrations/supabase/client";
import { Event, EventAttendee, EventCategory, EventWithDetails, PaginatedResponse } from "@/types/api";
import { format } from "date-fns";
import { formatTimeAgo } from "@/lib/utils";

// Get all event categories
export const getEventCategories = async (): Promise<EventCategory[]> => {
  // Fetch unique categories from the events table
  const { data, error } = await supabase
    .from('events')
    .select('category')
    .not('category', 'is', null);

  if (error) {
    console.error("Error fetching event categories:", error);
    throw new Error(error.message);
  }

  // Extract unique categories
  const categorySet = new Set<string>();
  data.forEach(item => {
    if (item.category) categorySet.add(item.category);
  });

  // Convert to array of category objects
  return Array.from(categorySet).map(category => ({
    id: category.toLowerCase().replace(/\s+/g, '-'),
    name: category
  }));
};

// Get all events with pagination and filtering
export const getEvents = async (
  page = 1,
  limit = 10,
  category?: string,
  status?: 'upcoming' | 'past' | 'all'
): Promise<PaginatedResponse<EventWithDetails>> => {
  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:organizer_id (
        id,
        name:raw_user_meta_data->name,
        avatar:raw_user_meta_data->avatar_url
      ),
      attendees:event_attendees(count)
    `, { count: 'exact' });

  // Apply category filter if provided
  if (category) {
    query = query.eq('category', category);
  }

  // Apply status filter if provided
  if (status && status !== 'all') {
    const now = new Date().toISOString();
    if (status === 'upcoming') {
      query = query.gte('start_date', now);
    } else if (status === 'past') {
      query = query.lt('end_date', now);
    }
  }

  // Fetch the total count first
  const { count, error: countError } = await query;
  
  if (countError) {
    console.error("Error counting events:", countError);
    throw new Error(countError.message);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.range(from, to).order('start_date', { ascending: true });

  // Execute the query
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching events:", error);
    throw new Error(error.message);
  }

  // Parse and format the data
  const formattedData: EventWithDetails[] = data.map(item => {
    // Handle the case where organizer might be null or undefined
    const organizer = item.organizer ? {
      id: item.organizer.id || '',
      name: item.organizer.name || 'Unknown',
      avatar: item.organizer.avatar || '',
    } : {
      id: '',
      name: 'Unknown',
      avatar: '',
    };

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      location: item.location || '',
      isVirtual: item.is_virtual || false,
      startDate: format(new Date(item.start_date), 'PPP'),
      startTime: format(new Date(item.start_date), 'p'),
      endDate: format(new Date(item.end_date), 'PPP'),
      endTime: format(new Date(item.end_date), 'p'),
      category: item.category || 'General',
      imageUrl: item.image_url || '/placeholder.svg',
      maxAttendees: item.max_attendees || 0,
      currentAttendees: item.current_attendees || 0,
      status: determineEventStatus(item.start_date, item.end_date),
      timeAgo: formatTimeAgo(item.created_at),
      organizer,
      attendees: item.attendees.length > 0 ? item.attendees[0].count : 0,
      isRegistered: false // This will be set later
    };
  });

  return {
    items: formattedData,
    total: count || 0,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / limit),
    hasMore: from + limit < (count || 0)
  };
};

// Get event by ID
export const getEventById = async (eventId: string): Promise<EventWithDetails | null> => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:organizer_id (
        id,
        name:raw_user_meta_data->name,
        avatar:raw_user_meta_data->avatar_url
      ),
      attendees:event_attendees(
        *,
        user:user_id (
          id,
          name:raw_user_meta_data->name,
          avatar:raw_user_meta_data->avatar_url,
          role:raw_user_meta_data->role
        )
      )
    `)
    .eq('id', eventId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Event not found
    }
    console.error("Error fetching event:", error);
    throw new Error(error.message);
  }

  // Handle the case where organizer might be null or undefined
  const organizer = data.organizer ? {
    id: data.organizer.id || '',
    name: data.organizer.name || 'Unknown',
    avatar: data.organizer.avatar || '',
  } : {
    id: '',
    name: 'Unknown',
    avatar: '',
  };

  // Parse attendees
  const attendeesList = data.attendees.map((item: any) => {
    return {
      id: item.id,
      status: item.status,
      registeredAt: item.registered_at,
      user: item.user ? {
        id: item.user.id || '',
        name: item.user.name || 'Unknown User',
        avatar: item.user.avatar || '',
        role: item.user.role || 'member'
      } : null
    };
  });

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    location: data.location || '',
    isVirtual: data.is_virtual || false,
    startDate: format(new Date(data.start_date), 'PPP'),
    startTime: format(new Date(data.start_date), 'p'),
    endDate: format(new Date(data.end_date), 'PPP'),
    endTime: format(new Date(data.end_date), 'p'),
    category: data.category || 'General',
    imageUrl: data.image_url || '/placeholder.svg',
    maxAttendees: data.max_attendees || 0,
    currentAttendees: data.current_attendees || 0,
    status: determineEventStatus(data.start_date, data.end_date),
    timeAgo: formatTimeAgo(data.created_at),
    organizer,
    attendees: attendeesList.length,
    attendeesList,
    isRegistered: false // This will be set later
  };
};

// Check if a user is registered for an event
export const checkEventRegistration = async (eventId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('event_attendees')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error checking event registration:", error);
    throw new Error(error.message);
  }

  return !!data;
};

// Register for an event
export const registerForEvent = async (eventId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('event_attendees')
    .insert({
      event_id: eventId,
      user_id: userId,
      status: 'registered'
    });

  if (error) {
    console.error("Error registering for event:", error);
    throw new Error(error.message);
  }
};

// Cancel event registration
export const cancelEventRegistration = async (eventId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('event_attendees')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) {
    console.error("Error canceling event registration:", error);
    throw new Error(error.message);
  }
};

// Create a new event
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentAttendees'>): Promise<Event> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: eventData.title,
      description: eventData.description,
      location: eventData.location || null,
      is_virtual: eventData.isVirtual || false,
      start_date: new Date(eventData.startDate + ' ' + eventData.startTime).toISOString(),
      end_date: new Date(eventData.endDate + ' ' + eventData.endTime).toISOString(),
      category: eventData.category,
      max_attendees: eventData.maxAttendees || null,
      image_url: eventData.imageUrl || null,
      organizer_id: userId
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    location: data.location || '',
    isVirtual: data.is_virtual || false,
    startDate: format(new Date(data.start_date), 'yyyy-MM-dd'),
    startTime: format(new Date(data.start_date), 'HH:mm'),
    endDate: format(new Date(data.end_date), 'yyyy-MM-dd'),
    endTime: format(new Date(data.end_date), 'HH:mm'),
    category: data.category || 'General',
    imageUrl: data.image_url || '/placeholder.svg',
    maxAttendees: data.max_attendees || 0,
    currentAttendees: data.current_attendees || 0,
    organizer: {
      id: userId,
      name: 'Me',
      avatar: ''
    },
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Update an existing event
export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
  // Convert date/time to ISO format if provided
  let startDate, endDate;
  if (eventData.startDate && eventData.startTime) {
    startDate = new Date(eventData.startDate + ' ' + eventData.startTime).toISOString();
  }
  if (eventData.endDate && eventData.endTime) {
    endDate = new Date(eventData.endDate + ' ' + eventData.endTime).toISOString();
  }

  const { data, error } = await supabase
    .from('events')
    .update({
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      is_virtual: eventData.isVirtual,
      start_date: startDate,
      end_date: endDate,
      category: eventData.category,
      max_attendees: eventData.maxAttendees,
      image_url: eventData.imageUrl
    })
    .eq('id', eventId)
    .select(`
      *,
      organizer:organizer_id (
        id,
        name:raw_user_meta_data->name,
        avatar:raw_user_meta_data->avatar_url
      )
    `)
    .single();

  if (error) {
    console.error("Error updating event:", error);
    throw new Error(error.message);
  }

  // Handle the case where organizer might be null or undefined
  const organizer = data.organizer ? {
    id: data.organizer.id || '',
    name: data.organizer.name || 'Unknown',
    avatar: data.organizer.avatar || '',
  } : {
    id: '',
    name: 'Unknown',
    avatar: '',
  };

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    location: data.location || '',
    isVirtual: data.is_virtual || false,
    startDate: format(new Date(data.start_date), 'yyyy-MM-dd'),
    startTime: format(new Date(data.start_date), 'HH:mm'),
    endDate: format(new Date(data.end_date), 'yyyy-MM-dd'),
    endTime: format(new Date(data.end_date), 'HH:mm'),
    category: data.category || 'General',
    imageUrl: data.image_url || '/placeholder.svg',
    maxAttendees: data.max_attendees || 0,
    currentAttendees: data.current_attendees || 0,
    organizer,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error("Error deleting event:", error);
    throw new Error(error.message);
  }
};

// Helper function to determine event status
const determineEventStatus = (startDate: string, endDate: string): 'upcoming' | 'ongoing' | 'past' => {
  const now = new Date();
  const eventStart = new Date(startDate);
  const eventEnd = new Date(endDate);

  if (now < eventStart) {
    return 'upcoming';
  } else if (now > eventEnd) {
    return 'past';
  } else {
    return 'ongoing';
  }
};
