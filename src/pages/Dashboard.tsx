// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from "react"; // Added useRef
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useAnimation,
} from "framer-motion";
import { X, Heart, Loader, MessageSquare } from "lucide-react";
import SwipeCard from "../components/SwipeCard"; //
import { userService, UserProfile,PotentialMatchesFilters } from "../services/user.service"; //
import { useAuth } from "../context/AuthContext"; //
import { SERVER_BASE_URL } from '../lib/api'; //
import { useFilters } from '../context/FilterContext';

// Helper function to construct full image URL (similar to EditProfile)
const getFullImageUrl = (relativePath: string | null | undefined): string => {
    if (!relativePath) {
      return 'https://via.placeholder.com/400?text=No+Image'; // Default placeholder
    }
    // If it's already an absolute URL (e.g., from placeholder or previous mapping)
    if (relativePath.startsWith('http:') || relativePath.startsWith('https:') || relativePath.startsWith('blob:')) {
      return relativePath;
    }
    // Prepend server base URL for relative paths from backend
    return `${SERVER_BASE_URL}${relativePath}`;
};

// --- Match Screen Component ---
const MatchScreen: React.FC<{
  currentUserProfile: UserProfile; // Renamed for clarity
  matchedUser: UserProfile; // This will now include matchId
  onClose: (matchIdToMark?: number) => void; // Pass matchId back on close
}> = ({ currentUserProfile, matchedUser, onClose }) => {
    const currentUserImageUrl = getFullImageUrl(currentUserProfile.profile_picture_url);

    // Call onClose *with* the matchId when closing
    const handleClose = () => {
        onClose(matchedUser.matchId);
    };

    return (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 z-50 flex flex-col items-center justify-center p-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-lg"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            It's a Match!
          </motion.h1>

          <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-10">
            {/* Current User Profile Pic */}
            <motion.div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <img src={currentUserImageUrl} alt={currentUserProfile.name} className="w-full h-full object-cover" />
            </motion.div>

            {/* Matched User Profile Pic */}
            <motion.div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <img src={matchedUser.imageUrl || 'https://via.placeholder.com/400?text=No+Image'} alt={matchedUser.name} className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <p className="text-xl text-white font-medium mb-10 text-center drop-shadow">
            You and {matchedUser.name} liked each other!
          </p>

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full max-w-md">
             <motion.button
                className="flex-1 bg-white text-pink-500 py-3 px-6 rounded-full font-semibold text-lg shadow-md hover:bg-gray-100 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <MessageSquare className="inline mr-2 -mt-1" size={20}/> Send a Message
              </motion.button>
              <motion.button
                onClick={handleClose} // <-- Use handleClose
                className="flex-1 bg-white/30 text-white py-3 px-6 rounded-full font-semibold text-lg shadow-md hover:bg-white/40 transition"
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 initial={{ y: 50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.7 }}
              >
                Keep Swiping
              </motion.button>
          </div>
        </motion.div>
    );
};
// --- End Match Screen Component ---


