import express from 'express';
import {
  getPopularArtists,
  getPopularAlbums,
  getPopularTracks,
  getArtistDetails,
  getAlbumDetails,
  getTrackDetails
} from '../controllers/musicController.js';

const router = express.Router();

router.get('/artists/popular', getPopularArtists);
router.get('/albums/popular', getPopularAlbums);
router.get('/tracks/popular', getPopularTracks);
router.get('/artists/:id', getArtistDetails);
router.get('/albums/:id', getAlbumDetails);
router.get('/tracks/:id', getTrackDetails);

export default router;
