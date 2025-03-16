
import { supabase } from "@/integrations/supabase/client";
import { Message, Conversation, User } from "@/types/api";
import { formatTimeAgo } from "@/lib/utils";

// Get all conversations for the current user
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get conversations where the current user is a participant
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user_id,
          user:user_id(
            id,
            name,
            avatar,
            role
          )
        ),
        last_message:messages(
          id,
          content,
          created_at,
          sender_id,
          is_read
        )
      `)
      .contains('participant_ids', [user.id])
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Process the data to format it correctly
    return data.map(conv => {
      // Filter out current user from participants
      const otherParticipants = conv.participants
        .filter(p => p.user_id !== user.id)
        .map(p => {
          // Handle case where user might be null or an error
          if (!p.user || (typeof p.user === 'object' && 'code' in p.user)) {
            return {
              id: p.user_id,
              name: 'Unknown User',
              avatar: '',
              role: 'member'
            };
          }
          
          return {
            id: p.user.id,
            name: p.user.name || 'Unknown User',
            avatar: p.user.avatar || '',
            role: p.user.role || 'member'
          };
        });
      
      // Format last message
      let lastMessage: Message | undefined = undefined;
      if (conv.last_message && conv.last_message.length > 0) {
        const msg = conv.last_message[0];
        lastMessage = {
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: conv.participant_ids.find(id => id !== msg.sender_id) || '',
          content: msg.content,
          createdAt: msg.created_at,
          isRead: msg.is_read
        };
      }
      
      // Count unread messages
      const unreadCount = conv.last_message ? 
        conv.last_message.filter(m => !m.is_read && m.sender_id !== user.id).length : 0;
      
      return {
        id: conv.id,
        participantIds: conv.participant_ids,
        lastMessage,
        unreadCount,
        updatedAt: conv.updated_at,
        participants: otherParticipants
      };
    });
  } catch (error) {
    console.error("Error in getConversations:", error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Check if user is a participant in this conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('participant_ids')
      .eq('id', conversationId)
      .single();
    
    if (convError || !convData || !convData.participant_ids.includes(user.id)) {
      throw new Error("Unauthorized to access this conversation");
    }
    
    // Get messages
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(
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
    
    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false);
    
    return data.map(msg => {
      // Handle case where sender might be null or an error
      let sender: User | undefined = undefined;
      if (msg.sender && !(typeof msg.sender === 'object' && 'code' in msg.sender)) {
        sender = {
          id: msg.sender.id,
          name: msg.sender.name || 'Unknown User',
          avatar: msg.sender.avatar || '',
          role: msg.sender.role || 'member'
        };
      }
      
      return {
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: convData.participant_ids.find(id => id !== msg.sender_id) || '',
        content: msg.content,
        createdAt: msg.created_at,
        isRead: msg.is_read,
        sender
      };
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  recipientId: string,
  content: string
): Promise<Message | null> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Check if user can message the recipient (following relationship)
    const { count, error: followError } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact' })
      .eq('follower_id', recipientId)
      .eq('following_id', user.id);
    
    if (followError) {
      console.error("Error checking follow status:", followError);
      throw new Error("Could not verify follow status");
    }
    
    if (count === 0) {
      throw new Error("You can only message users who follow you");
    }
    
    // Find or create conversation
    let conversationId: string;
    
    // Check if conversation already exists
    const { data: existingConv, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .contains('participant_ids', [user.id, recipientId])
      .eq('is_group', false)
      .single();
    
    if (convError && convError.code !== 'PGRST116') {
      console.error("Error checking existing conversation:", convError);
      throw new Error("Could not check existing conversations");
    }
    
    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_ids: [user.id, recipientId],
          is_group: false,
          created_by: user.id
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error("Error creating conversation:", createError);
        throw new Error("Could not create conversation");
      }
      
      conversationId = newConv.id;
      
      // Add participants
      const participants = [
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: recipientId }
      ];
      
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participants);
      
      if (participantError) {
        console.error("Error adding participants:", participantError);
        throw new Error("Could not add participants to conversation");
      }
    }
    
    // Send the message
    const now = new Date().toISOString();
    
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        created_at: now,
        is_read: false
      })
      .select('id')
      .single();
    
    if (msgError) {
      console.error("Error sending message:", msgError);
      throw new Error("Could not send message");
    }
    
    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: now })
      .eq('id', conversationId);
    
    // Trigger notification
    await supabase.functions.invoke('createNotification', {
      body: {
        userId: recipientId,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${user.user_metadata?.name || 'a user'}`,
        senderId: user.id,
        linkTo: `/messages/${conversationId}`
      }
    });
    
    return {
      id: msgData.id,
      senderId: user.id,
      receiverId: recipientId,
      content,
      createdAt: now,
      isRead: false
    };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

export const messageService = {
  getConversations,
  getMessages,
  sendMessage
};

export default messageService;
