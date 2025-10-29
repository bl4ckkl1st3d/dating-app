import pool from '../config/database.js';
import path from 'path'; // Need path for file URL construction
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Get user profile

// Helper to construct image URL
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, email, name, age, bio, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, email, name, age, bio, profile_picture_url, created_at FROM users WHERE id = $1', // Added profile_picture_url
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
  try {
    const { id } = req.params;
    const { name, bio } = req.body;
    if (req.user.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name cannot be empty' });
    }
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name), bio = COALESCE($2, bio), updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, name, age, bio, profile_picture_url, created_at, updated_at`, //
      [name, bio, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Server error updating profile details' });
  }
  
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    // Only expect name and bio here
    const { name, bio } = req.body;

    // Verify user owns this profile
    if (req.user.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // Validate input (optional but recommended)
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name cannot be empty' });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio), -- Use COALESCE to allow partial updates (e.g., only updating bio)
           updated_at = NOW()      -- Update timestamp
       WHERE id = $3
       RETURNING id, email, name, age, bio, profile_picture_url, created_at, updated_at`, // Return updated data including pic url
      [name, bio, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: result.rows[0] }); // Added success message
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Server error updating profile details' }); // More specific error
  }
};
export const uploadProfilePicture = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Verify user owns this profile
        if (userId !== parseInt(id)) {
          return res.status(403).json({ error: 'You can only update your own profile picture' });
        }

        // Check if file was uploaded by multer
        if (!req.file) {
          return res.status(400).json({ error: 'No profile picture file uploaded.' });
        }

        // --- Step 1: Get the current profile picture URL before updating ---
        let oldImageUrl = null;
        try {
            const currentUserData = await pool.query(
                'SELECT profile_picture_url FROM users WHERE id = $1', //
                [userId]
            );
            if (currentUserData.rows.length > 0 && currentUserData.rows[0].profile_picture_url) {
                oldImageUrl = currentUserData.rows[0].profile_picture_url;
            }
        } catch (dbError) {
             console.error(`[Upload] Error fetching old image URL for user ${userId}:`, dbError);
             // Decide if you want to proceed without deleting or return an error
             // For now, we'll log and proceed
        }
        // --- End Step 1 ---

        // Construct the URL path for the *new* file
        const newImageUrl = `/uploads/${req.file.filename}`; // Relative path for DB/client
        console.log(`[Upload] User ${userId} uploaded ${req.file.filename}. New URL: ${newImageUrl}`);

        // --- Step 2: Update the database with the new URL ---
        const result = await pool.query(
          `UPDATE users
           SET profile_picture_url = $1, updated_at = NOW()
           WHERE id = $2
           RETURNING id, email, name, age, bio, profile_picture_url, created_at, updated_at`, //
          [newImageUrl, userId]
        );

        if (result.rows.length === 0) {
             console.error(`[Upload] User ${userId} not found during DB update for new image.`);
             // Attempt to delete the newly uploaded file since DB update failed
             try {
                 const newFilePath = path.join(UPLOADS_DIR, req.file.filename);
                 await fs.unlink(newFilePath);
                 console.log(`[Upload] Cleaned up orphaned file: ${req.file.filename}`);
             } catch (cleanupError) {
                 console.error(`[Upload] Error cleaning up orphaned file ${req.file.filename}:`, cleanupError);
             }
             return res.status(404).json({ error: 'User not found during picture update.' });
        }
        // --- End Step 2 ---


        // --- Step 3: Delete the old image file (if it existed) ---
        if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) { // Check if it's a path we manage
            const oldFilename = path.basename(oldImageUrl); // Extract filename from URL path
            const oldFilePath = path.join(UPLOADS_DIR, oldFilename);

            console.log(`[Upload] Attempting to delete old image for user ${userId}: ${oldFilePath}`);
            try {
                await fs.unlink(oldFilePath);
                console.log(`[Upload] Successfully deleted old image: ${oldFilename}`);
            } catch (unlinkError) {
                // Log error but don't fail the request if deletion fails (e.g., file already gone)
                if (unlinkError.code === 'ENOENT') {
                    console.warn(`[Upload] Old image not found, deletion skipped: ${oldFilename}`);
                } else {
                    console.error(`[Upload] Error deleting old image ${oldFilename}:`, unlinkError);
                }
            }
        } else if (oldImageUrl) {
            console.log(`[Upload] Old image URL (${oldImageUrl}) is not a local upload, skipping deletion.`);
        }
        // --- End Step 3 ---


        // Send success response
        res.json({
            message: 'Profile picture updated successfully',
            imageUrl: newImageUrl, // Send back the new relative URL
            user: result.rows[0] // Send back the updated user data
        });

    } catch (error) {
        console.error('Upload profile picture error:', error);
        // If an error occurred *after* file was uploaded but before response, try deleting the new file
        if (req.file) {
             try {
                 const newFilePath = path.join(UPLOADS_DIR, req.file.filename);
                 await fs.unlink(newFilePath);
                 console.log(`[Upload] Cleaned up file due to error: ${req.file.filename}`);
             } catch (cleanupError) {
                 console.error(`[Upload] Error cleaning up file ${req.file.filename} after main error:`, cleanupError);
             }
        }
        res.status(500).json({ error: 'Server error uploading profile picture.' });
    }
};
export const getPotentialMatches = async (req, res) => {
  try {
    const currentUserId = req.user.userId; // Get user ID from authenticated token

    // Query to find users that the current user hasn't swiped on yet,
    // excluding the current user themselves.
    // Adjust profile_picture_url based on your actual column name
    const result = await pool.query(
      `SELECT id, name, age, bio, profile_picture_url
       FROM users
       WHERE id != $1
       AND id NOT IN (
           SELECT swiped_id FROM swipes WHERE swiper_id = $1
       )
       ORDER BY random() -- Or any other logic for ordering
       LIMIT 10 -- Limit the number of profiles sent at once
      `,
      [currentUserId]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get potential matches error:', error);
    res.status(500).json({ error: 'Server error fetching potential matches' });
  }
};
export const recordSwipe = async (req, res) => {
  try {
    const swiperId = req.user.userId;
    const { swipedUserId, isLike } = req.body;

    // Basic validation
    if (swiperId === undefined || swipedUserId === undefined || typeof isLike !== 'boolean') {
        return res.status(400).json({ error: 'Missing or invalid swiperId, swipedUserId, or isLike' });
    }

    // Prevent swiping self
    if (swiperId === parseInt(swipedUserId)) {
        return res.status(400).json({ error: 'Cannot swipe on yourself' });
    }

    let isMatch = false; // Initialize match status

    // Use a transaction to ensure atomicity
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert or update the swipe record
        await client.query(
          `INSERT INTO swipes (swiper_id, swiped_id, is_like)
           VALUES ($1, $2, $3)
           ON CONFLICT (swiper_id, swiped_id) DO UPDATE SET is_like = $3, created_at = NOW()`, //
          [swiperId, swipedUserId, isLike]
        );

        // --- Check for a match ONLY if the current swipe is a 'like' ---
        if (isLike) {
            // Check if the other user (swipedUserId) has also liked the current user (swiperId)
            const reciprocalLikeResult = await client.query(
                `SELECT 1 FROM swipes
                 WHERE swiper_id = $1 AND swiped_id = $2 AND is_like = TRUE`, //
                [swipedUserId, swiperId] // Note the reversed IDs
            );

            if (reciprocalLikeResult.rows.length > 0) {
                // It's a match!
                isMatch = true;
                console.log(`[Swipe] Match found between User ${swiperId} and User ${swipedUserId}`);

                // Insert into the 'matches' table, handling potential conflicts (e.g., if already matched)
                // Ensure user1_id < user2_id to prevent duplicates like (1, 2) and (2, 1)
                const user1 = Math.min(swiperId, swipedUserId);
                const user2 = Math.max(swiperId, swipedUserId);

                await client.query(
                    `INSERT INTO matches (user1_id, user2_id)
                     VALUES ($1, $2)
                     ON CONFLICT (user1_id, user2_id) DO NOTHING`, //
                    [user1, user2]
                );
            }
        }
        // --- End match check ---

        await client.query('COMMIT'); // Commit the transaction

        // Send response with match status
        res.status(201).json({ message: 'Swipe recorded', isMatch: isMatch }); // <-- RETURN isMatch

    } catch (transactionError) {
        await client.query('ROLLBACK'); // Rollback on error
        console.error('[Swipe] Transaction error:', transactionError);
        res.status(500).json({ error: 'Server error recording swipe during transaction' });
    } finally {
        client.release(); // Release the client back to the pool
    }

  } catch (error) {
    console.error('[Swipe] General record swipe error:', error);
    res.status(500).json({ error: 'Server error recording swipe' });
  }
};

