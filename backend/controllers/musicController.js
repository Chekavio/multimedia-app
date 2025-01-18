import { Artist, Album, Track, Review } from '../models/index.js';
import Sequelize from 'sequelize';

// 🎤 Artistes populaires
const getPopularArtists = async (req, res) => {
    console.log("🎤 Requête reçue sur /api/music/artists/popular !");
  
    try {
      console.log("🛠 Exécution de la requête Sequelize...");
  
      const artists = await Artist.findAll({
        attributes: [
          'artist_id',
          'spotify_id',
          'name',
          'image_url',
          'genres',
          'label',
          'artist_type',
          'formed_date',
          'disband_date',
          'origin',
          'average_rate',
          'created_at'
        ],
        order: [['average_rate', 'DESC NULLS LAST']],
        limit: 20,
      });
  
      console.log("✅ Artistes récupérés avec succès !");
      console.log("📜 Nombre d'artistes retournés :", artists.length);
  
      res.json(artists);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des artistes populaires :", error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des artistes populaires', 
        error: error.message 
      });
    }
  };
  
  // 🎵 Albums populaires
  const getPopularAlbums = async (req, res) => {
    console.log("💿 Requête reçue sur /api/music/albums/popular !");
  
    try {
      console.log("🛠 Exécution de la requête Sequelize...");
  
      const albums = await Album.findAll({
        attributes: [
          'album_id',
          'spotify_id',
          'title',
          'artist_id',
          'release_date',
          'cover_url',
          'average_rate',
          'created_at'
        ],
        include: [{ model: Artist, attributes: ['name', 'artist_id'] }],
        order: [['average_rate', 'DESC NULLS LAST'], ['release_date', 'DESC']],
        limit: 20,
      });
  
      console.log("✅ Albums récupérés avec succès !");
      console.log("📜 Nombre d'albums retournés :", albums.length);
  
      res.json(albums);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des albums populaires :", error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des albums populaires', 
        error: error.message 
      });
    }
  };
  
  // 🎼 Tracks populaires
  const getPopularTracks = async (req, res) => {
    console.log("🎼 Requête reçue sur /api/music/tracks/popular !");
  
    try {
      console.log("🛠 Exécution de la requête Sequelize...");
  
      const tracks = await Track.findAll({
        attributes: [
          'track_id',
          'spotify_id',
          'title',
          'album_id',
          'artist_id',
          'duration',
          'track_number',
          'explicit',
          'average_rate',
          'created_at'
        ],
        include: [
          { model: Artist, attributes: ['name', 'artist_id'] },
          { model: Album, attributes: ['title', 'album_id'] }
        ],
        order: [['average_rate', 'DESC NULLS LAST']],
        limit: 20,
      });
  
      console.log("✅ Tracks récupérées avec succès !");
      console.log("📜 Nombre de tracks retournées :", tracks.length);
  
      res.json(tracks);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des tracks populaires :", error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des tracks populaires', 
        error: error.message 
      });
    }
  };

/**
 * Récupère les détails d'un artiste
 */
const getArtistDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const artist = await Artist.findByPk(id, {
      include: [
        { model: Album },
        { model: Track },
        { model: Review, as: 'ArtistReviews', where: { resource_type: 'artist' }, required: false },
      ],
    });

    if (!artist) return res.status(404).json({ message: 'Artiste non trouvé' });

    res.json(artist);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails de l\'artiste:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails de l\'artiste' });
  }
};



/**
 * Récupère les détails d'un album
 */
const getAlbumDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const album = await Album.findByPk(id, {
      include: [
        { model: Artist, attributes: ['artist_id', 'name', 'image_url'] },
        { model: Track },
        { model: Review, as: 'AlbumReviews', where: { resource_type: 'album' }, required: false },
      ],
    });

    if (!album) return res.status(404).json({ message: 'Album non trouvé' });

    res.json(album);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails de l\'album:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails de l\'album' });
  }
};



/**
 * Récupère les détails d'une track
 */
const getTrackDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const track = await Track.findByPk(id, {
      include: [
        { model: Album, attributes: ['album_id', 'title', 'cover_url'] },
        { model: Artist, attributes: ['artist_id', 'name', 'image_url'] },
        { model: Review, as: 'TrackReviews', where: { resource_type: 'track' }, required: false },
      ],
    });

    if (!track) return res.status(404).json({ message: 'Track non trouvée' });

    res.json(track);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails de la track:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails de la track' });
  }
};

export { 
  getPopularArtists, 
  getPopularAlbums, 
  getPopularTracks, 
  getArtistDetails, 
  getAlbumDetails, 
  getTrackDetails 
};
