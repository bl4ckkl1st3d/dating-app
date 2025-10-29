// backend/routes/message.routes.js
import express from 'express';
import {
    getMatches,
    getMessagesByMatchId,
    sendMessage,
    markMessagesRead,
    unmatch
} from '../controllers/message.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js'; //

const router = express.Router();

// All message/match routes require authentication
router.use(authenticateToken);

// --- Match Routes ---
// GET /api/matches - Fetch all matches for the logged-in user
router.get('/matches', getMatches);

// DELETE /api/matches/:matchId - Unmatch a user
router.delete('/matches/:matchId', unmatch);


// --- Message Routes ---
// GET /api/messages/:matchId - Fetch message history for a match
router.get('/messages/:matchId', getMessagesByMatchId);

// POST /api/messages/:matchId - Send a message in a match
router.post('/messages/:matchId', sendMessage);

// POST /api/messages/:matchId/read - Mark messages in a match as read
router.post('/messages/:matchId/read', markMessagesRead);


export default router;