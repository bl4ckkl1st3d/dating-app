// src/services/message.service.ts
import api, { SERVER_BASE_URL } from '../lib/api'; //
import axios, { AxiosError } from 'axios'; // Correct
import { UserProfile } from './user.service'; // Assuming UserProfile is exported

// Extend UserProfile or create a specific Match interface if backend provides more
export interface MatchData extends UserProfile {
  matchId: number; // The ID of the match itself
  otherUserId: number; // The ID of the matched user
  lastMessage?: string;
  lastMessageTimestamp?: string;
  isLastMessageUnread?: boolean; // Provided by backend
  // Use profile_picture_url from UserProfile
}

export interface MessageData {
  id: number;
  senderId: number; // ID of the user who sent the message
  receiverId: number; // ID of the user who received the message
  content: string;
  sentAt: string; // ISO timestamp string
  read: boolean;
}
interface GetMessagesResponse {
  messages: MessageData[];
  lastReadByOtherId: number | null;
}

// Helper to construct full image URL (can be shared or duplicated)
const getFullImageUrl = (relativePath: string | null | undefined): string => {
    if (!relativePath) {
      return 'https://static.vecteezy.com/system/resources/previews/036/594/092/original/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg'; // Default placeholder
    }
    if (relativePath.startsWith('http:') || relativePath.startsWith('https:') || relativePath.startsWith('blob:')) {
      return relativePath;
    }
    return `${SERVER_BASE_URL}${relativePath}`; //
};


export const messageService = {
  /**
   * Fetches all matches for the current user.
   */
  async getMatches(): Promise<MatchData[]> {
    try {
      console.log('🌐 [MsgService] Fetching matches...');
      // *** USE CORRECT ENDPOINT ***
      const response = await api.get<{ matches: any[] }>('/matches'); // Endpoint is now GET /api/matches
      console.log(`✅ [MsgService] Received ${response.data.matches.length} matches.`);

      // Map backend data to MatchData interface
      return response.data.matches.map((match: any): MatchData => ({
        matchId: match.match_id, // Adjust field names based on controller SQL
        otherUserId: match.other_user_id,
        id: match.other_user_id,
        name: match.name,
        profile_picture_url: match.profile_picture_url,
        imageUrl: getFullImageUrl(match.profile_picture_url),
        lastMessage: match.last_message_content || 'No messages yet',
        lastMessageTimestamp: match.last_message_sent_at,
        // Backend now provides correct boolean flag
        isLastMessageUnread: match.is_last_message_read_by_current_user === true // Explicitly check for false
      }));
    } catch (error) {
       const axiosError = error as AxiosError;
      console.error('❌ [MsgService] Failed to fetch matches:', axiosError.message);
      // Handle error (e.g., check status code)
      return [];
    }
  },

  /**
   * Fetches messages for a specific match.
   */
async getMessages(matchId: number): Promise<GetMessagesResponse> { // <-- Update return type
    try {
      console.log(`🌐 [MsgService] Fetching messages for match ${matchId}...`);
      // Backend now returns { messages: [], lastReadByOtherId: number | null }
      const response = await api.get<{ messages: any[], lastReadByOtherId: number | null }>(`/messages/${matchId}`);
      console.log(`✅ [MsgService] Received ${response.data.messages.length} messages for match ${matchId}. Last read by other: ${response.data.lastReadByOtherId}`);

       const messages = response.data.messages.map((msg: any): MessageData => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        sentAt: msg.sent_at,
        read: msg.read
       })).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

       // Return both messages and the last read ID
       return {
           messages: messages,
           lastReadByOtherId: response.data.lastReadByOtherId
       };

    } catch (error) {
       const axiosError = error as AxiosError;
       console.error(`❌ [MsgService] Failed to fetch messages for match ${matchId}:`, axiosError.message);
       // Return empty state on error
       return { messages: [], lastReadByOtherId: null };
    }
  },

  /**
   * Sends a message within a match.
   */
  async sendMessage(matchId: number, content: string): Promise<MessageData | null> {
    try {
      console.log(`🌐 [MsgService] Sending message to match ${matchId}...`);
      // *** USE CORRECT ENDPOINT ***
      const response = await api.post<{ message: any }>(`/messages/${matchId}`, { content }); // Endpoint is now POST /api/messages/:matchId
      console.log(`✅ [MsgService] Message sent successfully to match ${matchId}.`);
      const sentMsg = response.data.message;
        return {
            id: sentMsg.id,
            senderId: sentMsg.sender_id,
            receiverId: sentMsg.receiver_id,
            content: sentMsg.content,
            sentAt: sentMsg.sent_at,
            read: sentMsg.read
        };
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`❌ [MsgService] Failed to send message to match ${matchId}:`, axiosError.message);
        // Handle error
        return null;
    }
},

  /**
   * Marks messages in a chat as read.
   */
  async markMessagesRead(matchId: number): Promise<void> {
    try {
      console.log(`🌐 [MsgService] Marking messages as read for match ${matchId}...`);
      // *** USE CORRECT ENDPOINT ***
      await api.post(`/messages/${matchId}/read`); // Endpoint is now POST /api/messages/:matchId/read
      console.log(`✅ [MsgService] Messages marked as read for match ${matchId}.`);
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`❌ [MsgService] Failed to mark messages read for match ${matchId}:`, axiosError.message);
        // Handle error
    }
  },

  /**
   * Unmatches a user.
   */
   async unmatchUser(matchId: number): Promise<boolean> {
     try {
       console.log(`🌐 [MsgService] Unmatching user for match ${matchId}...`);
       // *** USE CORRECT ENDPOINT ***
       await api.delete(`/matches/${matchId}`); // Endpoint is now DELETE /api/matches/:matchId
       console.log(`✅ [MsgService] Successfully unmatched user for match ${matchId}.`);
       return true;
     } catch (error) {
       const axiosError = error as AxiosError;
       console.error(`❌ [MsgService] Failed to unmatch user for match ${matchId}:`, axiosError.message);
        // Handle error
       return false;
     }
   }
};