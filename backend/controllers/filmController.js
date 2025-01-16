import { Film, Review } from '../models/index.js';
import Sequelize from 'sequelize';

const getPopularFilms = async (req, res) => {
  try {
    const films = await Film.findAll({
      attributes: [
        'film_id',
        'title',
        'release_date',
        'director',
        'casting',
        'genres',
        'description',
        'poster_url',
        'duration',
        'created_at',
        [Sequelize.literal(`(
          SELECT AVG("reviews"."rating")
          FROM "reviews"
          WHERE "reviews"."resource_id" = "Film"."film_id"
          AND "reviews"."resource_type" = 'film'
        )`), 'averageRating'],
        [Sequelize.literal(`(
          SELECT COUNT("reviews"."review_id")
          FROM "reviews"
          WHERE "reviews"."resource_id" = "Film"."film_id"
          AND "reviews"."resource_type" = 'film'
        )`), 'reviewCount'],
      ],
      order: [
        [
          Sequelize.literal(`(
            SELECT AVG("reviews"."rating")
            FROM "reviews"
            WHERE "reviews"."resource_id" = "Film"."film_id"
            AND "reviews"."resource_type" = 'film'
          )`),
          'DESC NULLS LAST',
        ],
        ['release_date', 'DESC'],
      ],
      limit: 20,
    });

    res.json(films);
  } catch (error) {
    console.error('Erreur lors de la récupération des films populaires:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des films populaires' });
  }
};

const getRecentlyReleasedFilms = async (req, res) => {
  try {
    const films = await Film.findAll({
      where: {
        release_date: {
          [Sequelize.Op.lte]: new Date(),
        },
      },
      order: [['release_date', 'DESC']],
      limit: 20,
    });

    res.json(films);
  } catch (error) {
    console.error('Erreur lors de la récupération des films récemment sortis:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des films récemment sortis' });
  }
};

const getRecentlyAddedFilms = async (req, res) => {
  try {
    const films = await Film.findAll({
      order: [['created_at', 'DESC']],
      limit: 20,
    });

    res.json(films);
  } catch (error) {
    console.error('Erreur lors de la récupération des films récemment ajoutés:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des films récemment ajoutés' });
  }
};

const getFilmDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const film = await Film.findByPk(id, {
      include: [
        {
          model: Review,
          as: 'FilmReviews',
          attributes: ['review_id', 'user_id', 'rating', 'review_text', 'created_at'],
          where: { resource_type: 'film' },
          required: false,
        },
      ],
    });

    if (!film) {
      return res.status(404).json({ message: 'Film non trouvé' });
    }

    res.json(film);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du film:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails du film' });
  }
};

// 🔹 Exporter toutes les fonctions correctement
export { getPopularFilms, getRecentlyReleasedFilms, getRecentlyAddedFilms, getFilmDetails };
