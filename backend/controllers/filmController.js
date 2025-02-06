import Film from '../models/Film.js';
import Review from '../models/Review.js';
import sequelize, { pool } from '../config/database.js';

// Get popular films
export const getPopularFilms = async (req, res) => {
  try {
    console.log('🎬 Fetching popular films...');
    const films = await Film.find()
      .sort({ average_rate: -1 })
      .limit(20)
      .select('resource_id title poster_url release_date average_rate')
      .lean();

    if (!films || films.length === 0) {
      console.log('⚠️ No films found in database');
      return res.status(200).json([]);
    }

    console.log(`✅ Found ${films.length} popular films`);
    res.status(200).json(films);
  } catch (error) {
    console.error('❌ Error fetching popular films:', error);
    res.status(500).json({ 
      error: 'Failed to fetch popular films.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get film details by ID
export const getFilmDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching details for film ID:', id);

    const film = await Film.findOne({ resource_id: id }).lean();
    
    if (!film) {
      console.log('❌ Film not found with ID:', id);
      return res.status(404).json({ error: 'Film not found.' });
    }

    // Get reviews for this film from MongoDB
    const reviews = await Review.find({ 
      resource_id: film.resource_id,
      resource_type: 'film'
    })
    .sort({ created_at: -1 })
    .limit(10)
    .lean();

    console.log(`✅ Found ${reviews.length} reviews for film`);

    // Get usernames from PostgreSQL for the reviews
    const userIds = reviews.map(review => review.user_id);
    if (userIds.length > 0) {
      try {
        const userQuery = 'SELECT user_id, username, profile_picture FROM users WHERE user_id = ANY($1)';
        const { rows: users } = await pool.query(userQuery, [userIds]);
        console.log('👥 Found users:', users);

        // Map usernames and profile pictures to reviews
        const reviewsWithUserInfo = reviews.map(review => {
          const user = users.find(u => u.user_id === review.user_id);
          return {
            ...review,
            username: user ? user.username : 'Anonymous',
            profile_picture: user ? user.profile_picture : null
          };
        });

        // Add reviews to film object
        const filmWithReviews = {
          ...film,
          reviews: reviewsWithUserInfo
        };

        console.log('✅ Sending film with reviews and user info');
        return res.status(200).json(filmWithReviews);
      } catch (pgError) {
        console.error('❌ PostgreSQL error:', pgError.message);
        // If PostgreSQL fails, return reviews without usernames
        const filmWithReviews = {
          ...film,
          reviews: reviews.map(review => ({
            ...review,
            username: 'Anonymous',
            profile_picture: null
          }))
        };
        return res.status(200).json(filmWithReviews);
      }
    } else {
      // No reviews, return film without reviews array
      console.log('ℹ️ No reviews found, sending film without reviews');
      return res.status(200).json({
        ...film,
        reviews: []
      });
    }
  } catch (error) {
    console.error('❌ Error fetching film details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch film details.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search films
export const searchFilms = async (req, res) => {
  const { query } = req.query;
  try {
    const films = await Film.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    });
    res.status(200).json(films);
  } catch (error) {
    console.error('Error searching films:', error);
    res.status(500).json({ message: 'Error searching films' });
  }
};

// Add new review
export const addReview = async (req, res) => {
  try {
    const { user_id, rating, review_text } = req.body;
    const resource_id = req.params.id;

    console.log('📝 Adding review for film ID:', resource_id);

    // Verify film exists
    const film = await Film.findOne({ resource_id }).lean();
    if (!film) {
      console.log('❌ Film not found with ID:', resource_id);
      return res.status(404).json({ error: 'Film not found.' });
    }

    try {
      // Verify user exists in PostgreSQL
      const userQuery = 'SELECT user_id, username FROM users WHERE user_id = $1';
      const { rows } = await pool.query(userQuery, [user_id]);
      if (rows.length === 0) {
        console.log('❌ User not found with ID:', user_id);
        return res.status(404).json({ error: 'User not found.' });
      }

      // Create review in MongoDB
      const newReview = new Review({
        user_id,
        resource_id: film.resource_id,
        resource_type: 'film',
        rating,
        review_text,
        created_at: new Date()
      });
      await newReview.save();

      console.log('✅ Review added successfully for film ID:', resource_id);

      const reviewWithUsername = {
        ...newReview.toObject(),
        username: rows[0].username
      };

      res.status(201).json(reviewWithUsername);
    } catch (pgError) {
      console.error('❌ PostgreSQL error:', pgError.message);
      // If PostgreSQL is not available, create review with anonymous user
      const newReview = new Review({
        user_id: -1,
        resource_id: film.resource_id,
        resource_type: 'film',
        rating,
        review_text,
        created_at: new Date()
      });
      await newReview.save();

      console.log('✅ Anonymous review added successfully for film ID:', resource_id);

      const reviewWithUsername = {
        ...newReview.toObject(),
        username: 'Anonymous'
      };

      res.status(201).json(reviewWithUsername);
    }
  } catch (error) {
    console.error('❌ Error adding review:', error);
    res.status(400).json({ 
      error: 'Failed to add review.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
