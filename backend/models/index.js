import express from 'express';
import filmRoutes from '../routes/filmRoutes.js';

const router = express.Router();

router.use('/films', filmRoutes);

export default router;
