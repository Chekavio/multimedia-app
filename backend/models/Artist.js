import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Artist = sequelize.define('Artist', {
    artist_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    spotify_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: true },
    genres: { type: DataTypes.ARRAY(DataTypes.STRING(255)), allowNull: true },
    label: { type: DataTypes.STRING, allowNull: true }, // ✅ Correction du label
    artist_type: { type: DataTypes.ENUM('solo', 'band'), allowNull: false }, // ✅ solo ou band
    formed_date: { type: DataTypes.DATE, allowNull: true }, // ✅ Uniquement pour les groupes
    disband_date: { type: DataTypes.DATE, allowNull: true }, // ✅ Uniquement pour les groupes
    origin: { type: DataTypes.STRING, allowNull: true },
    average_rate: { type: DataTypes.NUMERIC(3, 2), defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'artists', timestamps: false });

export default Artist;
