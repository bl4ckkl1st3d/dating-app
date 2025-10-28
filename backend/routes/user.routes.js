// backend/routes/user.routes.js
import express from 'express';
// Add getPotentialMatches and recordSwipe to imports
import { getUserProfile, updateUserProfile, getPotentialMatches, recordSwipe } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Existing routes
router.get('/profile/:id', getUserProfile);
router.put('/profile/:id', authenticateToken, updateUserProfile);

// --- ADD NEW ROUTES ---
// Route to get potential matches (requires authentication)
router.get('/potential-matches', authenticateToken, getPotentialMatches);

// Route to record a swipe (requires authentication)
router.post('/swipe', authenticateToken, recordSwipe);
// --- END NEW ROUTES ---


export default router;