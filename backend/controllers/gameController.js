import { Game, Review } from '../models/index.js';

const getPopularGames = async (req, res) => {
  console.log("🎮 Requête reçue sur /api/games/popular !");

  try {
    console.log("🛠 Exécution de la requête Sequelize...");

    const games = await Game.findAll({
      attributes: [
        'game_id',
        'igdb_id',
        'title',
        'release_date',
        'publisher',
        'genres',
        'platforms',
        'description',
        'cover_url',
        'average_rate',
        'created_at'
      ],
      order: [['average_rate', 'DESC NULLS LAST'], ['release_date', 'DESC']],
      limit: 20,
    });

    console.log("✅ Jeux récupérés avec succès !");
    console.log("📜 Nombre de jeux retournés :", games.length);

    res.json(games);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des jeux populaires :", error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des jeux populaires', 
      error: error.message 
    });
  }
};
const getGameDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const game = await Game.findByPk(id, {
      include: [
        {
          model: Review,
          as: 'GameReviews',
          attributes: ['review_id', 'user_id', 'rating', 'review_text', 'created_at'],
          where: { resource_type: 'game' },
          required: false,
        },
      ],
    });

    if (!game) return res.status(404).json({ message: 'Jeu non trouvé' });

    res.json(game);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du jeu:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails du jeu' });
  }
};

export { getPopularGames, getGameDetails };
