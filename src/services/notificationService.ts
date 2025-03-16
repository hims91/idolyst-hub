import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/api";
import { formatTimeAgo } from "@/lib/utils";
import { safeSupabaseOperation, checkTableExists } from "@/utils/supabaseHelpers";

// Get notifications for the current user
export const getNotifications = async (limit: number = 20): Promise<Notification[]> => {
  try {
    const user = (await supabase.auth.getSession()).data.session?.user;
    
    if (!user) {
      return [];
    }
    
    // Check if the notifications table exists
    const notificationsExist = await checkTableExists('notifications');
    if (!notificationsExist) {
      console.warn("Notifications table does not exist");
      return [];
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:sender_id(
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
      console.error("Error fetching notifications:", error);
      throw error;
    }
    
    return data.map(notification => {
      // Process sender data if available
      let sender = undefined;
      if (notification.sender && typeof notification.sender === 'object' && !('code' in notification.sender)) {
        sender = {
          id: notification.sender.id,
          name: notification.sender.name || 'Unknown User',
          avatar: notification.sender.avatar || '',
          role: notification.sender.role || 'member'
        };
      }
      
      return {
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.is_read,
        createdAt: notification.created_at,
        linkTo: notification.link_to,
        sender
      };
    });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    if (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    return false;
  }
};

// Setup real-time notifications
export const setupNotificationListener = (
  callback: (notification: Notification) => void
): (() => void) => {
  try {
    const user = supabase.auth.getUser();
    
    if (!user) {
      console.error("Cannot setup notification listener: User not authenticated");
      return () => {};
    }
    
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.data.user?.id}`
        },
        async (payload) => {
          const newNotification = payload.new as any;
          
          // Fetch sender details if available
          let sender = undefined;
          if (newNotification.sender_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('id, name, avatar, role')
              .eq('id', newNotification.sender_id)
              .single();
            
            if (userData) {
              sender = {
                id: userData.id,
                name: userData.name || 'Unknown User',
                avatar: userData.avatar || '',
                role: userData.role || 'member'
              };
            }
          }
          
          // Format notification
          const notification: Notification = {
            id: newNotification.id,
            userId: newNotification.user_id,
            title: newNotification.title,
            message: newNotification.message,
            type: newNotification.type,
            isRead: newNotification.is_read,
            createdAt: newNotification.created_at,
            linkTo: newNotification.link_to,
            sender
          };
          
          callback(notification);
        }
      )
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error("Error setting up notification listener:", error);
    return () => {};
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      return 0;
    }
    
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    if (error) {
      console.error("Error fetching unread notification count:", error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("Error in getUnreadNotificationCount:", error);
    return 0;
  }
};

// Add createNotification function to create notifications
export const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type: 'follow' | 'like' | 'comment' | 'message' | 'event' | 'badge' | 'system';
  linkTo?: string;
  senderId?: string;
}): Promise<boolean> => {
  return safeSupabaseOperation(async () => {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        is_read: false,
        link_to: data.linkTo,
        sender_id: data.senderId,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }
    
    return true;
  }, false, 'notifications');
};

// Add notifyFollowers function to send notifications to followers
export const notifyFollowers = async (
  userId: string,
  title: string,
  message: string,
  type: 'follow' | 'like' | 'comment' | 'message' | 'event' | 'badge' | 'system',
  linkTo?: string
): Promise<boolean> => {
  return safeSupabaseOperation(async () => {
    // First check if user_followers table exists
    const followersExist = await checkTableExists('user_followers');
    if (!followersExist) {
      console.warn("user_followers table does not exist");
      return false;
    }
    
    // Get all followers of the user
    const { data: followers, error } = await supabase
      .from('user_followers')
      .select('follower_id')
      .eq('following_id', userId);
      
    if (error) {
      console.error('Error fetching followers:', error);
      return false;
    }
    
    if (!followers || followers.length === 0) {
      console.log('No followers to notify');
      return true;
    }
    
    // Create notifications for each follower
    const notificationPromises = followers.map(follower => 
      createNotification({
        userId: follower.follower_id,
        title,
        message,
        type,
        linkTo,
        senderId: userId
      })
    );
    
    await Promise.all(notificationPromises);
    return true;
  }, false);
};

export const notificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setupNotificationListener,
  getUnreadNotificationCount,
  createNotification,
  notifyFollowers
};

export default notificationService;
