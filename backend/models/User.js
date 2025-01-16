import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_picture: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

// Ajouter les relations ici
User.associate = (models) => {
  // Exemple : un utilisateur peut créer plusieurs reviews
  // User.hasMany(models.Review, { foreignKey: 'user_id' });
};

export default User;
