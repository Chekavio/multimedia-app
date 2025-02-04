import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Game = sequelize.define('Game', {
  game_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  resource_id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    allowNull: false, 
    unique: true 
  },
  igdb_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  release_date: { type: DataTypes.DATE, allowNull: true },
  publisher: { type: DataTypes.STRING, allowNull: true }, // Peut contenir plusieurs éditeurs
  genres: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  platforms: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  cover_url: { type: DataTypes.STRING, allowNull: true },
  average_rate: { type: DataTypes.NUMERIC(3, 2), defaultValue: 0 },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'games', timestamps: false });

export default Game;
