import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, Film } from '../models/index.js';
import axios from 'axios';

// 🔹 Définition de `__dirname` en mode ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔹 Charger `.env`
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("✅ TMDB_API_KEY:", process.env.TMDB_API_KEY || "❌ Non chargé !");
console.log("✅ TMDB_ACCESS_TOKEN:", process.env.TMDB_ACCESS_TOKEN || "❌ Non chargé !");

// 📌 Stocker les films déjà en base pour éviter les doublons
const existingMovieIds = new Set();
const loadExistingMovies = async () => {
    console.log("📥 Chargement des films existants...");
    const movies = await Film.findAll({ attributes: ['tmdb_id'] });
    movies.forEach(movie => existingMovieIds.add(movie.tmdb_id));
    console.log(`✅ ${existingMovieIds.size} films déjà enregistrés.`);
};

// 📌 Fonction pour récupérer les genres de TMDb
const fetchGenres = async () => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/genre/movie/list', {
            headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
            params: { api_key: process.env.TMDB_API_KEY, language: 'en-US' },
        });

        const genresMap = {};
        response.data.genres.forEach((genre) => {
            genresMap[genre.id] = genre.name;
        });

        return genresMap;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des genres :', error.response?.data || error.message);
        return {};
    }
};

// 📌 Fonction pour récupérer les détails d'un film (20 acteurs, réalisateur, durée)
// 📌 Fonction pour récupérer les détails d'un film (casting, réalisateur, durée)
const fetchMovieDetails = async (movieId) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
            params: { api_key: process.env.TMDB_API_KEY, append_to_response: 'credits' },
        });

        const movie = response.data;


        const director = movie.credits.crew.find((member) => member.job === 'Director')?.name || null;
        const casting = movie.credits.cast.slice(0, 20).map((actor) => actor.name).join(', ') || null;
        const duration = movie.runtime || null;

        return { director, casting, duration };
    } catch (error) {
        console.error(`❌ Erreur lors de la récupération des détails du film ID ${movieId}:`, error.response?.data || error.message);
        return { director: null, casting: null, duration: null };
    }
};


// 📌 Fonction principale pour récupérer et stocker les films (par année, des plus récents aux plus anciens)
const fetchAndStoreMovies = async () => {
    try {
        await loadExistingMovies(); // Charger les films existants en DB
        const genresMap = await fetchGenres();

        const startYear = new Date().getFullYear(); // Année actuelle
        const endYear = 1900;
        const moviesPerYear = 1000; // 🔹 Augmenté pour maximiser la récupération

        for (let year = startYear; year >= endYear; year--) {
            console.log(`📅 Récupération des films de l'année ${year}...`);

            for (let page = 1; page <= Math.ceil(moviesPerYear / 20); page++) { // Approximation de 20 films par page
                try {
                    const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
                        headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
                        params: {
                            api_key: process.env.TMDB_API_KEY,
                            language: 'en-US',
                            sort_by: 'popularity.desc',
                            primary_release_year: year,
                            page,
                        },
                    });

                    const movies = response.data.results;

                    if (!movies.length) break; // Si aucune donnée, arrêter cette année

                    for (const movie of movies) {
                        if (existingMovieIds.has(movie.id)) {
                            console.log(`⚠️ Film déjà existant : ${movie.title} (${year})`);
                            continue;
                        }

                        try {
                            const genres = `{${movie.genre_ids.map((id) => `"${genresMap[id] || 'Unknown'}"`).join(',')}}`;
                            const { director, casting, duration } = await fetchMovieDetails(movie.id);

                            await Film.create({
                                tmdb_id: movie.id,
                                title: movie.title,
                                release_date: movie.release_date || null,
                                description: movie.overview || '',
                                poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                                genres: Sequelize.fn('ARRAY', genres),  // 🔹 Fix PostgreSQL ARRAY !
                                casting,
                                director,
                                duration
                            });
                            
                            existingMovieIds.add(movie.id); // Ajouter au cache pour éviter les doublons
                            console.log(`✅ Film ajouté : ${movie.title} (${year})`);
                        } catch (err) {
                            console.error(`❌ Erreur lors de l'ajout du film ${movie.title}:`, err.message);
                        }
                    }
                } catch (err) {
                    console.error(`❌ Erreur lors de la récupération des films pour ${year} - Page ${page}:`, err.message);
                }
            }
        }

        console.log('🎬 ✅ Tous les films ont été ajoutés avec succès.');
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des films :', error.response?.data || error.message);
    }
};

// 📌 Exécuter le script en s'assurant que Sequelize est bien connecté
sequelize.authenticate()
    .then(async () => {
        console.log('✅ Connexion à la base de données réussie.');
        await fetchAndStoreMovies();
        sequelize.close();
    })
    .catch((error) => console.error('❌ Erreur de connexion à la base de données :', error.message));
