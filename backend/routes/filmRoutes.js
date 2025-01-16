import express from 'express';
import { getPopularFilms, getRecentlyReleasedFilms, getRecentlyAddedFilms, getFilmDetails } from '../controllers/filmController.js'; // ✅ Correction ici

const router = express.Router();

router.get('/popular', getPopularFilms);
router.get('/recently-released', getRecentlyReleasedFilms);
router.get('/recently-added', getRecentlyAddedFilms);
router.get('/:id', getFilmDetails);

export default router;
