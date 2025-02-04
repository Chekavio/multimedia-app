import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
  review_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  resource_type: {
    type: DataTypes.ENUM('track', 'album', 'artist', 'film', 'book', 'game'),
    allowNull: false,
  },
  resource_id: { 
    type: DataTypes.UUID, // ✅ Doit correspondre aux UUID des autres tables
    allowNull: false,
  },
  rating: {
    type: DataTypes.NUMERIC(2, 1),
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'reviews',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'resource_id', 'resource_type']
    }
  ]
});

export default Review;
