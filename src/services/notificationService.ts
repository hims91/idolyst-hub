import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/api';
import { safeGetProperty } from '@/utils/supabaseHelpers';

// Define valid notification types
const validNotificationTypes = [
  'follow', 'like', 'comment', 'message', 'event', 'badge', 'system'
] as const;

type ValidNotificationType = typeof validNotificationTypes[number];

// Helper function to validate notification type
const isValidNotificationType = (type: string): type is ValidNotificationType => {
  return validNotificationTypes.includes(type as ValidNotificationType);
};

// Get notifications for a user
export const getNotifications = async (limit = 10, offset = 0): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        title,
        message,
        type,
        is_read,
        created_at,
        link_to,
        sender:sender_id(id, name, avatar, role)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    const notifications = (data || []).map(notification => {
      // Ensure type is a valid notification type
      const type = isValidNotificationType(notification.type) 
        ? notification.type as ValidNotificationType
        : 'system';

      // Extract sender data safely
      const senderData = notification.sender;

      return {
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: type,
        isRead: notification.is_read,
        createdAt: notification.created_at,
        linkTo: notification.link_to || '',
        sender: senderData ? {
          id: safeGetProperty(senderData, 'id', ''),
          name: safeGetProperty(senderData, 'name', 'Unknown User'),
          avatar: safeGetProperty(senderData, 'avatar', ''),
          role: safeGetProperty(senderData, 'role', 'user')
        } : undefined
      };
    });

    return notifications;
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return 0;
    }
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
      
    if (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadNotificationCount:', error);
    return 0;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
};

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
      
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return false;
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: ValidNotificationType,
  senderId?: string,
  linkTo?: string
): Promise<boolean> => {
  try {
    // Validate the type
    if (!isValidNotificationType(type)) {
      console.error(`Invalid notification type: ${type}`);
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        sender_id: senderId,
        link_to: linkTo,
        is_read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return false;
  }
};

export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return false;
  }
};

export const notificationService = {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  deleteNotification
};

export default notificationService;
