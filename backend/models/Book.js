import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Book = sequelize.define('Book', {
  book_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  resource_id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    allowNull: false, 
    unique: true 
  },
  google_books_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  authors: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  published_date: { type: DataTypes.DATE, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  page_count: { type: DataTypes.INTEGER, allowNull: true },
  language: { type: DataTypes.STRING, allowNull: true },
  publisher: { type: DataTypes.STRING, allowNull: true },
  genres: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  cover_url: { type: DataTypes.STRING, allowNull: true },
  average_rate: { type: DataTypes.NUMERIC(3, 2), defaultValue: 0 },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'books', timestamps: false });

export default Book;
