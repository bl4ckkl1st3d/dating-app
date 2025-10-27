import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile/:id', getUserProfile);
router.put('/profile/:id', authenticateToken, updateUserProfile);

export default router;
