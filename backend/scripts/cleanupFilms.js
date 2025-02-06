import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Film from '../models/Film.js';

dotenv.config();

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const cleanFilms = async () => {
  try {
    await connectMongoDB();

    console.log('🔍 Fixing films...');

    const films = await Film.find({});

    for (const film of films) {
      // ✅ 1. Clean the casting array (remove unwanted characters)
      film.casting = film.casting.map(name => name.replace(/(^"|"}$)/g, '').trim());

      // ✅ 2. Replace `_id` with `resource_id` as the primary key
      await Film.collection.deleteOne({ _id: film._id }); // Remove the old document
      film._id = film.resource_id;                        // Set `resource_id` as `_id`
      delete film.resource_id;                           // Remove the redundant `resource_id`

      await Film.collection.insertOne(film);             // Insert the cleaned document
    }

    console.log(`✅ Cleaned and updated ${films.length} films.`);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Closed MongoDB connection.');
  }
};

cleanFilms();
