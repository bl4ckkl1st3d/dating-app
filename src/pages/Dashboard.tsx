// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react"; // Added useEffect
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useAnimation,
} from "framer-motion";
import { X, Heart, Loader } from "lucide-react"; // Added Loader for loading state
import SwipeCard from "../components/SwipeCard";
// Import the user service and UserProfile type
import { userService, UserProfile } from "../services/user.service";

// REMOVE MOCK_USERS_DB
// const MOCK_USERS_DB = [ ... ];

// Updated SwipeCardMotion props to use the imported UserProfile type
const SwipeCardMotion: React.FC<{
  user: UserProfile; // Use imported UserProfile
  isTop: boolean;
  onSwipe: (dir: "left" | "right", user: UserProfile) => void;
  triggerSwipe?: { direction: "left" | "right"; execute: boolean } | null;
}> = ({ user, isTop, onSwipe, triggerSwipe }) => {
    // ... (rest of SwipeCardMotion component remains the same) ...
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
          {/* Ensure SwipeCard uses imageUrl if you mapped it */}
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
  // State for users fetched from API, loading status, and errors
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [triggerSwipe, setTriggerSwipe] = useState<{
    direction: "left" | "right";
    execute: boolean;
  } | null>(null);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
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
  }, []); // Empty dependency array means this runs once on mount


  // Updated handleSwipe to call the API
  const handleSwipe = async (direction: "left" | "right", swipedUser: UserProfile) => {
    const isLike = direction === "right";

    // Record the swipe in the backend (fire and forget for now, but you might want to handle errors)
    userService.recordSwipe(swipedUser.id, isLike);

    // Remove the swiped user from the frontend state after a short delay
    setTimeout(() => {
      setUsers((prev) => prev.filter((u) => u.id !== swipedUser.id));
      setTriggerSwipe(null); // Reset trigger after animation
      // --- TODO: Optionally fetch more users if the stack gets low ---
    }, 150); // Delay matches animation duration
  };


  const handleButtonSwipe = (direction: "left" | "right") => {
    // Only trigger if not loading and there are users
    if (!isLoading && users.length > 0) {
       setTriggerSwipe({ direction, execute: true });
    }
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
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white md:bg-gradient-to-b md:from-pink-100 md:to-pink-200">
      {/* Navbar is handled by AppLayout */}

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
            {/* Check users array length */}
            {users.length > 0 ? (
              users.map((user, index) => (
                <SwipeCardMotion
                  key={user.id}
                  user={user}
                  isTop={index === users.length - 1} // Only top card is draggable
                  onSwipe={handleSwipe}
                  triggerSwipe={index === users.length - 1 ? triggerSwipe : null} // Only trigger top card
                />
              ))
            ) : (
              // Display message when no users are left
              <div className="text-center text-gray-600 p-4">
                <h2 className="text-2xl font-semibold">No more users nearby</h2>
                <p className="mt-2">Check back later for more potential matches!</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Swipe Buttons (only show if there are users) */}
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
    </div>
  );
};

export default Dashboard;