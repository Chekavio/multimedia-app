import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectMongoDB from './config/mongodb.js';
import sequelize from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import filmRoutes from './routes/filmRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/users', userRoutes);  // All routes in userRoutes will be prefixed with /api/users
app.use('/api/films', filmRoutes);  // All routes in filmRoutes will be prefixed with /api/films

// Database Connections
const startServer = async () => {
  try {
    // Try to connect to PostgreSQL but don't fail if it's not available
    try {
      await sequelize.authenticate();
      console.log('✅ Connected to PostgreSQL.');
    } catch (pgError) {
      console.warn('⚠️ PostgreSQL connection failed:', pgError.message);
      console.log('⚠️ Continuing without PostgreSQL...');
    }

    // MongoDB connection is required
    await connectMongoDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
};

startServer();
