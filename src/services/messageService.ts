import { supabase } from '@/integrations/supabase/client';
import { Message, Conversation, User } from '@/types/api';
import { formatTimeAgo } from '@/lib/utils';
import { safeGetProperty } from '@/utils/supabaseHelpers';

// Add this safe access pattern for all the places with errors:
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation:conversation_id (
          id,
          created_at,
          updated_at,
          participants:conversation_participants (
            user_id,
            user:user_id (
              id,
              name,
              avatar,
              role
            )
          ),
          last_message:messages (
            id,
            content,
            created_at,
            is_read,
            sender:sender_id (
              id,
              name,
              avatar,
              role
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('conversation.updated_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
    
    // Format conversations
    const conversations: Conversation[] = data.map(item => {
      const conv = item.conversation;
      
      if (!conv) return null;
      
      // Filter out the current user from participants
      const otherParticipants = (conv.participants || [])
        .filter(p => p.user_id !== user.id)
        .map(p => {
          const userData = p.user || { id: p.user_id, name: 'Unknown User', avatar: '', role: 'user' };
          return {
            id: safeGetProperty(userData, 'id', p.user_id),
            name: safeGetProperty(userData, 'name', 'Unknown User'),
            avatar: safeGetProperty(userData, 'avatar', ''),
            role: safeGetProperty(userData, 'role', 'user')
          };
        });
        
      // Get last message
      const lastMessage = conv.last_message && conv.last_message.length > 0 
        ? conv.last_message[0] 
        : null;
        
      // Generate a list of participant IDs for easier filtering
      const participantIds = (conv.participants || []).map(p => p.user_id);
        
      return {
        id: conv.id,
        participantIds: participantIds,
        participants: otherParticipants,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.created_at,
          senderId: safeGetProperty(lastMessage.sender, 'id', ''),
          isRead: lastMessage.is_read,
          sender: lastMessage.sender ? {
            id: safeGetProperty(lastMessage.sender, 'id', ''),
            name: safeGetProperty(lastMessage.sender, 'name', 'Unknown User'),
            avatar: safeGetProperty(lastMessage.sender, 'avatar', ''),
            role: safeGetProperty(lastMessage.sender, 'role', 'user')
          } : undefined
        } : undefined,
        unreadCount: 0, // Will be filled later
        updatedAt: conv.updated_at
      };
    }).filter(Boolean) as Conversation[];
    
    // Now get unread counts for each conversation
    await Promise.all(conversations.map(async (conversation) => {
      const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', user.id)
        .eq('is_read', false);
        
      if (!countError) {
        conversation.unreadCount = count || 0;
      }
    }));
    
    return conversations;
  } catch (error) {
    console.error("Error in getConversations:", error);
    throw error;
  }
};

// Fix the createConversation function to not use participant_ids
export const createConversation = async (participantIds: string[]): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Create conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();
      
    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      throw conversationError;
    }
    
    // Add participants
    const allParticipants = [...new Set([...participantIds, user.id])];
    
    const participantsToInsert = allParticipants.map(participantId => ({
      conversation_id: conversationData.id,
      user_id: participantId
    }));
    
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantsToInsert);
      
    if (participantsError) {
      console.error("Error adding participants:", participantsError);
      throw participantsError;
    }
    
    return conversationData.id;
  } catch (error) {
    console.error("Error in createConversation:", error);
    throw error;
  }
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        is_read,
        sender:sender_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
    
    // Mark messages as read if they are not sent by the current user
    const unreadMessages = data.filter(msg => msg.sender_id !== user.id && !msg.is_read);
    
    if (unreadMessages.length > 0) {
      const unreadMessageIds = unreadMessages.map(msg => msg.id);
      
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessageIds);
        
      if (updateError) {
        console.error("Error marking messages as read:", updateError);
      }
    }
    
    // Format messages
    const messages: Message[] = data.map(msg => ({
      id: msg.id,
      content: msg.content,
      createdAt: msg.created_at,
      senderId: msg.sender_id,
      receiverId: user.id,
      isRead: msg.is_read,
      sender: msg.sender ? {
        id: safeGetProperty(msg.sender, 'id', ''),
        name: safeGetProperty(msg.sender, 'name', 'Unknown User'),
        avatar: safeGetProperty(msg.sender, 'avatar', ''),
        role: safeGetProperty(msg.sender, 'role', 'user')
      } : undefined
    }));
    
    return messages;
  } catch (error) {
    console.error("Error in getMessages:", error);
    throw error;
  }
};

export const sendMessage = async (conversationId: string, content: string): Promise<Message> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content
      })
      .select(`
        id,
        content,
        created_at,
        sender_id,
        is_read,
        sender:sender_id (
          id,
          name,
          avatar,
          role
        )
      `)
      .single();
      
    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }
    
    return {
      id: data.id,
      content: data.content,
      createdAt: data.created_at,
      senderId: data.sender_id,
      receiverId: user.id,
      isRead: data.is_read,
      sender: data.sender ? {
        id: safeGetProperty(data.sender, 'id', ''),
        name: safeGetProperty(data.sender, 'name', 'Unknown User'),
        avatar: safeGetProperty(data.sender, 'avatar', ''),
        role: safeGetProperty(data.sender, 'role', 'user')
      } : undefined
    };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

export const messageService = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage
};

export default messageService;
