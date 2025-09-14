import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes that anyone can access
router.post('/register', registerUser);
router.post('/login', loginUser);
// Route to get current logged-in user info
router.get('/me',protect, getCurrentUser);

// Private route - only a logged-in user can access this
router.post('/logout', protect, logoutUser);

export default router;
