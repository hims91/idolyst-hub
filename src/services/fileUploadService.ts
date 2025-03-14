
import { supabase } from '@/integrations/supabase/client';

/**
 * Upload a file to Supabase storage
 * @param file The file to upload
 * @param path The path to store the file (e.g. 'avatars', 'posts')
 * @returns The URL of the uploaded file or null if failed
 */
export const uploadFile = async (file: File, path: string = 'general'): Promise<string | null> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    // Record the file metadata
    await supabase.functions.invoke('recordMediaUpload', {
      body: {
        fileName,
        filePath,
        fileType: path,
        fileSize: file.size,
        mimeType: file.type
      }
    });
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in file upload:', error);
    return null;
  }
};

/**
 * Delete a file from Supabase storage
 * @param filePath The full path of the file to delete
 * @returns Whether the deletion was successful
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    // Delete from storage
    const { error } = await supabase.storage
      .from('media')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    // Delete record from database
    await supabase.functions.invoke('deleteMediaRecord', {
      body: { filePath }
    });
    
    return true;
  } catch (error) {
    console.error('Error in file deletion:', error);
    return false;
  }
};
