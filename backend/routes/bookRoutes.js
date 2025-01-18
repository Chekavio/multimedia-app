import express from 'express';
import { getPopularBooks, getBookDetails } from '../controllers/bookController.js';

const router = express.Router();

router.get('/popular', getPopularBooks);
router.get('/:id', getBookDetails);

export default router;
