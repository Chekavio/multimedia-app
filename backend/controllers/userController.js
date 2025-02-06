import User from '../models/User.js';
import Review from '../models/Review.js';
import bcrypt from 'bcrypt';

// ✅ Create a new user
// ✅ Create a new user
export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ✅ 1. Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // ✅ 2. Save the user with the hashed password
    const newUser = await User.create({
      username,
      email,
      password_hash,  // Storing the hashed password
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: 'Failed to create user.' });
  }
};

// ✅ Create a review linked to a user and resource
// ✅ Add a review linked to a user
export const createReview = async (req, res) => {
  try {
    const { user_id, resource_id, resource_type, rating, review_text } = req.body;

    // 🔍 Ensure the user exists in PostgreSQL
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // ✅ Create the review in MongoDB
    const newReview = new Review({
      user_id,
      resource_id,
      resource_type,
      rating,
      review_text,
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({ error: 'Failed to create review.' });
  }
};
