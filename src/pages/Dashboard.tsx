import React, { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useAnimation,
} from "framer-motion";
import { X, Heart } from "lucide-react";
import SwipeCard from "../components/SwipeCard";
import AppNavbar from "../components/AppNavbar";

const MOCK_USERS_DB = [
  {
    id: 1,
    name: "Jessica",
    age: 24,
    bio: "Love hiking and my golden retriever. Looking for an adventure partner!",
    imageUrl:
      "https://images.unsplash.com/photo-1520466809213-7b9a56c26867?q=80&w=800",
  },
  {
    id: 2,
    name: "Alex",
    age: 27,
    bio: "Software dev by day, musician by night. Let's grab coffee.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800",
  },
  {
    id: 3,
    name: "Maria",
    age: 25,
    bio: "Foodie, traveler, and aspiring yogi. My dog is my best friend.",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800",
  },
  {
    id: 4,
    name: "David",
    age: 29,
    bio: "Just looking for someone to watch movies with. I make great popcorn.",
    imageUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800",
  },
];

type UserProfile = typeof MOCK_USERS_DB[0];

const SwipeCardMotion: React.FC<{
  user: UserProfile;
  isTop: boolean;
  onSwipe: (dir: "left" | "right", user: UserProfile) => void;
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
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS_DB);
  const [triggerSwipe, setTriggerSwipe] = useState<{
    direction: "left" | "right";
    execute: boolean;
  } | null>(null);

  const handleSwipe = (direction: "left" | "right", user: UserProfile) => {
    setTimeout(() => {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTriggerSwipe(null);
    }, 150);
  };

  const handleButtonSwipe = (direction: "left" | "right") => {
    if (users.length > 0) setTriggerSwipe({ direction, execute: true });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white md:bg-gradient-to-b md:from-pink-100 md:to-pink-200">
      {/* Navbar stays on top on desktop, bottom on mobile */}
      <AppNavbar />

      {/* Main Swipe Section */}
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
                  triggerSwipe={triggerSwipe}
                />
              ))
            ) : (
              <div className="text-center text-gray-600">
                <h2 className="text-2xl font-semibold">No more users nearby</h2>
                <p className="mt-2">Check back later for more potential matches!</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Swipe Buttons (hidden on mobile) */}
        {users.length > 0 && (
          <div className="hidden md:flex justify-center items-center space-x-6 mt-6 md:mt-8">
            <button
              onClick={() => handleButtonSwipe("left")}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
            >
              <X size={32} className="text-red-500" />
            </button>
            <button
              onClick={() => handleButtonSwipe("right")}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
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
