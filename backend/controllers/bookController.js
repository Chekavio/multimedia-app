import { Book, Review } from '../models/index.js';
import Sequelize from 'sequelize';

// 📌 1. Récupérer les livres les plus populaires (basé sur la moyenne des notes des reviews)
const getPopularBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      attributes: [
        'book_id',
        'title',
        'authors',
        'published_date',
        'publisher',
        'genres',
        'cover_url',
        'description',
        'page_count',
        'language',
        'created_at',
        [Sequelize.literal(`(
          SELECT AVG("reviews"."rating")
          FROM "reviews"
          WHERE "reviews"."resource_id" = "Book"."book_id"
          AND "reviews"."resource_type" = 'book'
        )`), 'averageRating'],
        [Sequelize.literal(`(
          SELECT COUNT("reviews"."review_id")
          FROM "reviews"
          WHERE "reviews"."resource_id" = "Book"."book_id"
          AND "reviews"."resource_type" = 'book'
        )`), 'reviewCount'],
      ],
      order: [
        [
          Sequelize.literal(`(
            SELECT AVG("reviews"."rating")
            FROM "reviews"
            WHERE "reviews"."resource_id" = "Book"."book_id"
            AND "reviews"."resource_type" = 'book'
          )`),
          'DESC NULLS LAST',
        ],
        ['published_date', 'DESC'],
      ],
      limit: 20,
    });

    res.json(books);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des livres populaires:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres populaires' });
  }
};

// 📌 2. Récupérer les livres récemment publiés
const getRecentlyPublishedBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: {
        published_date: {
          [Sequelize.Op.lte]: new Date(),
        },
      },
      order: [['published_date', 'DESC']],
      limit: 20,
    });

    res.json(books);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des livres récemment publiés:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres récemment publiés' });
  }
};

// 📌 3. Récupérer les livres récemment ajoutés dans la BDD
const getRecentlyAddedBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [['created_at', 'DESC']],
      limit: 20,
    });

    res.json(books);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des livres récemment ajoutés:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres récemment ajoutés' });
  }
};

// 📌 4. Récupérer les détails d'un livre spécifique
const getBookDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findByPk(id, {
      include: [
        {
          model: Review,
          as: 'BookReviews',
          attributes: ['review_id', 'user_id', 'rating', 'review_text', 'created_at'],
          where: { resource_type: 'book' },
          required: false,
        },
      ],
    });

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    res.json(book);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails du livre:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails du livre' });
  }
};

// 🔹 Exporter toutes les fonctions
export { getPopularBooks, getRecentlyPublishedBooks, getRecentlyAddedBooks, getBookDetails };