// --- SwipeCardMotion Component ---
const SwipeCardMotion: React.FC<{
  user: UserProfile;
  isTop: boolean;
  onSwipe: (dir: "left" | "right", user: UserProfile, isMatch: boolean, matchId?: number) => void; // Include matchId if backend returns it on swipe
  triggerSwipe?: { direction: "left" | "right"; execute: boolean } | null;
}> = ({ user, isTop, onSwipe, triggerSwipe }) => {
     const x = useMotionValue(0);
     const rotate = useTransform(x, [-200, 200], [-15, 15]);
     const likeOpacity = useTransform(x, [50, 150], [0, 1]);
     const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);
     const controls = useAnimation();

      const handleSwipeAction = async (direction: "left" | "right") => {
        const distance = direction === "right" ? 600 : -600;
        const rotation = direction === "right" ? 25 : -25;
        const isLike = direction === "right";
        // Initialize with default values, assuming backend might return matchId
        let matchResult: { isMatch: boolean; matchId?: number | undefined } = { isMatch: false, matchId: undefined };

        try {
            // Assume backend /swipe might return { isMatch: boolean, matchId?: number }
            const result = await userService.recordSwipe(user.id, isLike); //
            // Assign result directly if it matches the expected optional shape
            if (typeof result === 'object' && result !== null && 'isMatch' in result) {
                 matchResult = result as { isMatch: boolean, matchId?: number };
            }
            console.log(`[Swipe Action] Swipe recorded for ${user.name}. Match: ${matchResult.isMatch}`);
        } catch (err) {
            console.error("[Swipe Action] Failed to record swipe:", err);
            // On error, matchResult keeps its default { isMatch: false, matchId: undefined }
        }


        await controls.start({
          x: distance, rotate: rotation, opacity: 0, transition: { duration: 0.35 },
        });

        // Pass match status and potentially matchId
        onSwipe(direction, user, matchResult.isMatch, matchResult.matchId);
      };

     const handleDragEnd = async (_: any, info: any) => {
        if (info.offset.x > 150) await handleSwipeAction("right");
        else if (info.offset.x < -150) await handleSwipeAction("left");
        else await controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 300 } });
     };

     // Corrected useEffect dependency array usage and async call
     useEffect(() => {
        const performSwipe = async () => {
             if (isTop && triggerSwipe?.execute) {
                await handleSwipeAction(triggerSwipe.direction);
             }
        };
        performSwipe();
      }, [isTop, triggerSwipe]); // Include isTop dependency


      return (
        <motion.div
          drag={isTop ? "x" : false}
          style={{ x, rotate }}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          className="absolute w-full h-full cursor-grab"
          whileTap={{ cursor: "grabbing" }}
          animate={controls}
          onDragEnd={handleDragEnd}
        >
          <SwipeCard user={user} />
          {/* LIKE / NOPE indicators */}
          <motion.div
            className="absolute top-10 left-10 text-5xl font-bold text-green-500 rotate-[-20deg] drop-shadow-lg pointer-events-none"
            style={{ opacity: likeOpacity }}
          >
            LIKE ❤️
          </motion.div>
          <motion.div
            className="absolute top-10 right-10 text-5xl font-bold text-red-500 rotate-[20deg] drop-shadow-lg pointer-events-none"
            style={{ opacity: nopeOpacity }}
          >
            NOPE ❌
          </motion.div>
        </motion.div>
      );
};
// --- End SwipeCardMotion Component ---


