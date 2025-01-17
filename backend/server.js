import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import { sequelize } from './models/index.js'; // Ajoute `.js`
import filmRoutes from './routes/filmRoutes.js'; // Ajoute `.js`
import userRoutes from './routes/userRoutes.js'; // Ajoute `.js`
import bookRoutes from './routes/bookRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import musicRoutes from './routes/musicRoutes.js'; // 🎶 Import des routes musique


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/films', filmRoutes); // Routes films
app.use('/api/users', userRoutes); // Routes utilisateurs
app.use('/api/books', bookRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/music', musicRoutes); // 🎶 Routes musique

// Test de connexion à la base de données
sequelize.authenticate()
  .then(() => console.log('✅ Connexion à la base de données réussie.'))
  .catch((err) => console.error('❌ Erreur de connexion à la base de données :', err));

// Synchroniser les modèles
sequelize.sync({ force: false, alter: true })  // 🔹 Ne supprime pas les données !

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
