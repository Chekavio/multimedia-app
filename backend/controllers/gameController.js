import { Game, Review } from '../models/index.js';
import Sequelize from 'sequelize';

const getPopularGames = async (req, res) => {
    try {
      const games = await Game.findAll({
        attributes: [
          'game_id',
          'title',
          'release_date',
          'developer',
          'publisher',
          'genres',
          'platforms',
          'cover_url',
          'created_at',
          [Sequelize.literal(`(
            SELECT AVG("reviews"."rating")
            FROM "reviews"
            WHERE "reviews"."resource_id" = "Game"."game_id"
            AND "reviews"."resource_type" = 'game'
          )`), 'averageRating'],
          [Sequelize.literal(`(
            SELECT COUNT("reviews"."review_id")
            FROM "reviews"
            WHERE "reviews"."resource_id" = "Game"."game_id"
            AND "reviews"."resource_type" = 'game'
          )`), 'reviewCount'],
        ],
        order: [
          [Sequelize.literal(`(
            SELECT AVG("reviews"."rating")
            FROM "reviews"
            WHERE "reviews"."resource_id" = "Game"."game_id"
            AND "reviews"."resource_type" = 'game'
          )`), 'DESC NULLS LAST'],
          ['release_date', 'DESC'],
        ],
        limit: 20,
      });
  
      res.json(games);
    } catch (error) {
      console.error('Erreur lors de la récupération des jeux populaires:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des jeux populaires' });
    }
  };
  

const getRecentlyReleasedGames = async (req, res) => {
  try {
    const games = await Game.findAll({
      where: {
        release_date: { [Sequelize.Op.lte]: new Date() },
      },
      order: [['release_date', 'DESC']],
      limit: 20,
    });

    res.json(games);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des jeux récemment sortis:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des jeux récemment sortis' });
  }
};

const getRecentlyAddedGames = async (req, res) => {
  try {
    const games = await Game.findAll({
      order: [['created_at', 'DESC']],
      limit: 20,
    });

    res.json(games);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des jeux récemment ajoutés:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des jeux récemment ajoutés' });
  }
};

const getGameDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const game = await Game.findByPk(id, {
      include: [{
        model: Review,
        as: 'GameReviews',
        attributes: ['review_id', 'user_id', 'rating', 'review_text', 'created_at'],
        where: { resource_type: 'game' },
        required: false,
      }],
    });

    if (!game) {
      return res.status(404).json({ message: 'Jeu non trouvé' });
    }

    res.json(game);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails du jeu:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails du jeu' });
  }
};

export { getPopularGames, getRecentlyReleasedGames, getRecentlyAddedGames, getGameDetails };
