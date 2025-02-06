import express from 'express';
import { createUser, createReview } from '../controllers/userController.js';

const router = express.Router();

// User Routes
router.post('/register', createUser);             // Create user
router.post('/review', createReview);     // Create review

export default router;
