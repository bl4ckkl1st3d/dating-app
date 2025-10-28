import pool from '../config/database.js';

// Get user profile
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
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, bio } = req.body;

    // Verify user owns this profile
    if (req.user.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           bio = COALESCE($3, bio)
       WHERE id = $4
       RETURNING id, email, name, age, bio, created_at`,
      [name, age, bio, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Server error' });
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

    if (swiperId === undefined || swipedUserId === undefined || isLike === undefined) {
      return res.status(400).json({ error: 'Missing swiperId, swipedUserId, or isLike' });
    }

    // Insert the swipe record
    await pool.query(
      `INSERT INTO swipes (swiper_id, swiped_id, is_like)
       VALUES ($1, $2, $3)
       ON CONFLICT (swiper_id, swiped_id) DO UPDATE SET is_like = $3, created_at = NOW()`,
      [swiperId, swipedUserId, isLike]
    );

    // --- TODO: Check for a match ---
    // If isLike is true, check if the other user (swipedUserId) has also liked swiperId
    // If yes, insert into the 'matches' table

    res.status(201).json({ message: 'Swipe recorded' });

  } catch (error) {
    console.error('Record swipe error:', error);
    res.status(500).json({ error: 'Server error recording swipe' });
  }
};