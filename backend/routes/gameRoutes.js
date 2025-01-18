import express from 'express';
import { getPopularGames, getGameDetails } from '../controllers/gameController.js';

const router = express.Router();

router.get('/popular', getPopularGames);
router.get('/:id', getGameDetails);

export default router;
