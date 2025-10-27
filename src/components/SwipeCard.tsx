import React from "react";

interface UserProfile {
  id: number;
  name: string;
  age: number;
  bio: string;
  imageUrl: string;
}

interface SwipeCardProps {
  user: UserProfile;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ user }) => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-white pointer-events-none select-none">
      {/* Profile Image */}
      <img
        src={user.imageUrl}
        alt={user.name}
        className="w-full h-full object-cover"
        draggable={false}
      />

      {/* Dark gradient overlay at the very bottom */}
      <div
        className="
          absolute left-0 bottom-0 w-full
          h-[35%] md:h-[30%]                 /* covers only the true bottom portion */
          bg-gradient-to-t from-black/90 via-black/70 to-transparent
          p-6 flex flex-col justify-end
          pointer-events-none
        "
      >
        <h2 className="text-4xl font-bold text-white drop-shadow-md">
          {user.name}, <span className="font-light">{user.age}</span>
        </h2>
        <p className="text-gray-200 mt-2 text-base leading-snug line-clamp-2">
          {user.bio}
        </p>
      </div>
    </div>
  );
};

export default SwipeCard;
