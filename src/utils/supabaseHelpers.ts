
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Helper function to check if a table exists
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use a raw query (RPC) to check if table exists
    const { data, error } = await supabase
      .rpc('check_column_exists', {
        table_name: 'tables',
        column_name: 'table_name'
      });

    if (error) {
      console.error(`Error checking if table exists: ${tableName}`, error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error(`Error in checkTableExists for table: ${tableName}`, error);
    return false;
  }
};

// Helper function to check if a column exists in a table
export const checkColumnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_column_exists', {
      table_name: tableName,
      column_name: columnName,
    });

    if (error) {
      console.error(`Error checking if column exists: ${tableName}.${columnName}`, error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error(`Error in checkColumnExists for column: ${tableName}.${columnName}`, error);
    return false;
  }
};

// Safe getter for object properties
export const safeGetProperty = (obj: any, key: string, defaultValue: any): any => {
  if (!obj || obj[key] === undefined) {
    return defaultValue;
  }
  return obj[key];
};

// Format event data from Supabase
export const formatEventFromSupabase = (event: any): any => {
  if (!event) return null;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    isVirtual: event.is_virtual,
    startDate: event.start_date,
    endDate: event.end_date,
    startTime: event.start_time,
    endTime: event.end_time,
    category: event.category,
    imageUrl: event.image_url,
    maxAttendees: event.max_attendees,
    currentAttendees: event.current_attendees,
    status: event.status,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
    organizer: {
      id: safeGetProperty(event.organizer, 'id', ''),
      name: safeGetProperty(event.organizer, 'name', 'Unknown Organizer'),
      avatar: safeGetProperty(event.organizer, 'avatar', ''),
      role: safeGetProperty(event.organizer, 'role', 'user')
    }
  };
};

// Safe query result handler
export const safeQueryResult = <T>(data: T | null, error: PostgrestError | null): { data: T | null; error: string | null } => {
  if (error) {
    console.error('Query error:', error);
    return { data: null, error: error.message };
  }
  return { data, error: null };
};

// Safe Supabase operation handler
export const safeSupabaseOperation = async <T>(operation: Promise<{ data: T | null; error: PostgrestError | null }>): Promise<T | null> => {
  try {
    const { data, error } = await operation;
    if (error) {
      console.error('Supabase operation error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error in Supabase operation:', err);
    return null;
  }
};

// Helper function to handle query results with proper type checking
export const handleQueryResult = <T>(result: { data: T | null; error: PostgrestError | null }): T | null => {
  if (result.error) {
    console.error('Query error:', result.error);
    return null;
  }
  return result.data;
};
