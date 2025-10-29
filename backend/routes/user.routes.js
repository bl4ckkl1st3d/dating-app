// backend/routes/user.routes.js
import express from 'express';
// Add getPotentialMatches and recordSwipe to imports
import {
  getUserProfile,
  updateUserProfile, // Only text updates now
  uploadProfilePicture, // New function for picture upload
  getPotentialMatches,
  recordSwipe,
  getPendingMatch,      // <-- IMPORT NEW
  markMatchAsSeen      // <-- IMPORT NEW
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { uploadProfilePicMiddleware, handleUploadError } from '../middleware/upload.middleware.js';
const router = express.Router();

// Existing routes
router.get('/profile/:id', getUserProfile);
router.put('/profile/:id', authenticateToken, updateUserProfile);
router.post(
  '/profile/:id/upload', // Define a specific route for uploads
  authenticateToken,        // 1. Ensure user is logged in
  uploadProfilePicMiddleware, // 2. Handle the file upload itself
  handleUploadError,        // 3. Handle any errors from multer
  uploadProfilePicture      // 4. If upload is successful, update DB record
);

// --- ADD NEW ROUTES ---
// Route to get potential matches (requires authentication)
router.get('/potential-matches', authenticateToken, getPotentialMatches);

// Route to record a swipe (requires authentication)
router.post('/swipe', authenticateToken, recordSwipe);

// Route to get the oldest unseen match notification (requires auth)
router.get('/pending-match', authenticateToken, getPendingMatch);

// Route to mark a match notification as seen (requires auth)
router.post('/mark-match-seen', authenticateToken, markMatchAsSeen);
// --- END NEW ROUTES ---


export default router;