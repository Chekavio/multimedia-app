import express from 'express';
import {
  getPopularGames,
  getRecentlyReleasedGames,
  getRecentlyAddedGames,
  getGameDetails
} from '../controllers/gameController.js';

const router = express.Router();

router.get('/popular', getPopularGames);
router.get('/recently-released', getRecentlyReleasedGames);
router.get('/recently-added', getRecentlyAddedGames);
router.get('/:id', getGameDetails);

export default router;
