import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Film = sequelize.define('Film', {
  film_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  release_date: { type: DataTypes.DATE, allowNull: true },
  director: { type: DataTypes.STRING, allowNull: true },
  genres: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  poster_url: { type: DataTypes.STRING, allowNull: true },
  duration: { type: DataTypes.INTEGER, allowNull: true },
  average_rate: { type: DataTypes.NUMERIC(3, 2), defaultValue: 0 },
  casting: { type: DataTypes.TEXT, allowNull: true }, // ✅ AJOUT DE CASTING
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'films', timestamps: false });

export default Film;
