// src/services/user.service.ts
import api, { SERVER_BASE_URL } from '../lib/api';

// Define the structure of a user profile based on your backend/database
// We'll use the structure from AuthContext for now, add imageUrl if needed
interface UserProfile {
  id: number;
  email?: string; // May not need email on frontend for swiping
  name: string;
  age?: number;
  bio?: string;
  profile_picture_url?: string; // Adjust field name if needed
  // Add imageUrl based on how profile pictures are handled
  imageUrl?: string;
  matchId?: number;
}
const getFullImageUrl = (relativePath: string | null | undefined): string => {
    if (!relativePath) {
      return 'https://via.placeholder.com/400?text=No+Image'; // Default placeholder
    }
    if (relativePath.startsWith('http:') || relativePath.startsWith('https:')) {
      return relativePath; // Already a full URL
    }
    // Prepend server base URL for relative paths from backend
    return `${SERVER_BASE_URL}${relativePath}`;
};
export const userService = {
  /**
   * Fetches potential matches for the current user.
   * The backend needs to implement this logic.
   */
  async getPotentialMatches(): Promise<UserProfile[]> {
    try {
      console.log('🌐 [UserService] Fetching potential matches...');
      // NOTE: '/users/potential-matches' endpoint needs to be created on the backend
      const response = await api.get<{ users: UserProfile[] }>('/users/potential-matches');
      console.log('✅ [UserService] Received potential matches:', response.data.users.length);

      // --- TODO: Map backend data if necessary ---
      // If the backend returns profile_picture_url but SwipeCard expects imageUrl, map it here.
      // Example mapping:
      const mappedUsers = response.data.users.map(user => ({
         ...user,
         // Assuming SwipeCard expects 'imageUrl' and backend provides 'profile_picture_url'
         imageUrl: getFullImageUrl(user.profile_picture_url), 
      }));
      return mappedUsers;
      // return response.data.users; // Use this if no mapping is needed

    } catch (error) {
      console.error('❌ [UserService] Failed to fetch potential matches:', error);
      // Return empty array or re-throw error based on how you want to handle errors
      return [];
    }
  },

  /**
   * Records a swipe action for the current user.
   * The backend needs to implement this logic.
   */
  async recordSwipe(swipedUserId: number, isLike: boolean): Promise<{ isMatch: boolean }> { // <-- UPDATED return type
    try {
      console.log(`🌐 [UserService] Recording swipe: User ${swipedUserId}, Like: ${isLike}`);
      // Expect the backend endpoint /users/swipe to return { isMatch: boolean }
      const response = await api.post<{ isMatch: boolean }>('/users/swipe', { swipedUserId, isLike }); //
      console.log(`✅ [UserService] Swipe recorded for User ${swipedUserId}. Match status: ${response.data.isMatch}`);
      return response.data; // <-- RETURN the response data
    } catch (error) {
      console.error(`❌ [UserService] Failed to record swipe for User ${swipedUserId}:`, error);
      // Return a default object indicating no match on error
      return { isMatch: false };
    }
  },
  async getPendingMatch(): Promise<UserProfile | null> {
    try {
      console.log('🌐 [UserService] Checking for pending match...');
      const response = await api.get<{ match: UserProfile | null }>('/users/pending-match'); // Updated endpoint

      if (response.data.match) {
        console.log('✅ [UserService] Pending match found:', response.data.match.name);
        // Ensure the imageUrl is constructed correctly for the returned match
        return {
            ...response.data.match,
            imageUrl: getFullImageUrl(response.data.match.profile_picture_url)
        };
      } else {
        console.log('ℹ️ [UserService] No pending matches found.');
        return null;
      }
    } catch (error) {
      console.error('❌ [UserService] Failed to fetch pending match:', error);
      return null; // Return null on error
    }
  },

  /**
   * Marks a match notification as seen.
   */
  async markMatchAsSeen(matchId: number): Promise<void> {
    try {
      console.log(`🌐 [UserService] Marking match ${matchId} as seen...`);
      await api.post('/users/mark-match-seen', { matchId }); // Updated endpoint
      console.log(`✅ [UserService] Match ${matchId} marked as seen.`);
    } catch (error) {
      console.error(`❌ [UserService] Failed to mark match ${matchId} as seen:`, error);
      // Decide if you need to handle this error (e.g., retry later)
    }
  },

};

// Re-export the UserProfile type if needed elsewhere
export type { UserProfile };