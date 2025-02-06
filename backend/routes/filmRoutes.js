import express from 'express';
import { getPopularFilms, getFilmDetails, addReview, searchFilms } from '../controllers/filmController.js';
import Film from '../models/Film.js';

const router = express.Router();

// Test endpoint to check MongoDB connection
router.get('/test', async (req, res) => {
  try {
    const count = await Film.countDocuments();
    res.json({ 
      status: 'success',
      message: 'MongoDB connection is working',
      filmCount: count
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'MongoDB connection failed',
      error: error.message
    });
  }
});

// Film routes
router.get('/films/popular', getPopularFilms);
router.get('/films/search', searchFilms);
router.get('/films/:id', getFilmDetails);

// Review routes
router.post('/films/:id/reviews', addReview);

export default router;
