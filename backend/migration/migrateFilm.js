import pg from 'pg';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Film from '../models/Film.js';

// ✅ Load environment variables from the parent directory
dotenv.config({ path: path.resolve('../.env') });

// PostgreSQL connection setup
const { Client } = pg;

// ✅ Force password to be a string & trim unnecessary spaces
const password = process.env.DB_PASSWORD?.trim() || '';
console.log('🔑 PostgreSQL Password:', `"${password}"`, typeof password); // Debugging password

const pgClient = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: password,
  port: process.env.DB_PORT,
});

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mediaDB');
    console.log('✅ Connected to MongoDB.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration Function
const migrateFilms = async () => {
  try {
    console.log('🚀 Connecting to PostgreSQL...');
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL.');

    await connectMongoDB();

    console.log('🔍 Fetching films from PostgreSQL...');
    const result = await pgClient.query('SELECT * FROM films');

    if (result.rows.length === 0) {
      console.log('⚠️ No films found in PostgreSQL.');
      return;
    }

    const films = result.rows.map(film => ({
      resource_id: film.resource_id,
      tmdb_id: film.tmdb_id,
      title: film.title,
      release_date: film.release_date,
      director: film.director,
      genres: film.genres,
      description: film.description,
      poster_url: film.poster_url,
      duration: film.duration,
      average_rate: film.average_rate,
      casting: film.casting,
      created_at: film.created_at,
    }));

    console.log(`📦 Migrating ${films.length} films to MongoDB...`);
    await Film.insertMany(films);
    console.log('✅ Films migrated successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await pgClient.end();
    await mongoose.connection.close();
    console.log('🔌 Closed connections to PostgreSQL and MongoDB.');
  }
};

migrateFilms();
