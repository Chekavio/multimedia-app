import axios from 'axios';
import dotenv from 'dotenv';
import { sequelize, Film } from '../models/index.js';

dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3/discover/movie';

const MAX_CONCURRENT_REQUESTS = 10; // 🔥 Téléchargement parallèle
const START_YEAR = 2025;
const END_YEAR = 1900;

// 📌 Genres à exclure pour éviter les films X
const EXCLUDED_GENRES = ["Adult", "Erotic", "Pornographic"];

// 📌 Mots-clés pour détecter les films X dans la description
const BANNED_WORDS = ["explicit", "porn", "erotic", "uncensored", "hardcore", "adult film", "xxx", "18+"];

// 📌 Fonction pour récupérer les films d'une année spécifique
const fetchMoviesForYear = async (year, page) => {
    try {
        const response = await axios.get(BASE_URL, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
            params: {
                api_key: API_KEY,
                sort_by: "popularity.desc",
                "primary_release_year": year, // ✅ Filtrage par année
                include_adult: false, // 🚫 Pas de films X
                include_video: false,
                page
            }
        });

        return response.data;
    } catch (error) {
        console.error(`❌ Erreur pour l'année ${year}, page ${page}:`, error.response?.data || error.message);
        return null;
    }
};

// 📌 Fonction pour récupérer TOUS les films de 2025 à 1900
const fetchAndStoreMovies = async () => {
    for (let year = START_YEAR; year >= END_YEAR; year--) {
        console.log(`📅 Récupération des films de l'année ${year}...`);

        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages) {
            const pagesToFetch = [];

            for (let i = 0; i < MAX_CONCURRENT_REQUESTS && currentPage <= totalPages; i++) {
                pagesToFetch.push(fetchMoviesForYear(year, currentPage));
                currentPage++;
            }

            console.log(`📥 Téléchargement des pages ${currentPage - MAX_CONCURRENT_REQUESTS} à ${currentPage - 1} pour ${year}...`);

            const responses = await Promise.all(pagesToFetch);
            const movies = responses.flatMap(res => (res ? res.results : []));

            if (responses[0]) {
                totalPages = responses[0].total_pages > 500 ? 500 : responses[0].total_pages; // ✅ Limite à 500 pages max
            }

            console.log(`✅ ${movies.length} films récupérés pour ${year}, page ${currentPage - MAX_CONCURRENT_REQUESTS}...`);

            await fetchAndStoreMovieDetails(movies);
        }
    }

    console.log(`🎬 ✅ Récupération terminée pour toutes les années.`);
};

// 📌 Fonction pour récupérer les détails d’un film
const fetchMovieDetails = async (movieId) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
            params: { api_key: API_KEY, append_to_response: 'credits' },
        });

        const movie = response.data;

        return {
            tmdb_id: movie.id,
            title: movie.title,
            original_language: movie.original_language,
            release_date: movie.release_date || null,
            description: movie.overview || '',
            poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            genres: movie.genres.map(g => g.name),
            casting: movie.credits.cast.slice(0, 20).map(actor => actor.name),
            director: movie.credits.crew.find((member) => member.job === 'Director')?.name || null,
            duration: movie.runtime || null
        };
    } catch (error) {
        console.error(`❌ Erreur pour le film ID ${movieId}:`, error.response?.data || error.message);
        return null;
    }
};

// 📌 Fonction pour filtrer et exclure les films X
const filterNonXMovies = (movies) => {
    return movies.filter(movie => {
        const isAdultGenre = movie.genres.some(genre => EXCLUDED_GENRES.includes(genre));
        const isExplicitContent = BANNED_WORDS.some(word => movie.description.toLowerCase().includes(word));

        return !isAdultGenre && !isExplicitContent;
    });
};

// 📌 Fonction pour stocker les films en base (Évite les doublons)
const fetchAndStoreMovieDetails = async (movies) => {
    const moviesToInsert = [];

    for (const movie of movies) {
        const existingMovie = await Film.findOne({ where: { tmdb_id: movie.id } });
        if (existingMovie) {
            console.log(`⚠️ Film déjà en base : ${movie.title} (${movie.release_date})`);
            continue;
        }

        const movieDetails = await fetchMovieDetails(movie.id);
        if (movieDetails) {
            moviesToInsert.push(movieDetails);
        }
    }

    // ✅ Filtrer les films X avant insertion
    const safeMovies = filterNonXMovies(moviesToInsert);

    if (safeMovies.length > 0) {
        await Film.bulkCreate(safeMovies, { ignoreDuplicates: true });
        console.log(`✅ ${safeMovies.length} films ajoutés en base.`);
    }
};

// 📌 Fonction pour supprimer les doublons en base PostgreSQL
const removeDuplicateMovies = async () => {
    console.log("🛠 Vérification et suppression des doublons...");
    await sequelize.query(`
        DELETE FROM films
        WHERE ctid NOT IN (
            SELECT MIN(ctid)
            FROM films
            GROUP BY tmdb_id
        )
    `);
    console.log("✅ Suppression des doublons terminée.");
};

// 📌 Lancer la récupération
sequelize.authenticate()
    .then(async () => {
        console.log('✅ Connexion à la base de données réussie.');
        await fetchAndStoreMovies();
        await removeDuplicateMovies(); // ✅ Nettoyage des doublons après insertion
        sequelize.close();
    })
    .catch((error) => console.error('❌ Erreur de connexion à la base de données :', error.message));
