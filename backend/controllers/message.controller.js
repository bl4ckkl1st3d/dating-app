// backend/controllers/message.controller.js
import pool from '../config/database.js';

/**
 * Fetches all matches for the current user, including the other user's details
 * and the last message exchanged.
 */
export const getMatches = async (req, res) => {
    const currentUserId = req.user.userId;
    try {
        // Query to get matches, the other user's info, and the latest message
        const result = await pool.query(
            `WITH LastMessages AS (
                SELECT
                    m.id AS match_id,
                    msg.id AS message_id,
                    msg.content,
                    msg.sent_at,
                    msg.sender_id,
                    msg.read,
                    ROW_NUMBER() OVER(PARTITION BY m.id ORDER BY msg.sent_at DESC) as rn
                FROM matches m
                LEFT JOIN messages msg ON (
                    (msg.sender_id = m.user1_id AND msg.receiver_id = m.user2_id) OR
                    (msg.sender_id = m.user2_id AND msg.receiver_id = m.user1_id)
                )
                WHERE m.user1_id = $1 OR m.user2_id = $1
            )
            SELECT
                m.id AS match_id,
                CASE
                    WHEN m.user1_id = $1 THEN m.user2_id
                    ELSE m.user1_id
                END AS other_user_id,
                u.name,
                u.profile_picture_url,
                lm.content AS last_message_content,
                lm.sent_at AS last_message_sent_at,
                -- Check if the last message was NOT sent by the current user AND is unread
                (lm.sender_id IS NOT NULL AND lm.sender_id != $1 AND lm.read = FALSE) AS is_last_message_read_by_current_user
            FROM matches m
            JOIN users u ON u.id = (CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END)
            LEFT JOIN LastMessages lm ON m.id = lm.match_id AND lm.rn = 1
            WHERE m.user1_id = $1 OR m.user2_id = $1
            ORDER BY lm.sent_at DESC NULLS LAST, m.matched_at DESC; -- Order by last message time, then match time
            `,
            [currentUserId]
        );

        res.json({ matches: result.rows });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ error: 'Server error fetching matches' });
    }
};

/**
 * Fetches message history for a specific match.
 * Ensures the current user is part of the match.
 */
export const getMessagesByMatchId = async (req, res) => {
    const currentUserId = req.user.userId;
    const { matchId } = req.params;

    // Validate matchId is a number
    if (isNaN(parseInt(matchId))) {
        return res.status(400).json({ error: 'Invalid match ID format' });
    }
    const matchIdInt = parseInt(matchId);


    try {
        // Verify the current user is part of this match and get participant IDs
        const matchCheck = await pool.query(
            'SELECT user1_id, user2_id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
            [matchIdInt, currentUserId]
        );

        if (matchCheck.rowCount === 0) {
            console.warn(`[GetMessages] User ${currentUserId} attempted to access match ${matchIdInt} they are not part of.`);
            return res.status(403).json({ error: 'User is not part of this match' });
        }

        const { user1_id, user2_id } = matchCheck.rows[0];
        const otherUserId = (currentUserId === user1_id) ? user2_id : user1_id;

        // *** SIMPLIFIED MESSAGE FETCHING QUERY ***
        // Fetch messages where sender/receiver are the two users in the match
        const messagesResult = await pool.query(
            `SELECT id, sender_id, receiver_id, content, sent_at, read
             FROM messages
             WHERE (sender_id = $1 AND receiver_id = $2) -- User 1 to User 2
                OR (sender_id = $2 AND receiver_id = $1) -- User 2 to User 1
             ORDER BY sent_at ASC`,
            [user1_id, user2_id] // Use the actual IDs from the match
        );
        // *** END SIMPLIFIED QUERY ***

        // Fetch the ID of the latest message sent BY the current user that has been read BY the other user
        const lastReadResult = await pool.query(
            `SELECT MAX(id) as last_read_id
             FROM messages
             WHERE sender_id = $1    -- Sent BY current user
               AND receiver_id = $2  -- Received BY other user
               AND read = TRUE`,      // AND read by the other user
            [currentUserId, otherUserId]
        );

        const lastReadByOtherId = lastReadResult.rows[0]?.last_read_id || null;

        console.log(`[GetMessages] Fetched ${messagesResult.rowCount} messages for match ${matchIdInt}. Last read by other (${otherUserId}): ${lastReadByOtherId}`);

        res.json({
            messages: messagesResult.rows,
            lastReadByOtherId: lastReadByOtherId
        });

    } catch (error) {
        // Log the specific error from the database or elsewhere
        console.error(`[GetMessages] Error fetching messages/read status for match ${matchId}:`, error);
        res.status(500).json({ error: 'Server error fetching messages' }); // Generic error for client
    }
};

