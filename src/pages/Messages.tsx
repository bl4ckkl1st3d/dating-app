// src/pages/Messages.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, MoreVertical, UserX, AlertTriangle, Check, CheckCheck } from 'lucide-react';
import { messageService, MatchData, MessageData } from '../services/message.service'; //
import { useAuth } from '../context/AuthContext'; //
import { formatDistanceToNowStrict } from 'date-fns';
import ConfirmationModal from '../components/ConfirmationModal'; //

// --- Helper Function for Timestamps ---
const formatTimestamp = (isoString: string): string => {
    try {
        return formatDistanceToNowStrict(new Date(isoString), { addSuffix: true });
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid date';
    }
};

// --- Chat View Component ---
interface ChatViewProps {
    matchInfo: MatchData;
    initialData: { messages: MessageData[]; lastReadByOtherId: number | null };
    onBack: () => void;
    currentUserId: number;
    onUnmatchRequest: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({
    matchInfo,
    initialData,
    onBack,
    currentUserId,
    onUnmatchRequest
}) => {
    // *** FIX: Initialize state from initialData ***
    const [messages, setMessages] = useState<MessageData[]>(initialData.messages);
    const [lastReadByOtherId, setLastReadByOtherId] = useState<number | null>(initialData.lastReadByOtherId);
    // ------------------------------------------------
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const pollingIntervalRef = useRef<number | null>(null);

    // *** FIX: Update state based on initialData prop ***
    useEffect(() => {
        setMessages(initialData.messages);
        setLastReadByOtherId(initialData.lastReadByOtherId);
    }, [initialData]);
    // --------------------------------------------------

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const fetchNewMessages = useCallback(async () => {
        // console.log(`🔄 [ChatView] Polling for new messages/read status in match ${matchInfo.matchId}...`);
        try {
            // Fetch latest data from the service
            const { messages: latestMessages, lastReadByOtherId: latestReadId } = await messageService.getMessages(matchInfo.matchId);

            // *** Use functional updates to safely compare and set state ***
            setMessages(prevMessages => {
                // Compare fetched messages with the *previous* state
                if (latestMessages.length !== prevMessages.length ||
                   (latestMessages.length > 0 && prevMessages.length > 0 &&
                    latestMessages[latestMessages.length - 1].id !== prevMessages[prevMessages.length - 1].id) ||
                    (latestMessages.length === 0 && prevMessages.length > 0) || // Handle all messages deleted scenario
                    (latestMessages.length > 0 && prevMessages.length === 0)   // Handle first message arrival
                 ) {
                    console.log("✨ [ChatView] New messages detected via polling, updating state.");
                    // Mark as read if needed
                    if (latestMessages.some(msg => msg.senderId !== currentUserId && !msg.read)) {
                        messageService.markMessagesRead(matchInfo.matchId).catch();
                    }
                    return latestMessages; // Return the new array to update state
                }
                return prevMessages; // Return the old array if no change
            });

            // Update last read ID using functional update as well
            setLastReadByOtherId(prevReadId => {
                 if (latestReadId !== prevReadId) {
                     console.log(`✨ [ChatView] Read receipt status updated via polling. Last read by other: ${latestReadId}`);
                     return latestReadId;
                 }
                 return prevReadId;
            });
        // Remove state variables from dependency array here, functional updates handle it
        } catch (err) {
            console.error('[ChatView] Error polling messages:', err);
             setError("Couldn't check for new messages.");
        }
        // *** FIX: Remove messages and lastReadByOtherId from dependency array ***
        // They are updated inside, causing potential infinite loops if included.
    }, [matchInfo.matchId, currentUserId]);
    // ----------------------------------------------------------------------

    useEffect(() => {
        // Mark initial messages read (if any)
        if (initialData.messages.some(msg => msg.senderId !== currentUserId && !msg.read)) {
             messageService.markMessagesRead(matchInfo.matchId).catch();
        }

        // --- Start Polling ---
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current); // Clear previous interval if matchId changes
        }
        fetchNewMessages(); // Fetch immediately on mount/matchId change
        pollingIntervalRef.current = setInterval(fetchNewMessages, 5000); // Poll every 5 seconds
        console.log(`[ChatView] Started polling interval ${pollingIntervalRef.current} for match ${matchInfo.matchId}`);

        // --- Cleanup Function ---
        return () => {
            if (pollingIntervalRef.current) {
                console.log(`[ChatView] Clearing polling interval ${pollingIntervalRef.current} for match ${matchInfo.matchId}`);
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
        // This effect runs when the component mounts and whenever matchId or fetchNewMessages changes.
        // fetchNewMessages is stable due to useCallback, so effectively runs on mount and matchId change.
    }, [matchInfo.matchId, currentUserId, fetchNewMessages, initialData.messages]);
    // ----------------------------------------------------------

    useEffect(() => { // Click outside handler
        const handleClickOutside = (event: MouseEvent) => {
          if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
            setShowOptions(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);

    const handleSend = async () => {
        if (!newMessage.trim() || isSending) return;
        setIsSending(true);
        setError(null);
        const contentToSend = newMessage;
        setNewMessage('');

        const optimisticMessage: MessageData = {
            id: Date.now(),
            senderId: currentUserId,
            receiverId: matchInfo.otherUserId,
            content: contentToSend,
            sentAt: new Date().toISOString(),
            read: false,
        };
        setMessages(prev => [...prev, optimisticMessage]);
        scrollToBottom();

        const sentMessage = await messageService.sendMessage(matchInfo.matchId, contentToSend); //

        if (sentMessage) {
            setMessages(prev => prev.map(msg =>
                msg.id === optimisticMessage.id ? sentMessage : msg
            ));
        } else {
            setError('Failed to send message. Please try again.');
            setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
            setNewMessage(contentToSend);
        }
        setIsSending(false);
    };

    const handleUnmatchClick = () => {
        setShowOptions(false);
        onUnmatchRequest();
    };


    return (
        <div className="flex flex-col bg-white md:rounded-lg shadow md:border md:border-gray-200 overflow-hidden h-full"> {/* */}
             {/* Header */}
             <div className="flex-shrink-0 flex items-center p-3 border-b border-gray-200 bg-gray-50 sticky top-0 z-10"> {/* */}
                <button onClick={onBack} className="p-2 text-gray-600 hover:text-pink-500 mr-2"> {/* */}
                    <ArrowLeft size={20} />
                </button>
                <img src={matchInfo.imageUrl} alt={matchInfo.name} className="w-8 h-8 rounded-full object-cover mr-3" /> {/* */}
                <h2 className="font-semibold text-gray-800 flex-1 truncate">{matchInfo.name}</h2> {/* */}
                 <div className="relative ml-2" ref={optionsRef}>
                    <button onClick={() => setShowOptions(prev => !prev)} className="p-2 text-gray-500 hover:text-gray-700"> {/* */}
                        <MoreVertical size={20} />
                    </button>
                    {showOptions && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-20 py-1"> {/* */}
                            <button
                                onClick={handleUnmatchClick}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" //
                            >
                                <UserX size={16} className="mr-2"/> Unmatch
                            </button>
                        </div>
                    )}
                 </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"> {/* */}
                 {messages.map((msg) => {
                     const isMe = msg.senderId === currentUserId;
                     const isReadByOther = isMe && lastReadByOtherId !== null && msg.id <= lastReadByOtherId;

                     return (
                        <div
                            key={`${msg.id}-${msg.sentAt}`}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`} //
                        >
                            <div
                                className={`max-w-[70%] p-3 rounded-lg shadow-sm ${ //
                                    isMe ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-800' //
                                }`}
                            >
                                <p className="text-sm break-words">{msg.content}</p> {/* */}
                                <div className="flex items-center justify-end mt-1 space-x-1"> {/* */}
                                    <p className={`text-xs ${isMe ? 'text-pink-100' : 'text-gray-500'}`}> {/* */}
                                        {formatTimestamp(msg.sentAt)}
                                    </p>
                                    {isMe && (
                                        isReadByOther ? (
                                            <CheckCheck size={14} className="text-blue-300" />
                                        ) : (
                                            <Check size={14} className="text-pink-100 opacity-60" />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                     );
                 })}
                <div ref={messagesEndRef} />
            </div>

             {/* Error Display */}
             {error && (
                <div className="p-2 text-center text-red-600 bg-red-50 text-sm"> {/* */}
                    <AlertTriangle size={14} className="inline mr-1 -mt-1"/> {error}
                </div>
             )}

            {/* Input Area */}
            <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50 flex items-center"> {/* */}
                 <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-pink-500 focus:border-transparent outline-none mr-2 text-sm" //
                    onKeyDown={(e) => e.key === 'Enter' && !isSending && handleSend()}
                    disabled={isSending}
                />
                <button
                    onClick={handleSend}
                    className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 transition-colors" //
                    disabled={!newMessage.trim() || isSending}
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};
// --- End Chat View Component ---


// --- Messages Component (Main Page) ---
const Messages: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [selectedChatMatch, setSelectedChatMatch] = useState<MatchData | null>(null);
    const [initialChatData, setInitialChatData] = useState<{ messages: MessageData[]; lastReadByOtherId: number | null } | null>(null);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false);
    const [matchToUnmatch, setMatchToUnmatch] = useState<MatchData | null>(null);
    // *** Add Ref for list polling interval ***
    const listPollingIntervalRef = useRef<number | null>(null);

    const loadMatches = useCallback(async (showLoading = true) => {
        if (!currentUser) return;
        if (showLoading) setIsLoadingMatches(true);
        // setError(null); // Keep previous errors unless it's a full reload?
        try {
            // console.log("🔄 [Messages] Fetching matches list..."); // Keep logs minimal
            const fetchedMatches = await messageService.getMatches();
            // console.log("✅ [Messages] Fetched matches data:", fetchedMatches);
            setMatches(fetchedMatches); // Update state
             if (error) setError(null); // Clear error on successful fetch
        } catch (err) {
            console.error("Failed to load matches", err);
            // Set error only if it's not already set to avoid flickering
            setError(prev => prev || "Could not load your matches. Please try again later.");
        } finally {
            if (showLoading) setIsLoadingMatches(false);
        }
    }, [currentUser, error]);

    useEffect(() => {
        loadMatches();
    }, [loadMatches]);
    useEffect(() => {
        // Function to clear existing interval
        const clearListInterval = () => {
            if (listPollingIntervalRef.current) {
                // console.log(`[Messages] Clearing list polling interval ${listPollingIntervalRef.current}`);
                clearInterval(listPollingIntervalRef.current);
                listPollingIntervalRef.current = null;
            }
        };

        if (!selectedChatMatch && currentUser) {
            // ---- If LIST VIEW is active and user is logged in ----
            console.log("[Messages] List view active, starting list polling.");
            clearListInterval(); // Clear just in case
            // Fetch immediately, then start interval
            loadMatches(false); // Fetch without main loading spinner
            listPollingIntervalRef.current = setInterval(() => {
                // console.log("🔄 [Messages] Polling matches list...");
                loadMatches(false); // Poll without main loading spinner
            }, 15000); // Poll list every 15 seconds (adjust interval as needed)
        } else {
            // ---- If CHAT VIEW is active or no user ----
            // console.log("[Messages] Chat view active or no user, ensuring list polling is stopped.");
            clearListInterval(); // Clear interval when switching to chat view or logging out
        }

        // --- Cleanup on component unmount ---
        return () => {
            clearListInterval();
        };
        // This effect runs when selectedChatMatch changes or currentUser changes
    }, [selectedChatMatch, currentUser, loadMatches]);

    useEffect(() => { // Body scroll lock
        if (selectedChatMatch) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [selectedChatMatch]);

    const handleSelectChat = async (match: MatchData) => {
        setIsLoadingMessages(true);
        setError(null);
        setSelectedChatMatch(match);
        setInitialChatData(null); // Clear previous data

        try {
            // Fetch initial messages and read status
            const data = await messageService.getMessages(match.matchId); //
            setInitialChatData(data); // Set the combined data object

             // Mark messages as read (fire and forget)
             messageService.markMessagesRead(match.matchId).catch(err => { //
                console.warn(`[Messages] Failed background task: markMessagesRead for ${match.matchId}`, err);
             });

        } catch (err) {
            console.error(`Failed to load messages for match ${match.matchId}`, err);
            setError(`Could not load messages for ${match.name}.`);
            setSelectedChatMatch(null); // Go back on error
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleBackToList = () => {
        setSelectedChatMatch(null);
        setInitialChatData(null); // Clear chat data
        loadMatches(false); // Refetch matches
    };

     const handleUnmatchSuccess = (unmatchedMatchId: number) => {
        setMatches(prevMatches => prevMatches.filter(m => m.matchId !== unmatchedMatchId));
        setSelectedChatMatch(null);
        setInitialChatData(null);
    };

     const openUnmatchConfirmation = (match: MatchData) => {
        setMatchToUnmatch(match);
        setShowUnmatchConfirm(true);
     };

     const closeUnmatchConfirmation = () => {
        setShowUnmatchConfirm(false);
        setMatchToUnmatch(null);
     };

     const confirmUnmatch = async () => {
        if (!matchToUnmatch) return;
        console.log(`[Messages] Confirming unmatch for ${matchToUnmatch.name}`);
        const success = await messageService.unmatchUser(matchToUnmatch.matchId); //
        if (success) {
            handleUnmatchSuccess(matchToUnmatch.matchId);
        } else {
            alert('Failed to unmatch user. Please try again.');
        }
        closeUnmatchConfirmation();
     };


    if (!currentUser) {
        return <div className="flex justify-center items-center h-screen">Loading user...</div>; //
    }

    return (
        <>
            <main className={`mx-auto ${
                selectedChatMatch
                 ? 'fixed inset-x-0 bottom-16 top-0 overflow-hidden md:static md:inset-auto md:max-w-2xl md:py-8 md:px-4 md:overflow-hidden md:h-full' // Mobile: Fixed; Desktop: Static, overflow hidden, full height of parent
                 : 'max-w-2xl w-full py-8 px-4 pb-20 md:pb-10' // List view padding remains standard
                 }`
            }>
                {!selectedChatMatch ? (
                    // --- Match List View ---
                    <>
                         <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1> {/* */}
                        {isLoadingMatches ? (
                            <p className="text-center text-gray-500 py-10">Loading matches...</p> //
                        ) : error ? (
                             <p className="text-center text-red-500 py-10">{error}</p> //
                        ) : matches.length > 0 ? (
                            <div className="bg-white rounded-lg shadow border border-gray-200"> {/* */}
                                 <ul className="divide-y divide-gray-200"> {/* */}
                                    {matches.map((match) => (
                                        <li
                                            key={match.matchId}
                                            className="p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150" //
                                            onClick={() => handleSelectChat(match)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectChat(match)}
                                        >
                                            <img src={match.imageUrl} alt={match.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" /> {/* */}
                                            <div className="flex-1 min-w-0"> {/* */}
                                                <h3 className={`font-semibold text-gray-800 truncate ${match.isLastMessageUnread ? 'font-bold' : ''}`}>{match.name}</h3> {/* */}
                                                <p className={`text-sm text-gray-500 truncate ${match.isLastMessageUnread ? 'font-semibold text-gray-700' : ''}`}> {/* */}
                                                    {match.lastMessage}
                                                </p>
                                            </div>
                                            {match.lastMessageTimestamp && (
                                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2"> {/* */}
                                                    {formatTimestamp(match.lastMessageTimestamp)}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="p-6 text-center text-gray-500 bg-white rounded-lg shadow border border-gray-200"> {/* */}
                                No matches yet. Keep swiping to get a match! ✨
                            </p>
                        )}
                    </>
                ) : (
                    // --- Chat View ---
                    <div className="h-full md:h-[calc(100vh-10rem)] md:min-h-[500px]"> {/* */}
                        {isLoadingMessages || !initialChatData ? (
                            <p className="text-center text-gray-500 py-10">Loading messages...</p> //
                        ) : (
                           <ChatView
                                matchInfo={selectedChatMatch}
                                initialData={initialChatData} // Pass combined data object
                                onBack={handleBackToList}
                                currentUserId={currentUser.id}
                                onUnmatchRequest={() => openUnmatchConfirmation(selectedChatMatch)}
                            />
                        )}
                    </div>
                )}
            </main>

             {/* Confirmation Modal Render */}
            {matchToUnmatch && (
                <ConfirmationModal
                    isOpen={showUnmatchConfirm}
                    title="Unmatch User"
                    message={`Are you sure you want to unmatch ${matchToUnmatch.name}? You won't be able to message them anymore.`}
                    confirmText="Unmatch"
                    cancelText="Cancel"
                    onConfirm={confirmUnmatch}
                    onCancel={closeUnmatchConfirmation}
                    isDestructive={true}
                />
            )}
        </>
    );
};

export default Messages;