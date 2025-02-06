import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediadb';
    
    // Configuration de la connexion MongoDB
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(uri, options);
    console.log('✅ Connected to MongoDB at:', uri);

    // Écouter les événements de connexion
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('⚠️ Make sure MongoDB is running and MONGODB_URI is correctly set in .env');
    console.error('⚠️ Default URI is: mongodb://localhost:27017/mediadb');
    process.exit(1);
  }
};

export default connectMongoDB;
