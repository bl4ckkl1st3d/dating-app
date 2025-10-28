import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence, // Import AnimatePresence
  useAnimation,
} from "framer-motion";
// Added Loader, MessageSquare
import { X, Heart, Loader, MessageSquare } from "lucide-react";
import SwipeCard from "../components/SwipeCard";
import { userService, UserProfile } from "../services/user.service";
import { useAuth } from "../context/AuthContext"; // Import useAuth

// --- Match Screen Component (Copied from Dashboard2, adjusted user type if needed) ---
// You could also move this to its own file (e.g., src/components/MatchScreen.tsx) and import it
const MatchScreen: React.FC<{
  currentUser: UserProfile; // Using UserProfile from user.service
  matchedUser: UserProfile;
  onClose: () => void;
}> = ({ currentUser, matchedUser, onClose }) => {
  // Use a default image if the current user doesn't have one
  const currentUserImageUrl = currentUser.imageUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800"; // Default image

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
          <img src={currentUserImageUrl} alt={currentUser.name} className="w-full h-full object-cover" />
        </motion.div>

        {/* Matched User Profile Pic */}
        <motion.div
          className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          {/* Ensure matchedUser.imageUrl exists, provide fallback if needed */}
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
            onClick={onClose}
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

// SwipeCardMotion component (mostly unchanged)
const SwipeCardMotion: React.FC<{
  user: UserProfile;
  isTop: boolean;
  onSwipe: (dir: "left" | "right", user: UserProfile) => void;
  triggerSwipe?: { direction: "left" | "right"; execute: boolean } | null;
}> = ({ user, isTop, onSwipe, triggerSwipe }) => {
    // ... (rest of SwipeCardMotion component - same as before) ...
     const x = useMotionValue(0);
      const rotate = useTransform(x, [-200, 200], [-15, 15]);
      const likeOpacity = useTransform(x, [50, 150], [0, 1]);
      const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);
      const controls = useAnimation();

      const handleSwipeAction = async (direction: "left" | "right") => {
        const distance = direction === "right" ? 600 : -600;
        const rotation = direction === "right" ? 25 : -25;
        await controls.start({
          x: distance,
          rotate: rotation,
          opacity: 0,
          transition: { duration: 0.35 },
        });
        onSwipe(direction, user);
      };

      const handleDragEnd = async (_: any, info: any) => {
        if (info.offset.x > 150) {
          await handleSwipeAction("right");
        } else if (info.offset.x < -150) {
          await handleSwipeAction("left");
        } else {
          await controls.start({
            x: 0,
            rotate: 0,
            transition: { type: "spring", stiffness: 300 },
          });
        }
      };

      React.useEffect(() => {
        if (isTop && triggerSwipe?.execute) handleSwipeAction(triggerSwipe.direction);
      }, [triggerSwipe]);

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


const Dashboard: React.FC = () => {
  const { user: currentUser } = useAuth(); // Get current user from context
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null); // State for match screen
  const [triggerSwipe, setTriggerSwipe] = useState<{
    direction: "left" | "right";
    execute: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      setMatchedUser(null); // Ensure match screen is hidden on load/reload
      try {
        const fetchedUsers = await userService.getPotentialMatches();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Failed to load potential matches. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Modified handleSwipe to include match simulation
  const handleSwipe = async (direction: "left" | "right", swipedUser: UserProfile) => {
    const isLike = direction === "right";

    // Record swipe (backend needs modification later to return match status)
    userService.recordSwipe(swipedUser.id, isLike).catch(err => {
      console.error("Failed to record swipe:", err);
      // Optionally show an error to the user
    });

    // Simulate match on right swipe for now
    const isMatch = isLike; // Replace with actual backend response later

    console.log(`Swiped ${direction} on ${swipedUser.name}. Simulated Match: ${isMatch}`);

    // Remove user from stack after animation delay
    setTimeout(() => {
      setUsers((prev) => prev.filter((u) => u.id !== swipedUser.id));
      setTriggerSwipe(null); // Reset trigger

      // Show match screen if it's a simulated match
      if (isMatch) {
        setMatchedUser(swipedUser);
      }
    }, 350); // Delay slightly longer than animation
  };

  const handleButtonSwipe = (direction: "left" | "right") => {
    if (!isLoading && users.length > 0) {
       setTriggerSwipe({ direction, execute: true });
    }
  };

  // Function to close the match screen
  const closeMatchScreen = () => {
    setMatchedUser(null);
  };

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden items-center justify-center bg-white md:bg-gradient-to-b md:from-pink-100 md:to-pink-200">
        <Loader className="animate-spin text-pink-500 h-12 w-12" />
        <p className="mt-4 text-gray-600">Finding potential matches...</p>
      </div>
    );
  }

  // --- Render Error State ---
   if (error) {
     return (
       <div className="flex flex-col h-screen overflow-hidden items-center justify-center bg-red-50 text-red-700">
         <h2 className="text-2xl font-semibold mb-2">Oops! Something went wrong</h2>
         <p>{error}</p>
       </div>
     );
   }

  // --- Render Main Dashboard ---
  // Note: The outer div now uses `relative` for the fixed match screen positioning
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white md:bg-gradient-to-b md:from-pink-100 md:to-pink-200 relative">
      {/* Navbar is handled by AppLayout - No changes needed here */}

      {/* Conditionally render Match Screen Overlay */}
      <AnimatePresence>
        {matchedUser && currentUser && ( // Ensure currentUser is loaded
            <MatchScreen
                // Map currentUser from AuthContext to UserProfile, ensure imageUrl is handled
                currentUser={{
                   id: currentUser.id,
                   name: currentUser.name || "You", // Use name from context or default
                   age: currentUser.age,
                   email: currentUser.email,
                   bio: currentUser.bio,
                   imageUrl: currentUser.profile_picture_url // Map profile_picture_url if needed
                }}
                matchedUser={matchedUser}
                onClose={closeMatchScreen}
            />
        )}
      </AnimatePresence>

      {/* Main Swipe Section (Only visible if no match screen) */}
      {!matchedUser && (
          <main className="flex-1 flex flex-col items-center justify-center relative pb-16 md:pb-0">
            <div
              className="
                relative
                w-full h-full
                md:w-[360px] md:h-[520px]
                flex justify-center items-center
                bg-black md:bg-transparent
              "
            >
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
                  <div className="text-center text-gray-600 p-4">
                    <h2 className="text-2xl font-semibold">No more users nearby</h2>
                    <p className="mt-2">Check back later for more potential matches!</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Swipe Buttons */}
            {users.length > 0 && (
              <div className="hidden md:flex justify-center items-center space-x-6 mt-6 md:mt-8">
                <button
                  onClick={() => handleButtonSwipe("left")}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
                  aria-label="Swipe left"
                >
                  <X size={32} className="text-red-500" />
                </button>
                <button
                  onClick={() => handleButtonSwipe("right")}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
                  aria-label="Swipe right"
                >
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