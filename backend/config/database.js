import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Mock pool for when PostgreSQL is not available
const mockPool = {
  query: async () => ({ rows: [] }),
};

let sequelize = null;
let pgPool = null;

try {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      port: process.env.DB_PORT,
      logging: false,
    }
  );

  // Create PostgreSQL pool for direct queries
  pgPool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  console.log('✅ PostgreSQL connection configured successfully');
} catch (error) {
  console.warn('⚠️ PostgreSQL connection not configured:', error.message);
}

// Use the real pool if available, otherwise use mock
const pool = pgPool || mockPool;

export { sequelize as default, pool };
