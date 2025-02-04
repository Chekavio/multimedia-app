import { Film, Review, User } from '../models/index.js';
import Sequelize from 'sequelize';


const getPopularFilms = async (req, res) => {
  console.log("📌 Requête reçue sur /api/films/popular");

  try {
    console.log("🔍 Exécution de la requête Sequelize...");

    // Ajout d'un log pour voir la requête SQL générée par Sequelize
    console.log("🛠 Requête Sequelize en cours...");
    
    const films = await Film.findAll({
      attributes: [
        'film_id',
        'tmdb_id',
        'title',
        'release_date',
        'director',
        'genres',
        'description',
        'poster_url',
        'duration',
        'average_rate',
        'casting',
        'created_at'
      ],
      order: [['average_rate', 'DESC NULLS LAST'], ['release_date', 'DESC']],
      limit: 20,
      raw: true, // Voir la structure brute
    });

    console.log("✅ Requête Sequelize exécutée avec succès !");
    console.log("📜 Films récupérés :", films.length);
    console.log("🧐 Données complètes des films :", JSON.stringify(films, null, 2));

    res.json(films);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des films populaires :", error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des films populaires', 
      error: error.message 
    });
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
          include: [
            {
              model: User,  // ✅ Jointure avec User
              as: 'User',   // ✅ Doit correspondre EXACTEMENT à l'alias dans `index.js`
              attributes: ['username', 'profile_picture']
            }
          ]
        }
      ],
    });

    if (!film) return res.status(404).json({ message: 'Film non trouvé' });

    res.json(film);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails du film:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails du film' });
  }
};

export { getPopularFilms, getFilmDetails };
