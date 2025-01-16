import express from 'express';
import { getPopularBooks, getRecentlyAddedBooks, getBookDetails } from '../controllers/bookController.js';

const router = express.Router();

router.get('/popular', getPopularBooks);
router.get('/recently-added', getRecentlyAddedBooks);
router.get('/:id', getBookDetails);

export default router;
