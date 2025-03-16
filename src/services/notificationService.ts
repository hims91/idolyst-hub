
import { supabase } from '@/integrations/supabase/client';
import { Notification, User } from '@/types/api';
import { formatTimeAgo } from '@/lib/utils';
import { safeQueryResult, checkTableExists } from '@/utils/supabaseHelpers';

export const getNotifications = async (limit: number = 10): Promise<Notification[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    // Check if the notifications table exists
    const tableExists = await checkTableExists('notifications');
    if (!tableExists) {
      console.error('Notifications table does not exist');
      return [];
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:sender_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    // Format notifications
    const formattedNotifications: Notification[] = data.map((notification): Notification => {
      // Safely handle sender data
      const senderData = notification.sender ? notification.sender : null;
      
      // Validate notification type against the expected union type
      const validTypes: Array<Notification['type']> = ['follow', 'like', 'comment', 'message', 'event', 'badge', 'system'];
      const validatedType = validTypes.includes(notification.type as any) 
        ? notification.type as Notification['type'] 
        : 'system';
          
      return {
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: validatedType,
        isRead: notification.is_read,
        createdAt: notification.created_at,
        timeAgo: formatTimeAgo(notification.created_at),
        linkTo: notification.link_to || '',
        upvotes: 0,  // These fields are required by the Notification type but not in DB
        downvotes: 0,
        isUpvoted: false,
        isDownvoted: false,
        author: {
          id: senderData?.id || '',
          name: senderData?.name || 'System',
          avatar: senderData?.avatar || '',
          role: senderData?.role || 'system'
        },
        sender: senderData ? {
          id: senderData.id || '',
          name: senderData.name || 'Unknown',
          avatar: senderData.avatar || '',
          role: senderData.role || 'user'
        } : undefined
      };
    });
    
    return formattedNotifications;
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
  type: Notification['type'],
  linkTo?: string,
  senderId?: string
): Promise<boolean> => {
  try {
    // Validate notification type
    if (!isValidNotificationType(type)) {
      console.error('Invalid notification type:', type);
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type, 
        link_to: linkTo,
        sender_id: senderId,
        is_read: false
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
