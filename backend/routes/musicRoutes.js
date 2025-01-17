import express from 'express';
import { getArtists, getArtistById, getAlbums, getAlbumById, getTracks, getTrackById } from '../controllers/musicController.js';

const router = express.Router();

// 🎤 Routes Artistes
router.get('/artists', getArtists); // Récupérer tous les artistes
router.get('/artists/:id', getArtistById); // Récupérer un artiste par ID

// 📀 Routes Albums
router.get('/albums', getAlbums); // Récupérer tous les albums
router.get('/albums/:id', getAlbumById); // Récupérer un album par ID

// 🎵 Routes Tracks
router.get('/tracks', getTracks); // Récupérer toutes les musiques
router.get('/tracks/:id', getTrackById); // Récupérer une musique par ID

export default router;
