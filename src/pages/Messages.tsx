// src/pages/Messages.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

// --- Interfaces ---
interface Match {
    id: number;
    name: string;
    lastMessage: string;
    imageUrl: string;
}

interface Message {
    id: number;
    sender: 'me' | 'them';
    text: string;
    timestamp: string; // Simple timestamp for display
}

// --- Dummy Data ---
const matchesData: Match[] = [
    { id: 1, name: 'Alex', lastMessage: 'Hey! How are you?', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800' },
    { id: 2, name: 'Maria', lastMessage: 'I had a great time too!', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800' },
    { id: 3, name: 'Jessica', lastMessage: 'See you tomorrow!', imageUrl: 'https://images.unsplash.com/photo-1520466809213-7b9a56c26867?q=80&w=800' },
];

const dummyMessages: Record<number, Message[]> = {
    1: [ // Alex
        { id: 101, sender: 'them', text: 'Hey! How are you?', timestamp: '10:30 AM' },
        { id: 102, sender: 'me', text: 'Hi Alex! Doing well, thanks. How about you?', timestamp: '10:31 AM' },
        { id: 103, sender: 'them', text: 'Pretty good! Just working on some code.', timestamp: '10:32 AM' },
        { id: 104, sender: 'me', text: 'Nice! Anything interesting?', timestamp: '10:33 AM' },
        { id: 105, sender: 'them', text: 'Yeah, trying out a new framework. It\'s pretty cool but has a steep learning curve.', timestamp: '10:35 AM' },
        { id: 106, sender: 'me', text: 'Oh really? Which one? Always interested in hearing about new tech.', timestamp: '10:36 AM' },
        { id: 107, sender: 'them', text: 'It\'s called Svelte. Completely different approach compared to React.', timestamp: '10:37 AM' },
        { id: 108, sender: 'me', text: 'Ah, I\'ve heard of it! Compiles away the framework at build time, right?', timestamp: '10:38 AM' },
        { id: 109, sender: 'them', text: 'Exactly! Makes for really small bundles and fast performance.', timestamp: '10:39 AM' },
        { id: 110, sender: 'me', text: 'Sounds promising. Might have to check it out myself sometime.', timestamp: '10:40 AM' },
        { id: 111, sender: 'them', text: 'Definitely recommend it if you get the chance!', timestamp: '10:41 AM' },
    ],
    2: [ // Maria
        { id: 201, sender: 'them', text: 'I had a great time too!', timestamp: 'Yesterday' },
        { id: 202, sender: 'me', text: 'Awesome! We should do it again sometime.', timestamp: 'Yesterday' },
    ],
     3: [ // Jessica
        { id: 301, sender: 'them', text: 'See you tomorrow!', timestamp: 'Yesterday' },
    ],
};
// --- End Dummy Data ---

// --- Chat View Component ---
interface ChatViewProps {
    user: Match;
    messages: Message[];
    onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ user, messages, onBack }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => { /* ... */ };
    useEffect(() => { /* ... */ }, [messages]);
    const handleSend = () => { /* ... */ };

    return (
        // Apply responsive height/max-height
        // Mobile: h-full (fills parent <main>)
        // Desktop: max-h-[75vh] (limits height relative to viewport)
        <div className="flex flex-col bg-white md:rounded-lg shadow md:border md:border-gray-200 overflow-hidden h-full md:max-h-[75vh]"> {/* CHANGED: md:h-[600px] removed, md:max-h-[75vh] added */}
            {/* Header */}
            <div className="flex-shrink-0 flex items-center p-3 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                 {/* ... header content ... */}
                 <button onClick={onBack} className="p-2 text-gray-600 hover:text-pink-500 mr-2">
                    <ArrowLeft size={20} />
                </button>
                <img src={user.imageUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover mr-3" />
                <h2 className="font-semibold text-gray-800 flex-1 text-center mr-8">{user.name}</h2>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                 {/* ... message mapping ... */}
                 {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                                msg.sender === 'me'
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            <p className="text-sm break-words">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-pink-100' : 'text-gray-500'} text-right`}>
                                {msg.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50 flex items-center">
                 {/* ... input and button ... */}
                 <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-pink-500 focus:border-transparent outline-none mr-2 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 transition-colors"
                    disabled={!newMessage.trim()}
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};
// --- End Chat View Component ---


// --- Messages Component (Main Page - Adjusted <main> Styling) ---
const Messages: React.FC = () => {
    const [selectedChatUser, setSelectedChatUser] = useState<Match | null>(null);

    // Effect to control body scrolling (remains the same)
    useEffect(() => { /* ... body scroll lock logic ... */ }, [selectedChatUser]);

    const handleSelectChat = (user: Match) => {
        setSelectedChatUser(user);
    };

    const handleBackToList = () => {
        setSelectedChatUser(null);
    };

    return (
        // Adjusted Styling for <main>:
        // - Chat Active (Mobile): Add pt-16 (for top nav) and pb-16 (for bottom nav), take full viewport height. No horizontal padding/max-width.
        // - Chat Active (Desktop): Keep standard padding and max-width.
        // - List View (Default): Standard padding and max-width.
        <main className={`mx-auto ${
            selectedChatUser
             ? 'w-full h-screen pb-16 md:h-auto md:max-w-2xl md:py-8 md:px-4' // Full screen mobile (padded), standard desktop
             : 'max-w-2xl w-full py-8 px-4 pb-20 md:pb-10' // Standard list view
             }`
        }>
            {!selectedChatUser ? (
                // Match List View
                <>
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
                    <div className="bg-white rounded-lg shadow border border-gray-200">
                        {/* ... list rendering ... */}
                         {matchesData.length > 0 ? (
                             <ul className="divide-y divide-gray-200">
                                {matchesData.map((match) => (
                                    <li
                                        key={match.id}
                                        className="p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                        onClick={() => handleSelectChat(match)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSelectChat(match)}
                                    >
                                        <img src={match.imageUrl} alt={match.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">{match.name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{match.lastMessage}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-4 text-center text-gray-500">No matches yet. Keep swiping!</p>
                        )}
                    </div>
                </>
            ) : (
                // Chat View - h-full inside the padded <main> container
                <ChatView
                    user={selectedChatUser}
                    messages={dummyMessages[selectedChatUser.id] || []}
                    onBack={handleBackToList}
                />
            )}
        </main>
    );
};

export default Messages;

