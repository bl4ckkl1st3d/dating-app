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
