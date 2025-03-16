
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Helper function to safely get a property from an object that might be an error
export function safeGetProperty<T, K extends keyof T>(
  obj: T | { code?: string; error?: string; message?: string },
  property: K,
  defaultValue: any
): T[K] {
  if (!obj || typeof obj !== 'object' || 'code' in obj) {
    return defaultValue;
  }
  return (obj as T)[property] !== undefined ? (obj as T)[property] : defaultValue;
}

// Helper to safely execute a Supabase operation and handle errors consistently
export async function safeSupabaseOperation<T>(
  operation: Promise<{ data: T | null; error: PostgrestError | null }>,
  errorMessage: string = 'Database operation failed'
): Promise<T | null> {
  try {
    const { data, error } = await operation;
    if (error) {
      console.error(`${errorMessage}:`, error);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`${errorMessage}:`, err);
    return null;
  }
}

// Safe query execution with proper error handling
export async function safeQueryResult<T>(
  operation: Promise<{ data: T | null; error: PostgrestError | null }>,
  defaultValue: T | null = null
): Promise<T | null> {
  try {
    const { data, error } = await operation;
    if (error) {
      console.error("Query error:", error);
      return defaultValue;
    }
    return data;
  } catch (err) {
    console.error("Unexpected error in query:", err);
    return defaultValue;
  }
}

// Format event data from Supabase to match our EventWithDetails type
export function formatEventFromSupabase(event: any): any {
  if (!event) return null;
  
  // Handle case where event is an error object
  if ('code' in event) {
    console.error("Error in event data:", event);
    return null;
  }
  
  return {
    id: event.id || '',
    title: event.title || '',
    description: event.description || '',
    location: event.location || '',
    isVirtual: event.is_virtual || false,
    startDate: event.start_date || '',
    startTime: event.start_time || '',
    endDate: event.end_date || '',
    endTime: event.end_time || '',
    category: event.category || 'General',
    imageUrl: event.image_url || '',
    maxAttendees: event.max_attendees || null,
    currentAttendees: event.current_attendees || 0,
    organizer: {
      id: safeGetProperty(event.organizer, 'id', ''),
      name: safeGetProperty(event.organizer, 'name', 'Unknown'),
      avatar: safeGetProperty(event.organizer, 'avatar', ''),
      role: safeGetProperty(event.organizer, 'role', 'user')
    },
    status: event.status || 'upcoming',
    createdAt: event.created_at || '',
    updatedAt: event.updated_at || '',
    isRegistered: Array.isArray(event.is_registered) && event.is_registered.length > 0
  };
}

// Check if a column exists in a table
export async function checkColumnExists(table: string, column: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_column_exists', {
      table_name: table,
      column_name: column
    });
    
    if (error) {
      console.error(`Error checking if column ${column} exists in table ${table}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error checking column existence:`, error);
    return false;
  }
}

// Check if a table exists in the database
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // Using a simplified approach to check if table exists
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') { // Table does not exist error code
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}
