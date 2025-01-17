import { Track, Album, Artist } from '../models/index.js';

// 🎤 Récupérer tous les artistes
export const getArtists = async (req, res) => {
    try {
        const artists = await Artist.findAll();
        res.json(artists);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des artistes", error });
    }
};

// 🎤 Récupérer un artiste par ID avec ses albums et sa note moyenne
export const getArtistById = async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.id, {
            include: [Album]
        });

        if (!artist) return res.status(404).json({ message: "Artiste non trouvé" });

        const avgRating = await artist.calculateAverageRating();
        res.json({ ...artist.toJSON(), average_rating: avgRating });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'artiste", error });
    }
};

// 📀 Récupérer tous les albums
export const getAlbums = async (req, res) => {
    try {
        const albums = await Album.findAll();
        res.json(albums);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des albums", error });
    }
};

// 📀 Récupérer un album par ID avec ses tracks et sa note moyenne
export const getAlbumById = async (req, res) => {
    try {
        const album = await Album.findByPk(req.params.id, {
            include: [Track]
        });

        if (!album) return res.status(404).json({ message: "Album non trouvé" });

        const avgRating = await album.calculateAverageRating();
        res.json({ ...album.toJSON(), average_rating: avgRating });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'album", error });
    }
};

// 🎵 Récupérer toutes les musiques
export const getTracks = async (req, res) => {
    try {
        const tracks = await Track.findAll();
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des musiques", error });
    }
};

// 🎵 Récupérer une musique par ID
export const getTrackById = async (req, res) => {
    try {
        const track = await Track.findByPk(req.params.id);
        if (!track) return res.status(404).json({ message: "Morceau non trouvé" });

        res.json(track);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du morceau", error });
    }
};
