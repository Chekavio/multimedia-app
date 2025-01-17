import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Album from './Album.js';
import Artist from './Artist.js';

const Track = sequelize.define('Track', {
    track_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    spotify_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    album_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,  // ✅ Une track est obligatoirement reliée à un album
        references: { model: Album, key: 'album_id' } 
    },
    artist_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: Artist, key: 'artist_id' } 
    },
    duration: { type: DataTypes.INTEGER, allowNull: true },
    track_number: { type: DataTypes.INTEGER, allowNull: true },
    explicit: { type: DataTypes.BOOLEAN, defaultValue: false },
    average_rate: { type: DataTypes.NUMERIC(3, 2), defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'tracks', timestamps: false });

export default Track;
