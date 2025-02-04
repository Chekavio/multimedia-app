import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Film = sequelize.define('Film', {
  film_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  resource_id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, // ✅ Génère un UUID automatiquement
    allowNull: false, 
    unique: true 
  },
  tmdb_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    unique: true 
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  release_date: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  director: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  genres: { 
    type: DataTypes.ARRAY(DataTypes.STRING), // ✅ Stockage optimisé en ARRAY
    allowNull: true 
  },
  description: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  poster_url: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  duration: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  average_rate: { 
    type: DataTypes.NUMERIC(3, 2), 
    defaultValue: 0 
  },
  casting: { 
    type: DataTypes.ARRAY(DataTypes.STRING), // ✅ Converti en ARRAY pour stocker jusqu'à 20 acteurs
    allowNull: true 
  },
  created_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, { 
  tableName: 'films', 
  timestamps: false 
});

export default Film;
