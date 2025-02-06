import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Film from '../models/Film.js';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env') });

// Configuration
const API_KEY = process.env.TMDB_API_KEY;
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
const MONGODB_URI = process.env.MONGODB_URI;
const CHECKPOINT_FILE = join(__dirname, 'tmdb_checkpoint.json');
const ERROR_LOG = join(__dirname, 'tmdb_errors.log');

// État global pour les statistiques
let stats = {
    totalProcessed: 0,
    added: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    lastYear: null,
    lastPage: null,
    startTime: Date.now()
};

// Charger le point de reprise s'il existe
const loadCheckpoint = () => {
    try {
        if (fs.existsSync(CHECKPOINT_FILE)) {
            const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
            stats = { ...stats, ...data };
            console.log('📥 Point de reprise chargé:', data);
            return data;
        }
    } catch (error) {
        console.error('⚠️ Erreur lors du chargement du point de reprise:', error);
    }
    return null;
};

// Sauvegarder le point de reprise
const saveCheckpoint = () => {
    try {
        fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(stats, null, 2));
        console.log('💾 Point de reprise sauvegardé');
    } catch (error) {
        console.error('⚠️ Erreur lors de la sauvegarde du point de reprise:', error);
    }
};

// Logger les erreurs
const logError = (error, context) => {
    const timestamp = new Date().toISOString();
    const errorMsg = `[${timestamp}] ${context}: ${error.message}\n`;
    fs.appendFileSync(ERROR_LOG, errorMsg);
    stats.errors++;
};

// Configuration axios optimisée
const axiosInstance = axios.create({
    timeout: 30000,
    headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Accept': 'application/json',
        'Accept-Language': 'fr-FR'
    },
    httpsAgent: new https.Agent({
        keepAlive: true,
        maxSockets: 50
    })
});

// Fonction pour attendre avec backoff exponentiel
const delay = async (ms, retryCount = 0) => {
    const backoff = ms * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, backoff));
};

// Fonction pour faire une requête avec retry intelligent
const makeRequest = async (endpoint, params = {}, retryCount = 0) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}${endpoint}`, { params });
        return response.data;
    } catch (error) {
        const isRateLimitError = error.response?.status === 429;
        const isServerError = error.response?.status >= 500;
        const isNetworkError = !error.response;

        if ((isRateLimitError || isServerError || isNetworkError) && retryCount < 5) {
            const waitTime = isRateLimitError 
                ? parseInt(error.response.headers['retry-after']) * 1000 || 10000
                : 2000 * Math.pow(2, retryCount);

            console.log(`⏳ Attente de ${waitTime/1000}s avant nouvelle tentative (${retryCount + 1}/5)...`);
            await delay(waitTime, retryCount);
            return makeRequest(endpoint, params, retryCount + 1);
        }
        throw error;
    }
};

// Fonction pour récupérer les films avec gestion d'erreurs améliorée
const fetchMoviesForYear = async (year, page) => {
    try {
        console.log(`\n🔍 Recherche des films de ${year} (page ${page})...`);
        
        const data = await makeRequest('/search/movie', {
            api_key: API_KEY,
            query: year.toString(),
            year: year,
            include_adult: false,
            page,
            region: 'FR',
            language: 'fr-FR'
        });

        if (!data.results?.length) {
            console.log(`ℹ️ Aucun film trouvé pour ${year} (page ${page})`);
            return null;
        }

        // Filtrer et valider les résultats
        const validMovies = data.results.filter(movie => {
            const movieYear = new Date(movie.release_date).getFullYear();
            return movieYear === year && movie.title && movie.id;
        });

        console.log(`✅ Trouvé ${validMovies.length} films valides sur ${data.results.length} résultats`);
        
        // Mettre à jour les stats
        stats.totalProcessed += validMovies.length;
        stats.lastYear = year;
        stats.lastPage = page;
        saveCheckpoint();

        return { ...data, results: validMovies };
    } catch (error) {
        logError(error, `Récupération films ${year} page ${page}`);
        console.error(`❌ Erreur pour ${year} page ${page}:`, error.message);
        return null;
    }
};

// Fonction pour récupérer les détails d'un film avec retry
const fetchMovieDetails = async (movieId) => {
    try {
        const data = await makeRequest(`/movie/${movieId}`, {
            api_key: API_KEY,
            append_to_response: 'credits,keywords'
        });

        return {
            tmdb_id: data.id,
            title: data.title,
            release_date: data.release_date,
            director: data.credits?.crew?.find(p => p.job === "Director")?.name || "",
            genres: data.genres?.map(g => g.name) || [],
            description: data.overview,
            poster_url: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
            duration: data.runtime,
            casting: data.credits?.cast?.slice(0, 5).map(a => a.name) || [],
            keywords: data.keywords?.keywords?.map(k => k.name) || []
        };
    } catch (error) {
        logError(error, `Détails film ${movieId}`);
        return null;
    }
};

// Fonction principale avec reprise sur erreur
const main = async () => {
    try {
        // Connexion MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        // Charger le dernier point de reprise
        const checkpoint = loadCheckpoint();
        const startYear = checkpoint?.lastYear || 2024;
        const startPage = checkpoint?.lastPage ? checkpoint.lastPage + 1 : 1;

        console.log(`🚀 Démarrage depuis ${startYear} (page ${startPage})`);

        for (let year = startYear; year >= 1900; year--) {
            let page = year === startYear ? startPage : 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const data = await fetchMoviesForYear(year, page);
                
                if (!data) {
                    hasMorePages = false;
                    continue;
                }

                // Traiter les films par lots de 5
                const movies = data.results;
                for (let i = 0; i < movies.length; i += 5) {
                    const batch = movies.slice(i, i + 5);
                    await Promise.all(batch.map(async (movie) => {
                        try {
                            const details = await fetchMovieDetails(movie.id);
                            if (!details) return;

                            const existing = await Film.findOne({ tmdb_id: details.tmdb_id });
                            if (existing) {
                                await Film.updateOne({ tmdb_id: details.tmdb_id }, details);
                                stats.updated++;
                            } else {
                                await Film.create({ ...details, resource_id: uuidv4() });
                                stats.added++;
                            }
                        } catch (error) {
                            logError(error, `Traitement film ${movie.id}`);
                        }
                    }));

                    // Afficher les stats toutes les 20 films
                    if ((stats.totalProcessed % 20) === 0) {
                        const elapsed = (Date.now() - stats.startTime) / 1000;
                        console.log(`\n📊 Stats après ${elapsed.toFixed(0)}s:`);
                        console.log(`- Films traités: ${stats.totalProcessed}`);
                        console.log(`- Ajoutés: ${stats.added}`);
                        console.log(`- Mis à jour: ${stats.updated}`);
                        console.log(`- Erreurs: ${stats.errors}`);
                        console.log(`- Vitesse: ${(stats.totalProcessed / elapsed).toFixed(2)} films/s\n`);
                    }
                }

                hasMorePages = page < data.total_pages;
                page++;
                await delay(1000); // Pause entre les pages
            }
        }

        console.log('\n✅ Importation terminée !');
        console.log(`📊 Bilan final:`);
        console.log(`- Films traités: ${stats.totalProcessed}`);
        console.log(`- Ajoutés: ${stats.added}`);
        console.log(`- Mis à jour: ${stats.updated}`);
        console.log(`- Erreurs: ${stats.errors}`);

    } catch (error) {
        console.error('❌ Erreur critique:', error);
        logError(error, 'Erreur critique');
    } finally {
        await mongoose.connection.close();
    }
};

// Lancer le script
main();