// --- Dashboard Component ---
const Dashboard: React.FC = () => {
  
  const { user: currentUserData } = useAuth(); //
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [triggerSwipe, setTriggerSwipe] = useState<{ direction: "left" | "right"; execute: boolean; } | null>(null);
  const hasCheckedPendingMatchOnLoad = useRef(false); // Ref for initial load check
  const pollingIntervalRef = useRef<number | null>(null); // Ref to store interval ID
  const { filters } = useFilters();
  

  // --- Combined Effect for Initial Load and Polling ---
  useEffect(() => {
    // Function to check for pending match
    const checkPendingMatch = async () => {
        // Only check if user is logged in and match screen isn't already showing
        if (!currentUserData || matchedUser) {
            // console.log("[Polling] Skipping check: No user or match screen already visible.");
            return;
        }

        console.log("[Polling] Checking for pending match...");
        try {
            const pendingMatch = await userService.getPendingMatch(); //
            if (pendingMatch && !matchedUser) { // Check matchedUser again to prevent race condition
                console.log("[Polling] Pending match found:", pendingMatch.name);
                setMatchedUser(pendingMatch); // Show match screen
                // --- Stop polling when match screen is shown ---
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                    console.log("[Polling] Interval stopped due to match found.");
                }
            } else {
                 // console.log("[Polling] No new pending match found.");
            }
        } catch (err) {
            console.error("[Polling] Error checking for pending match:", err);
            // Decide if you want to set an error state here or just log
        }
    };

    // --- Initial Load Logic ---
// --- Initial Load Logic ---
    const initializeDashboard = async () => {
      // Include currentUserData?.age check
      if (!currentUserData || hasCheckedPendingMatchOnLoad.current) {
         // If currentUserData just loaded (was null before), ensure loading stops
         if(currentUserData && isLoading) setIsLoading(false);
         return;
      }
      console.log("[Init] Initializing dashboard...");

      // --- Prepare filters using context state ---
      const filtersToApply: PotentialMatchesFilters = {
          minAge: filters.minAge, // Get minAge from FilterContext
          maxAge: filters.maxAge, // Get maxAge from FilterContext
          currentUserAge: currentUserData?.age // Pass user's age for default calculation
      };
      // --- End prepare filters ---

      setIsLoading(true);
      setError(null);
      // Reset matchedUser ONLY on initial load
      if (!hasCheckedPendingMatchOnLoad.current) {
          setMatchedUser(null);
      }
      hasCheckedPendingMatchOnLoad.current = true; // Mark as checked for this load cycle

      try {
        await checkPendingMatch(); // Perform the check once immediately on load

        // If a match wasn't found immediately, load potential swipe users
        if (!matchedUser) { // Check the state *after* the await
            console.log('[Init] No initial pending match, fetching potential matches...');
            // --- Pass filters to the service function ---
            const fetchedUsers = await userService.getPotentialMatches(filtersToApply); // Pass filters
            // --- End pass filters ---
            setUsers(fetchedUsers);

            // Start polling only if no match was found initially
            if (!pollingIntervalRef.current && currentUserData) {
                console.log("[Polling] Starting interval after initial load...");
                pollingIntervalRef.current = setInterval(checkPendingMatch, 15000); // Check every 15 seconds
            }
        }
      } catch (err) {
        console.error("[Init] Failed to initialize dashboard:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();

    // --- Cleanup Function ---
    return () => {
        // Clear interval on unmount or when dependencies change
        if (pollingIntervalRef.current) {
            console.log("[Polling] Clearing interval in cleanup.");
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        // Reset the initial load flag when the component unmounts or user changes
        hasCheckedPendingMatchOnLoad.current = false;
    };

  // Depend on currentUserData to trigger initialization/re-initialization on login/logout.
  // DO NOT depend on matchedUser here, otherwise starting polling becomes tricky.
  }, [currentUserData, filters]);


  // handleSwipe receives match status and potentially matchId
  const handleSwipe = (direction: "left" | "right", swipedUser: UserProfile, isMatch: boolean, matchId?: number) => {
    console.log(`[Swipe Event] Swiped ${direction} on ${swipedUser.name}. Match: ${isMatch}`);
    // Remove user from the visual stack immediately
    setUsers((prev) => prev.filter((u) => u.id !== swipedUser.id));
    setTriggerSwipe(null); // Reset button swipe trigger

    if (isMatch) {
        setMatchedUser({ ...swipedUser, matchId });
        // --- Stop polling when a match occurs via swipe ---
        if (pollingIntervalRef.current) {
             clearInterval(pollingIntervalRef.current);
             pollingIntervalRef.current = null;
             console.log("[Polling] Interval stopped due to swipe match.");
        }
    }
  };

  // handleButtonSwipe (no changes)
  const handleButtonSwipe = (direction: "left" | "right") => {
    if (!isLoading && users.length > 0 && !matchedUser) { // Prevent button swipe if match screen is showing
       setTriggerSwipe({ direction, execute: true });
    }
  };

  // closeMatchScreen needs to potentially restart polling and fetch users
// --- closeMatchScreen function needs to fetch with filters too ---
  const closeMatchScreen = (matchIdToMark?: number) => {
    if (matchIdToMark) {
        userService.markMatchAsSeen(matchIdToMark).catch(err => { //
            console.error("[Match Screen] Failed to mark match as seen:", err);
        });
    }

    setMatchedUser(null);
    hasCheckedPendingMatchOnLoad.current = false; // Allow check on next full load if needed

     // --- Fetch swipe users AND Restart Polling after closing match screen ---
     const fetchAndRestartPolling = async () => {
         console.log("[Match Screen Close] Fetching swipe users and restarting polling...");

         // --- Prepare filters using context state ---
         const filtersToApply: PotentialMatchesFilters = {
             minAge: filters.minAge, // Get minAge from FilterContext
             maxAge: filters.maxAge, // Get maxAge from FilterContext
             currentUserAge: currentUserData?.age // Pass user's age for default calculation
         };
         // --- End prepare filters ---

         setIsLoading(true);
         setError(null);
         try {
             // --- Pass filters to the service function ---
             const fetchedUsers = await userService.getPotentialMatches(filtersToApply); // Pass filters
             // --- End pass filters ---
             setUsers(fetchedUsers);

             // --- Restart polling ---
             if (!pollingIntervalRef.current && currentUserData) {
                 // Define the check function again locally or ensure it's accessible
                 // Note: Moved checkPendingMatch definition outside for reusability if needed,
                 // or keep it scoped here if preferred.
                 const checkPendingMatch = async () => {
                     if (!currentUserData || matchedUser) return; // Add matchedUser check again just in case
                     console.log("[Polling] Checking for pending match (restarted)...");
                     try {
                         const pendingMatch = await userService.getPendingMatch(); //
                         if (pendingMatch && !matchedUser) { // Check matchedUser state again
                             console.log("[Polling] Pending match found (restarted):", pendingMatch.name);
                             setMatchedUser(pendingMatch);
                             if (pollingIntervalRef.current) {
                                 clearInterval(pollingIntervalRef.current);
                                 pollingIntervalRef.current = null;
                             }
                         }
                     } catch (err) { console.error("[Polling] Error checking (restarted):", err); }
                 };
                 console.log("[Polling] Restarting interval after closing match screen...");
                 pollingIntervalRef.current = setInterval(checkPendingMatch, 15000);
             }

         } catch (err) {
              console.error("Failed to fetch users after closing match:", err);
              setError("Failed to reload users.");
              setUsers([]);
         } finally {
             setIsLoading(false);
         }
     };
     fetchAndRestartPolling(); // Call the combined function
     // --- End fetch & restart ---
  };

  // --- Render Loading State ---
   if (isLoading && !matchedUser && users.length === 0) { // More specific initial loading
        return (
          <div className="flex flex-col h-screen overflow-hidden items-center justify-center bg-white md:bg-gradient-to-b md:from-pink-100 md:to-pink-200">
            <Loader className="animate-spin text-pink-500 h-12 w-12" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        );
    }

  // --- Render Error State ---
  if (error) {
     return (
        <div className="flex flex-col h-screen overflow-hidden items-center justify-center bg-red-50 text-red-700">
            <h2 className="text-2xl font-semibold mb-2">Oops! Something went wrong</h2>
            <p>{error}</p>
             <button
                onClick={() => {
                    hasCheckedPendingMatchOnLoad.current = false;
                    setError(null);
                    setIsLoading(true);
                    // Manually trigger re-initialization if currentUserData hasn't changed
                    // This assumes initializeDashboard is defined outside useEffect or passed via useCallback
                    // For simplicity here, we rely on state reset potentially triggering useEffect via context update
                 }}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
             >
                Try Again
             </button>
        </div>
        );
   }

  // Prepare currentUser profile (only if currentUserData exists)
  const currentUserProfileForMatchScreen: UserProfile | null = currentUserData ? {
      id: currentUserData.id, name: currentUserData.name || "You", age: currentUserData.age,
      email: currentUserData.email, bio: currentUserData.bio,
      profile_picture_url: currentUserData.profile_picture_url
  } : null;


  // --- Render Main Dashboard ---
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white md:bg-gradient-to-b md:from-pink-100 md:to-pink-200 relative">

      {/* Conditionally render Match Screen Overlay */}
      <AnimatePresence>
        {matchedUser && currentUserProfileForMatchScreen && (
            <MatchScreen
                currentUserProfile={currentUserProfileForMatchScreen}
                matchedUser={matchedUser}
                onClose={closeMatchScreen}
            />
        )}
      </AnimatePresence>

      {/* Main Swipe Section (Only visible if no match screen is active) */}
      {!matchedUser && (
            <main className="flex-1 flex flex-col items-center justify-center relative pb-16 md:pb-0">
                <div className="relative w-full h-full md:w-[360px] md:h-[520px] flex justify-center items-center bg-black md:bg-transparent">
                    <AnimatePresence>
                        {users.length > 0 ? (
                        users.map((user, index) => (
                            <SwipeCardMotion
                                key={user.id}
                                user={user}
                                isTop={index === users.length - 1}
                                onSwipe={handleSwipe}
                                triggerSwipe={index === users.length - 1 ? triggerSwipe : null}
                            />
                        ))
                        ) : (
                         !isLoading && !error && ( // Show "No users" only if not loading/error
                            <div className="text-center text-gray-600 p-4">
                                <h2 className="text-2xl font-semibold">No more users nearby</h2>
                                <p className="mt-2">Check back later!</p>
                            </div>
                         )
                        )}
                    </AnimatePresence>
                    {/* Inline loading indicator when fetching users */}
                     {isLoading && users.length === 0 && !error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <Loader className="animate-spin text-pink-500 h-10 w-10" />
                        </div>
                    )}
                </div>
                 {/* Swipe Buttons */}
                 {!isLoading && users.length > 0 && (
                    <div className="hidden md:flex justify-center items-center space-x-6 mt-6 md:mt-8">
                         <button onClick={() => handleButtonSwipe("left")} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform" aria-label="Swipe left">
                             <X size={32} className="text-red-500" />
                         </button>
                         <button onClick={() => handleButtonSwipe("right")} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform" aria-label="Swipe right">
                              <Heart size={32} className="text-green-500" />
                          </button>
                    </div>
                 )}
            </main>
      )}
    </div>
  );
};

export default Dashboard;