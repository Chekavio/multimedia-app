import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Artist from './Artist.js';

const Album = sequelize.define('Album', {
    album_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    spotify_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    artist_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: Artist, key: 'artist_id' } 
    },
    release_date: { type: DataTypes.DATE, allowNull: true },
    cover_url: { type: DataTypes.STRING, allowNull: true },
    duration: { type: DataTypes.INTEGER, allowNull: true },
    number_of_tracks: { type: DataTypes.INTEGER, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    label: { type: DataTypes.STRING, allowNull: true },
    explicit_lyrics: { type: DataTypes.BOOLEAN, defaultValue: false },
    genres: { type: DataTypes.ARRAY(DataTypes.STRING(255)), allowNull: true }, // ✅ Correction
    styles: { type: DataTypes.ARRAY(DataTypes.STRING(255)), allowNull: true }, // ✅ Correction
    record_type: { type: DataTypes.STRING, allowNull: true },
    average_rate: { type: DataTypes.NUMERIC(3, 2), defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'albums', timestamps: false });

export default Album;
