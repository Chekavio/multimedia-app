import express from 'express';
import { createUser, loginUser, getUserProfile } from '../controllers/userController.js';

const router = express.Router();


// Route pour inscrire un utilisateur
router.post('/register', createUser);

// Route pour connecter un utilisateur
router.post('/login', loginUser);

// Route pour récupérer le profil utilisateur
router.get('/me', getUserProfile);

export default router;
