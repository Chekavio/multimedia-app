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
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  resource_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.NUMERIC(2, 1),
    allowNull: false,
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
});

export default Review;
