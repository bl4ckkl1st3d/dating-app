// src/services/user.service.ts
import api, { SERVER_BASE_URL } from '../lib/api'; //
// NOTE: We cannot use useAuth hook here. currentUserAge must be passed in.

// Define the structure of a user profile
interface UserProfile {
  id: number;
  email?: string;
  name: string;
  age?: number;
  bio?: string;
  profile_picture_url?: string;
  imageUrl?: string;
  matchId?: number;
}

// Interface for filter options, including the current user's age for default calculation
interface PotentialMatchesFilters {
    minAge?: number;
    maxAge?: number;
    currentUserAge?: number; // Needed for default calculation
}

// Helper to construct full image URL
const getFullImageUrl = (relativePath: string | null | undefined): string => {
    if (!relativePath) {
      // Consider a more appropriate default placeholder image
      return 'https://static.vecteezy.com/system/resources/previews/036/594/092/original/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg';
    }
    if (relativePath.startsWith('http:') || relativePath.startsWith('https:') || relativePath.startsWith('blob:')) {
      return relativePath; // Already a full URL
    }
    // Prepend server base URL for relative paths from backend
    return `${SERVER_BASE_URL}${relativePath}`;
};

export const userService = {
  /**
   * Fetches potential matches for the current user, applying age filters.
   * If filters are not provided, defaults to +/- 3 years around the current user's age.
   */
  async getPotentialMatches(filters?: PotentialMatchesFilters): Promise<UserProfile[]> {
    let finalMinAge: number | undefined = filters?.minAge;
    let finalMaxAge: number | undefined = filters?.maxAge;
    const currentUserAge = filters?.currentUserAge;

    // --- Default Age Filter Logic ---
    // Apply default only if BOTH minAge and maxAge are NOT explicitly provided
    if (finalMinAge === undefined && finalMaxAge === undefined && currentUserAge !== undefined && currentUserAge > 0) {
        console.log(`[UserService] No filters provided, calculating default based on user age: ${currentUserAge}`);
        finalMinAge = Math.max(18, currentUserAge - 3); // Ensure minimum age is 18
        finalMaxAge = Math.min(100, currentUserAge + 3); // Ensure maximum age is 100 (or adjust as needed)
        console.log(`[UserService] Default age range: ${finalMinAge} - ${finalMaxAge}`);
    }
    // --- End Default Logic ---

    try {
      // --- Build Query String ---
      const params = new URLSearchParams();
      if (finalMinAge !== undefined) {
          params.append('minAge', finalMinAge.toString());
      }
      if (finalMaxAge !== undefined) {
          params.append('maxAge', finalMaxAge.toString());
      }
      const queryString = params.toString();
      const apiUrl = `/users/potential-matches${queryString ? `?${queryString}` : ''}`;
      // --- End Build Query String ---

      console.log(`🌐 [UserService] Fetching potential matches from: ${apiUrl}`);
      const response = await api.get<{ users: UserProfile[] }>(apiUrl); // Use the constructed URL
      console.log(`✅ [UserService] Received ${response.data.users.length} potential matches.`);

      // Map backend data to include the full imageUrl
      const mappedUsers = response.data.users.map(user => ({
         ...user,
         imageUrl: getFullImageUrl(user.profile_picture_url), //
      }));
      return mappedUsers;

    } catch (error) {
      console.error('❌ [UserService] Failed to fetch potential matches:', error);
      return []; // Return empty array on error
    }
  },

  // --- Other service methods (recordSwipe, getPendingMatch, markMatchAsSeen) remain the same ---
  //
  async recordSwipe(swipedUserId: number, isLike: boolean): Promise<{ isMatch: boolean; matchId?: number }> {
    try {
      console.log(`🌐 [UserService] Recording swipe: User ${swipedUserId}, Like: ${isLike}`);
      const response = await api.post<{ isMatch: boolean; matchId?: number }>('/users/swipe', { swipedUserId, isLike }); //
      console.log(`✅ [UserService] Swipe recorded for User ${swipedUserId}. Match status: ${response.data.isMatch}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [UserService] Failed to record swipe for User ${swipedUserId}:`, error);
      return { isMatch: false }; // Return default on error
    }
  },

  async getPendingMatch(): Promise<UserProfile | null> {
    try {
      console.log('🌐 [UserService] Checking for pending match...');
      const response = await api.get<{ match: UserProfile | null }>('/users/pending-match'); //
      if (response.data.match) {
        console.log('✅ [UserService] Pending match found:', response.data.match.name);
        return {
            ...response.data.match,
            imageUrl: getFullImageUrl(response.data.match.profile_picture_url) //
        };
      } else {
        console.log('ℹ️ [UserService] No pending matches found.');
        return null;
      }
    } catch (error) {
      console.error('❌ [UserService] Failed to fetch pending match:', error);
      return null;
    }
  },

  async markMatchAsSeen(matchId: number): Promise<void> {
    try {
      console.log(`🌐 [UserService] Marking match ${matchId} as seen...`);
      await api.post('/users/mark-match-seen', { matchId }); //
      console.log(`✅ [UserService] Match ${matchId} marked as seen.`);
    } catch (error) {
      console.error(`❌ [UserService] Failed to mark match ${matchId} as seen:`, error);
    }
  },

};

// Re-export the UserProfile type
export type { UserProfile, PotentialMatchesFilters }; // Export the filters type too