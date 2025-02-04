import sequelize from '../config/database.js';
import Film from './Film.js';
import Review from './Review.js';
import User from './User.js';
import Book from './Book.js';
import Game from './Game.js';
import Artist from './Artist.js';
import Album from './Album.js';
import Track from './Track.js';

// 🔹 Relation avec `User`
Review.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
User.hasMany(Review, { foreignKey: 'user_id' });

// 🔹 Relation Générique : `resource_id` est une clé étrangère vers différentes tables
Review.belongsTo(Film, { foreignKey: 'resource_id', targetKey: 'resource_id', as: 'ReviewedFilm' });
Review.belongsTo(Book, { foreignKey: 'resource_id', targetKey: 'resource_id', as: 'ReviewedBook' });
Review.belongsTo(Game, { foreignKey: 'resource_id', targetKey: 'resource_id', as: 'ReviewedGame' });
Review.belongsTo(Album, { foreignKey: 'resource_id', targetKey: 'resource_id', as: 'ReviewedAlbum' });
Review.belongsTo(Artist, { foreignKey: 'resource_id', targetKey: 'resource_id', as: 'ReviewedArtist' });
Review.belongsTo(Track, { foreignKey: 'resource_id', targetKey: 'resource_id', as: 'ReviewedTrack' });

export {
  sequelize,
  Film,
  Review,
  Book,
  Game,
  User,
  Artist,
  Album,
  Track
};