/**
 * Sends a message within a specific match.
 * Ensures the sender is the current user and part of the match.
 */
export const sendMessage = async (req, res) => {
    const senderId = req.user.userId;
    const { matchId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    try {
        // Get match participants to determine receiver and verify sender
        const matchResult = await pool.query(
            'SELECT user1_id, user2_id FROM matches WHERE id = $1',
            [matchId]
        );

        if (matchResult.rowCount === 0) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const { user1_id, user2_id } = matchResult.rows[0];

        if (senderId !== user1_id && senderId !== user2_id) {
            return res.status(403).json({ error: 'Sender is not part of this match' });
        }

        const receiverId = (senderId === user1_id) ? user2_id : user1_id;

        // Insert the message
        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, content, sent_at, read)
             VALUES ($1, $2, $3, NOW(), FALSE)
             RETURNING id, sender_id, receiver_id, content, sent_at, read`,
            [senderId, receiverId, content.trim()]
        );

        res.status(201).json({ message: result.rows[0] });
    } catch (error) {
        console.error(`Send message for match ${matchId} error:`, error);
        res.status(500).json({ error: 'Server error sending message' });
    }
};

/**
 * Marks messages received by the current user within a specific match as read.
 */
export const markMessagesRead = async (req, res) => {
    const currentUserId = req.user.userId;
    const { matchId } = req.params;

    try {
        // Verify user is part of the match first (optional but good practice)
        const matchCheck = await pool.query(
            'SELECT user1_id, user2_id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
            [matchId, currentUserId]
        );

        if (matchCheck.rowCount === 0) {
            return res.status(403).json({ error: 'User is not part of this match' });
        }

        const { user1_id, user2_id } = matchCheck.rows[0];
        const otherUserId = (currentUserId === user1_id) ? user2_id : user1_id;


        // Update messages sent by the *other* user to the *current* user
        const result = await pool.query(
            `UPDATE messages
             SET read = TRUE, read_at = NOW()
             WHERE receiver_id = $1
               AND sender_id = $2 -- Sent by the other user in the match
               AND read = FALSE`, // Only update unread messages
            [currentUserId, otherUserId]
        );

        console.log(`[MarkRead] Match ${matchId}, User ${currentUserId}: Marked ${result.rowCount} messages as read.`);
        res.status(200).json({ message: `Marked ${result.rowCount} messages as read` });
    } catch (error) {
        console.error(`Mark messages read for match ${matchId} error:`, error);
        res.status(500).json({ error: 'Server error marking messages read' });
    }
};

/**
 * Unmatches users by deleting the match record.
 * Ensures the current user is part of the match.
 */
export const unmatch = async (req, res) => {
    const currentUserId = req.user.userId;
    const { matchId } = req.params;

    try {
        // Delete the match record, ensuring the current user is part of it
        const result = await pool.query(
            'DELETE FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
            [matchId, currentUserId]
        );

        if (result.rowCount === 0) {
            // Either match didn't exist or user wasn't part of it
            return res.status(404).json({ error: 'Match not found or user not part of this match' });
        }

        // Optionally: You might want to delete messages between them too,
        // or keep them but make them inaccessible via the getMessages endpoint.
        // Deleting messages:
        // await pool.query(
        //     `DELETE FROM messages WHERE
        //      (sender_id = $1 AND receiver_id = $2) OR
        //      (sender_id = $2 AND receiver_id = $1)`,
        //     [user1_id_from_match, user2_id_from_match] // Need to fetch these before deleting match
        // );

        res.status(200).json({ message: 'Unmatch successful' });
    } catch (error) {
        console.error(`Unmatch error for match ${matchId}:`, error);
        res.status(500).json({ error: 'Server error during unmatch' });
    }
};