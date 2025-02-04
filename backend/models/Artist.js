import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Artist = sequelize.define('Artist', {
    artist_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    resource_id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        allowNull: false, 
        unique: true 
    },
    spotify_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: true },
    genres: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
    label: { type: DataTypes.STRING, allowNull: true },
    artist_type: { type: DataTypes.ENUM('solo', 'band'), allowNull: false },
    formed_date: { type: DataTypes.DATE, allowNull: true },
    disband_date: { type: DataTypes.DATE, allowNull: true },
    origin: { type: DataTypes.STRING, allowNull: true },
    average_rate: { type: DataTypes.NUMERIC(3, 2), defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'artists', timestamps: false });

export default Artist;
