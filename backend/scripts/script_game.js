import dotenv from 'dotenv';
import axios from 'axios';
import { sequelize, Game } from '../models/index.js';

dotenv.config();

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const ACCESS_TOKEN = process.env.TWITCH_ACCESS_TOKEN;
const BASE_URL = "https://api.igdb.com/v4/games";
const HEADERS = {
  'Client-ID': CLIENT_ID,
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Accept': 'application/json'
};

// 📌 Fonction pour récupérer TOUS les jeux d'une année avec pagination
const fetchGamesByYear = async (year) => {
  let allGames = [];
  let offset = 0;
  const limit = 500;

  console.log(`📅 Récupération des jeux de l'année ${year}...`);

  while (true) {
    try {
      const query = `
        fields id, name, first_release_date, summary, cover.image_id, genres.name, platforms.name, involved_companies.company.name, involved_companies.publisher;
        where first_release_date >= ${new Date(year, 0, 1).getTime() / 1000}
          & first_release_date < ${new Date(year + 1, 0, 1).getTime() / 1000};
        limit ${limit};
        offset ${offset};
      `;

      const response = await axios.post(BASE_URL, query, { headers: HEADERS });
      const games = response.data || [];

      if (games.length === 0) {
        break; // 🛑 Stop si plus de résultats
      }

      allGames = allGames.concat(games);
      offset += limit; // 🔄 Passer à la page suivante

      console.log(`📥 ${games.length} jeux récupérés (Total: ${allGames.length})`);

    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des jeux pour ${year}:`, error.response?.data || error.message);
      break;
    }
  }

  return allGames;
};

// 📌 Fonction pour extraire le publisher
const extractPublisher = (companies) => {
  if (!companies) return null;

  const publisherCompany = companies.find(c => c.publisher);
  return publisherCompany ? publisherCompany.company.name : null;
};

// 📌 Insérer les jeux dans la base de données
const storeGames = async (games) => {
  for (const game of games) {
    try {
      const existingGame = await Game.findOne({ where: { igdb_id: game.id } });
      if (existingGame) {
        console.log(`⚠️ Jeu déjà existant : ${game.name}`);
        continue;
      }

      const publisher = extractPublisher(game.involved_companies);
      const genres = game.genres ? game.genres.map(g => g.name) : [];
      const platforms = game.platforms ? game.platforms.map(p => p.name) : [];

      await Game.create({
        igdb_id: game.id,
        title: game.name,
        release_date: game.first_release_date ? new Date(game.first_release_date * 1000) : null,
        description: game.summary || '',
        cover_url: game.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : null,
        genres,  
        platforms,  
        publisher
      });

      console.log(`✅ Jeu ajouté : ${game.name}`);
    } catch (err) {
      console.error(`⚠️ Erreur lors de l'ajout du jeu ${game.name}:`, err.message);
    }
  }
};

// 📌 Exécuter le script pour toutes les années (2025 → année la plus ancienne)
const fetchAndStoreGames = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie.');

    const startYear = 2025;
    const endYear = 1970; // Modifiable selon ton besoin

    for (let year = startYear; year >= endYear; year--) {
      const games = await fetchGamesByYear(year);
      if (games.length === 0) {
        console.log(`🚫 Aucun jeu trouvé pour ${year}.`);
        continue;
      }

      await storeGames(games);
    }

    console.log('🎮 ✅ Tous les jeux ont été ajoutés avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des jeux :', error.response?.data || error.message);
  } finally {
    await sequelize.close();
  }
};

// 🔥 Exécuter le script
fetchAndStoreGames();
