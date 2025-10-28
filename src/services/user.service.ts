// src/services/user.service.ts
import api from '../lib/api';

// Define the structure of a user profile based on your backend/database
// We'll use the structure from AuthContext for now, add imageUrl if needed
interface UserProfile {
  id: number;
  email: string; // May not need email on frontend for swiping
  name: string;
  age?: number;
  bio?: string;
  profile_picture_url?: string; // Adjust field name if needed
  // Add imageUrl based on how profile pictures are handled
  imageUrl?: string;
}

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
         imageUrl: user.profile_picture_url || 'https://via.placeholder.com/400?text=No+Image', // Provide a default image
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
  async recordSwipe(swipedUserId: number, isLike: boolean): Promise<void> {
    try {
      console.log(`🌐 [UserService] Recording swipe: User ${swipedUserId}, Like: ${isLike}`);
      // NOTE: '/users/swipe' endpoint needs to be created on the backend
      await api.post('/users/swipe', { swipedUserId, isLike });
      console.log(`✅ [UserService] Swipe recorded successfully for User ${swipedUserId}`);
    } catch (error) {
      console.error(`❌ [UserService] Failed to record swipe for User ${swipedUserId}:`, error);
      // Handle error appropriately
    }
  },
};

// Re-export the UserProfile type if needed elsewhere
export type { UserProfile };