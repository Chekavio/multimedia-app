import dotenv from 'dotenv';
import axios from 'axios';
import { sequelize, Artist, Album, Track } from '../models/index.js';

dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const BASE_URL_SPOTIFY = "https://api.spotify.com/v1";
const BASE_URL_MUSICBRAINZ = "https://musicbrainz.org/ws/2";
let ACCESS_TOKEN = null;

// 📌 Fonction pour ajouter une pause entre les requêtes (évite le blocage API)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 📌 Obtenir un Token Spotify
const getSpotifyToken = async () => {
    try {
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const response = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        ACCESS_TOKEN = response.data.access_token;
        console.log("✅ Token Spotify récupéré !");
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du token Spotify :", error.response?.data || error.message);
    }
};

// 📌 Gestion des erreurs 429 (Rate Limit)
const retryRequest = async (func, args, maxRetries = 5) => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await func(...args);
        } catch (error) {
            if (error.response?.status === 429) {
                const retryAfter = Math.min(error.response.headers['retry-after'] || 5, 60); // Max 60 sec d'attente
                console.warn(`⚠️ API Rate Limit atteint. Nouvelle tentative dans ${retryAfter} sec...`);
                await sleep(retryAfter * 1000);
                attempt++;
            } else {
                throw error;
            }
        }
    }
    console.error(`❌ Requête échouée après ${maxRetries} tentatives.`);
    return null;
};

// 📌 Récupérer des artistes par genre
const fetchArtistsByGenre = async (genre, limit = 50) => {
    return await retryRequest(async () => {
        await sleep(500); // ✅ Ajout d'un délai pour éviter le blocage
        const response = await axios.get(`${BASE_URL_SPOTIFY}/search`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
            params: { q: `genre:${genre}`, type: 'artist', limit }
        });

        return response.data.artists.items.map(artist => artist.id);
    }, []);
};

// 📌 Récupérer des infos avancées via MusicBrainz
const fetchArtistExtraData = async (artistName, artistType) => {
    try {
        const response = await axios.get(`${BASE_URL_MUSICBRAINZ}/artist`, {
            params: { query: artistName, fmt: 'json' }
        });

        if (!response.data.artists.length) return null;
        const artistData = response.data.artists[0];

        let formed_date = null;
        let disband_date = null;

        if (artistType === 'solo') {
            formed_date = artistData["life-span"]?.begin || null;
            disband_date = artistData["life-span"]?.end || null;
        } else {
            formed_date = artistData["life-span"]?.begin || null;
            disband_date = artistData["life-span"]?.end || null;
        }

        return {
            formed_date,
            disband_date,
            origin: artistData.area?.name || null,
            label: artistData["label"] || null, 
        };
    } catch (error) {
        console.error(`❌ Erreur récupération artiste ${artistName} sur MusicBrainz:`, error.message);
        return null;
    }
};

// 📌 Récupérer et stocker les artistes, albums et tracks
const storeMusicData = async () => {
    await getSpotifyToken();
    if (!ACCESS_TOKEN) return;

    const genres = ['pop', 'rock', 'hip-hop', 'jazz', 'metal', 'electronic', 'classical', 'blues'];
    let totalArtists = 0;

    for (const genre of genres) {
        if (totalArtists >= 100000) break;

        const artistIds = await fetchArtistsByGenre(genre, 50);
        for (const artistId of artistIds) {
            if (totalArtists >= 100000) break;

            try {
                const artistResponse = await retryRequest(async () => {
                    await sleep(500); // ✅ Ajout d'un délai
                    return await axios.get(`${BASE_URL_SPOTIFY}/artists/${artistId}`, {
                        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
                    });
                }, []);

                if (!artistResponse) continue;

                const artist = artistResponse.data;
                const artistType = artist.type === 'artist' ? 'solo' : 'band';
                const extraData = await fetchArtistExtraData(artist.name, artistType);
                
                let dbArtist = await Artist.findOne({ where: { spotify_id: artist.id } });

                if (!dbArtist) {
                    dbArtist = await Artist.create({
                        spotify_id: artist.id,
                        name: artist.name,
                        image_url: artist.images[0]?.url || null,
                        genres: artist.genres,
                        formed_date: extraData?.formed_date || null,
                        disband_date: extraData?.disband_date || null,
                        label: extraData?.label || null,
                        origin: extraData?.origin || null,
                        artist_type: artistType,
                    });
                }

                console.log(`🎤 Artiste ajouté : ${artist.name}`);
                totalArtists++;

                const albumsResponse = await retryRequest(async () => {
                    await sleep(500);
                    return await axios.get(`${BASE_URL_SPOTIFY}/artists/${artistId}/albums`, {
                        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
                        params: { include_groups: 'album,single,ep,compilation', limit: 50 }
                    });
                }, []);

                for (const album of albumsResponse.data.items) {
                    let dbAlbum = await Album.findOne({ where: { spotify_id: album.id } });

                    if (!dbAlbum) {
                        dbAlbum = await Album.create({
                            spotify_id: album.id,
                            title: album.name,
                            artist_id: dbArtist.artist_id,
                            release_date: album.release_date,
                            cover_url: album.images[0]?.url || null,
                            label: album.label || null,
                            record_type: album.album_group || album.album_type || 'unknown'
                        });
                    }

                    console.log(`📀 Album ajouté : ${album.name}`);

                    const tracksResponse = await retryRequest(async () => {
                        await sleep(500);
                        return await axios.get(`${BASE_URL_SPOTIFY}/albums/${album.id}/tracks`, {
                            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
                        });
                    }, []);

                    for (const track of tracksResponse.data.items) {
                        if (!await Track.findOne({ where: { spotify_id: track.id } })) {
                            await Track.create({
                                spotify_id: track.id,
                                title: track.name,
                                album_id: dbAlbum.album_id,
                                artist_id: dbArtist.artist_id,
                                duration: Math.round(track.duration_ms / 1000),
                                track_number: track.track_number,
                                explicit: track.explicit,
                            });
                            console.log(`🎵 Track ajoutée : ${track.name}`);
                        }
                    }
                }
            } catch (error) {
                console.error(`❌ Erreur récupération artiste ${artistId}:`, error.message);
            }
        }
    }
};

// 📌 Exécuter le script
sequelize.authenticate()
    .then(async () => {
        console.log("✅ Connexion DB réussie.");
        await storeMusicData();
        sequelize.close();
    })
    .catch(error => console.error("❌ Erreur connexion DB:", error.message));