export const getPendingMatch = async (req, res) => {
    try {
        const currentUserId = req.user.userId;

        // Query for the oldest match involving the current user where their specific viewed_at is NULL
        const result = await pool.query(
            `SELECT
                m.id as match_id,
                CASE
                    WHEN m.user1_id = $1 THEN m.user2_id
                    ELSE m.user1_id
                END as other_user_id,
                u.name,
                u.age,
                u.bio,
                u.profile_picture_url
             FROM matches m
             JOIN users u ON u.id = (CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END)
             WHERE (m.user1_id = $1 AND m.user1_viewed_at IS NULL)
                OR (m.user2_id = $1 AND m.user2_viewed_at IS NULL)
             ORDER BY m.matched_at ASC -- Get the oldest first
             LIMIT 1`,
            [currentUserId]
        );

        if (result.rows.length > 0) {
            const matchedUser = {
                id: result.rows[0].other_user_id, // Return the other user's ID
                name: result.rows[0].name,
                age: result.rows[0].age,
                bio: result.rows[0].bio,
                profile_picture_url: result.rows[0].profile_picture_url,
                matchId: result.rows[0].match_id // Include matchId to mark as seen later
            };
            res.json({ match: matchedUser });
        } else {
            res.json({ match: null }); // No pending matches
        }
    } catch (error) {
        console.error('Get pending match error:', error);
        res.status(500).json({ error: 'Server error fetching pending match' });
    }
};

/**
 * Marks a specific match notification as seen by the current user.
 */
export const markMatchAsSeen = async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const { matchId } = req.body;

        if (!matchId) {
            return res.status(400).json({ error: 'Missing matchId' });
        }

        // Update the correct viewed_at column based on the user's ID in the match
        const result = await pool.query(
            `UPDATE matches
             SET
                user1_viewed_at = CASE WHEN user1_id = $1 THEN NOW() ELSE user1_viewed_at END,
                user2_viewed_at = CASE WHEN user2_id = $1 THEN NOW() ELSE user2_viewed_at END
             WHERE id = $2 AND (user1_id = $1 OR user2_id = $1) -- Ensure user is part of the match
             RETURNING id`, // Return ID to confirm update occurred
            [currentUserId, matchId]
        );

        if (result.rowCount === 0) {
             console.warn(`[Match Seen] No match found or updated for matchId ${matchId} and userId ${currentUserId}`);
             // You could return 404, but 200 is okay too if the goal is just idempotent marking
        }

        res.status(200).json({ message: 'Match marked as seen' });

    } catch (error) {
        console.error('Mark match as seen error:', error);
        res.status(500).json({ error: 'Server error marking match as seen' });
    }
};