import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, User } from '@/types/api';
import { safeGetProperty } from '@/utils/supabaseHelpers';

// Get messages for a conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        is_read,
        sender:sender_id (id, name, avatar, role)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    const messages: Message[] = (data || []).map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: '', // This should be updated based on your logic
      content: msg.content,
      createdAt: msg.created_at,
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
    console.error('Error in getMessages:', error);
    return [];
  }
};

// Send a message
export const sendMessage = async (conversationId: string, senderId: string, content: string): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        created_at: new Date().toISOString(),
        is_read: false
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        is_read,
        sender:sender_id (id, name, avatar, role)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    const message: Message = {
      id: data.id,
      senderId: data.sender_id,
      receiverId: '', // This should be updated based on your logic
      content: data.content,
      createdAt: data.created_at,
      isRead: data.is_read,
      sender: data.sender ? {
        id: safeGetProperty(data.sender, 'id', ''),
        name: safeGetProperty(data.sender, 'name', 'Unknown User'),
        avatar: safeGetProperty(data.sender, 'avatar', ''),
        role: safeGetProperty(data.sender, 'role', 'user')
      } : undefined
    };

    return message;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
};

// Fix conversationsWithParticipants function
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        updated_at,
        participants:conversation_participants(
          user_id,
          user:user_id(id, name, avatar, role)
        ),
        last_message:messages(
          id,
          content,
          created_at,
          is_read,
          sender:sender_id(id, name, avatar, role)
        )
      `)
      .order('updated_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return [];
    }

    // Safely process conversations data
    const conversations: Conversation[] = [];
    
    if (Array.isArray(conversationsData)) {
      for (const conversation of conversationsData) {
        // Check if participants is an array and contains data
        const participantIds: string[] = [];
        const participants: User[] = [];
        
        if (Array.isArray(conversation.participants)) {
          for (const p of conversation.participants) {
            if (p.user_id) {
              participantIds.push(p.user_id);
            }
            
            if (p.user) {
              participants.push({
                id: safeGetProperty(p.user, 'id', ''),
                name: safeGetProperty(p.user, 'name', 'Unknown User'),
                avatar: safeGetProperty(p.user, 'avatar', ''),
                role: safeGetProperty(p.user, 'role', 'user')
              });
            }
          }
        }
        
        // Process last message if available
        let lastMessage = undefined;
        if (Array.isArray(conversation.last_message) && conversation.last_message.length > 0) {
          const msg = conversation.last_message[0];
          lastMessage = {
            id: msg.id,
            content: msg.content,
            createdAt: msg.created_at,
            senderId: msg.sender ? safeGetProperty(msg.sender, 'id', '') : '',
            isRead: msg.is_read,
            sender: msg.sender ? {
              id: safeGetProperty(msg.sender, 'id', ''),
              name: safeGetProperty(msg.sender, 'name', 'Unknown User'),
              avatar: safeGetProperty(msg.sender, 'avatar', ''),
              role: safeGetProperty(msg.sender, 'role', 'user')
            } : undefined
          };
        }
        
        conversations.push({
          id: conversation.id,
          participantIds: participantIds,
          participants: participants,
          lastMessage: lastMessage,
          unreadCount: 0, // Calculate this separately if needed
          updatedAt: conversation.updated_at
        });
      }
    }

    return conversations;
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};

// Fix the createConversation function
export const createConversation = async (participantIds: string[]): Promise<string | null> => {
  if (!participantIds || participantIds.length < 2) {
    console.error('At least 2 participants are required to create a conversation');
    return null;
  }

  try {
    // Create the conversation first
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select('id')
      .single();

    if (conversationError || !conversationData) {
      console.error('Error creating conversation:', conversationError);
      return null;
    }

    const conversationId = conversationData.id;

    // Add participants
    const participantsData = participantIds.map(userId => ({
      conversation_id: conversationId,
      user_id: userId
    }));

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantsData);

    if (participantsError) {
      console.error('Error adding participants to conversation:', participantsError);
      // Clean up the conversation if participants couldn't be added
      await supabase.from('conversations').delete().eq('id', conversationId);
      return null;
    }

    return conversationId;
  } catch (error) {
    console.error('Error in createConversation:', error);
    return null;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    return false;
  }
};
