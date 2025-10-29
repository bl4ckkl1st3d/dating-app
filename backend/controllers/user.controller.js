import pool from '../config/database.js';
import path from 'path'; // Need path for file URL construction
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import AWS from 'aws-sdk'; // Import AWS SDK
import { v4 as uuidv4 } from 'uuid';

// Get user profile

// Helper to construct image URL
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

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

    if (userId !== parseInt(id)) {
      return res.status(403).json({ error: 'You can only update your own profile picture' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No profile picture file uploaded.' });
    }

    if (!BUCKET_NAME) {
        console.error('[S3 Upload] S3_BUCKET_NAME environment variable not set.');
        return res.status(500).json({ error: 'Server configuration error (S3 Bucket).' });
    }

    // --- Get current profile picture URL to delete later ---
    let oldImageUrl = null;
    let oldS3Key = null;
    try {
      const currentUserData = await pool.query(
        'SELECT profile_picture_url FROM users WHERE id = $1',
        [userId]
      );
      if (currentUserData.rows.length > 0 && currentUserData.rows[0].profile_picture_url) {
        oldImageUrl = currentUserData.rows[0].profile_picture_url;
        // Attempt to extract the S3 key (path within the bucket) from the old URL
        try {
            const urlParts = new URL(oldImageUrl);
            // Example: https://bucket-name.s3.region.amazonaws.com/profile-pictures/user-1-uuid.jpg
            // Key would be 'profile-pictures/user-1-uuid.jpg' (remove leading '/')
            oldS3Key = urlParts.pathname.substring(1);
        } catch (urlError) {
            console.warn(`[S3 Upload] Could not parse old image URL to get S3 key: ${oldImageUrl}`, urlError);
        }
      }
    } catch (dbError) {
      console.error(`[S3 Upload] Error fetching old image URL for user ${userId}:`, dbError);
      // Continue upload even if fetching old URL fails
    }

    // --- Upload new file to S3 ---
    const fileExtension = req.file.mimetype.split('/')[1];
    const newS3Key = `profile-pictures/user-${userId}-${uuidv4()}.${fileExtension}`; // Unique key

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: newS3Key,
      Body: req.file.buffer, // Use buffer from memoryStorage
      ContentType: req.file.mimetype,
      ACL: 'public-read' // Make file publicly readable (adjust if using signed URLs)
    };

    console.log(`[S3 Upload] Uploading ${newS3Key} to bucket ${BUCKET_NAME}...`);
    const s3UploadResponse = await s3.upload(uploadParams).promise();
    const newImageUrl = s3UploadResponse.Location; // Get the public URL from S3
    console.log(`[S3 Upload] Successfully uploaded. URL: ${newImageUrl}`);


    // --- Update database with the S3 URL ---
    const result = await pool.query(
      `UPDATE users
       SET profile_picture_url = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, name, age, bio, profile_picture_url, created_at, updated_at`,
      [newImageUrl, userId]
    );

    if (result.rows.length === 0) {
      console.error(`[S3 Upload] User ${userId} not found during DB update.`);
      // Try to delete the file just uploaded to S3 if DB update failed
      try {
          console.warn(`[S3 Upload] Attempting to delete recently uploaded file ${newS3Key} due to DB error...`);
          await s3.deleteObject({ Bucket: BUCKET_NAME, Key: newS3Key }).promise();
          console.warn(`[S3 Upload] Deleted ${newS3Key} from S3.`);
      } catch (deleteError) {
          console.error(`[S3 Upload] FAILED to delete ${newS3Key} from S3 after DB error:`, deleteError);
      }
      return res.status(404).json({ error: 'User not found during picture update.' });
    }

    // --- Delete old image from S3 (if it existed and we got the key) ---
    if (oldS3Key) {
      console.log(`[S3 Upload] Attempting to delete old S3 object: ${oldS3Key}`);
      try {
        await s3.deleteObject({ Bucket: BUCKET_NAME, Key: oldS3Key }).promise();
        console.log(`[S3 Upload] Successfully deleted old object: ${oldS3Key}`);
      } catch (deleteError) {
        console.error(`[S3 Upload] Error deleting old S3 object ${oldS3Key}:`, deleteError);
        // Log error but don't fail the overall request
      }
    }

    // --- Send success response ---
    res.json({
      message: 'Profile picture updated successfully',
      imageUrl: newImageUrl, // Send back the S3 URL
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Upload profile picture error (S3):', error);
    res.status(500).json({ error: 'Server error uploading profile picture.' });
    // Note: No local file to clean up here as it was in memory
  }
};
export const getPotentialMatches = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    // --- Read age filters from query parameters ---
    const minAgeParam = req.query.minAge;
    const maxAgeParam = req.query.maxAge;

    // Convert to integers, provide defaults if needed or handle parsing errors
    // Setting very broad defaults if parameters are missing/invalid
    const minAge = parseInt(minAgeParam, 10) || 18; // Default min 18 if not provided/invalid
    const maxAge = parseInt(maxAgeParam, 10) || 100; // Default max 100 if not provided/invalid

    console.log(`[Controller] Fetching potential matches for user ${currentUserId} with age range: ${minAge}-${maxAge}`);
    // --- End reading filters ---

    // --- Build the SQL query dynamically (better approach for optional filters) ---
    let queryText = `
       SELECT id, name, age, bio, profile_picture_url
       FROM users
       WHERE id != $1                                   -- Exclude self
       AND id NOT IN (
           SELECT swiped_id FROM swipes WHERE swiper_id = $1
       )                                               -- Exclude swiped
    `;
    const queryParams = [currentUserId];
    let paramIndex = 2; // Start index for additional parameters

    // Add age filter clauses if valid ages were determined
    if (minAge >= 18) {
        queryText += ` AND age >= $${paramIndex}`;
        queryParams.push(minAge);
        paramIndex++;
    }
    if (maxAge >= 18) { // Assuming maxAge could be less than minAge initially if default logic changes
        queryText += ` AND age <= $${paramIndex}`;
        queryParams.push(maxAge);
        paramIndex++;
    }

    queryText += `
       ORDER BY random() -- Or any other logic for ordering
       LIMIT 10 -- Limit the number of profiles sent at once
    `;
    // --- End building query ---

    console.log('[Controller] Executing SQL:', queryText);
    console.log('[Controller] With Params:', queryParams);

    // --- Execute the query ---
    const result = await pool.query(queryText, queryParams);
    // --- End executing query ---

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