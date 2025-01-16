import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 🔹 Définition de `__dirname`
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔹 Charger `.env`
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 🔹 Vérifier `DB_PASSWORD`
console.log("🔍 DB_PASSWORD dans database.js :", typeof process.env.DB_PASSWORD, `"${process.env.DB_PASSWORD}"`);

// 🔹 Forcer `DB_PASSWORD` en string
const password = process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : '';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  password,  // Utilisation du mot de passe correctement typé
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false,
  }
);

export default sequelize;
