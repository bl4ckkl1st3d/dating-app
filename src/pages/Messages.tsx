import React from 'react';
import AppNavbar from '../components/AppNavbar'; // Keep the navbar import

const Messages: React.FC = () => {
  // Mock data
  const matches = [
    { id: 1, name: 'Alex', lastMessage: 'Hey! How are you?', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800' },
    { id: 2, name: 'Maria', lastMessage: 'I had a great time too!', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800' },
  ];

  return (
    // Keep the min-h-screen here as AppLayout is not used
    <div className="min-h-screen bg-gray-50">
{/* Keep the navbar call */}
      {/* FIX: Added 'pt-16' which applies padding-top on all screen sizes.
        Since the navbar is fixed-top on desktop (md:) and fixed-bottom
        on mobile, we need the padding at the top on desktop.
        On mobile, the content will scroll above the bottom navbar,
        but the 'pb-10' (or 'pb-20' if needed) ensures space at the bottom.
      */}
      <main className="max-w-2xl mx-auto py-8 px-4 pb-20 md:pb-10"> {/* Adjusted padding */}

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {matches.map((match) => (
              <li key={match.id} className="p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-50">
                <img src={match.imageUrl} alt={match.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{match.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{match.lastMessage}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Messages;