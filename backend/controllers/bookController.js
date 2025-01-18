import { Book, Review } from '../models/index.js';

const getPopularBooks = async (req, res) => {
  console.log("📚 Requête reçue sur /api/books/popular !");

  try {
    console.log("🛠 Exécution de la requête Sequelize...");

    const books = await Book.findAll({
      attributes: [
        'book_id',
        'google_books_id',
        'title',
        'authors',
        'published_date',
        'description',
        'page_count',
        'language',
        'publisher',
        'genres',
        'cover_url',
        'average_rate',
        'created_at'
      ],
      order: [['average_rate', 'DESC NULLS LAST'], ['published_date', 'DESC']],
      limit: 20,
    });

    console.log("✅ Livres récupérés avec succès !");
    console.log("📜 Nombre de livres retournés :", books.length);

    res.json(books);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des livres populaires :", error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des livres populaires', 
      error: error.message 
    });
  }
};


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

    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

    res.json(book);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du livre:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails du livre' });
  }
};

export { getPopularBooks, getBookDetails };
