
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a table exists in Supabase
 * @param tableName The name of the table to check
 * @returns Promise<boolean> True if the table exists
 */
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Try to select a single row from the table with a limit of 1
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    // If there's an error about the table not existing, return false
    if (error && error.message.includes("does not exist")) {
      return false;
    }
    
    // If we got here, the table exists (even if it's empty)
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

/**
 * Safely executes a Supabase query, catching errors specifically related to missing tables
 * @param operation Function that performs the Supabase operation
 * @param fallbackValue Value to return if the table doesn't exist
 * @returns The result of the operation or the fallback value
 */
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  tableName?: string
): Promise<T> => {
  try {
    // Check if the table exists if a table name is provided
    if (tableName) {
      const exists = await checkTableExists(tableName);
      if (!exists) {
        console.warn(`Table ${tableName} does not exist. Using fallback value.`);
        return fallbackValue;
      }
    }
    
    return await operation();
  } catch (error: any) {
    // Check if the error is specifically about the table not existing
    if (error.message && error.message.includes("does not exist")) {
      console.warn(`Table does not exist. Using fallback value.`);
      return fallbackValue;
    }
    
    // For any other errors, log them and return the fallback
    console.error("Error in Supabase operation:", error);
    return fallbackValue;
  }
};

/**
 * Safe wrapper for Supabase query results that may contain errors
 * @param value The query result or error
 * @param defaultValue Default value to return if result contains an error
 * @returns The safe value or default
 */
export const safeQueryResult = <T>(
  value: T | { code?: string; message?: string }, 
  defaultValue: T
): T => {
  if (!value || typeof value !== 'object' || 'code' in value || 'message' in value) {
    return defaultValue;
  }
  return value as T;
};

/**
 * Checks if a database column exists in a table
 * @param tableName The name of the table
 * @param columnName The name of the column to check
 * @returns Promise<boolean> True if the column exists in the table
 */
export const checkColumnExists = async (
  tableName: string, 
  columnName: string
): Promise<boolean> => {
  try {
    // Create a dynamic query to check if the column exists
    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        AND column_name = '${columnName}'
      );
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { query });
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
    return false;
  }
};
