import express from 'express';
import { getPopularFilms, getFilmDetails } from '../controllers/filmController.js';

const router = express.Router();

router.get('/popular', getPopularFilms);
  
router.get('/:id', getFilmDetails);

export default router;
