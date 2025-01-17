import sequelize from '../config/database.js';
import Film from './Film.js';
import Review from './Review.js';
import User from './User.js';
import Book from './Book.js';  // ✅ Ajout du modèle Book
import Game from './Game.js';

// Définir les relations une seule fois
Film.hasMany(Review, {
  foreignKey: 'resource_id',
  as: 'FilmReviews', // Utilisez un alias unique
  scope: { resource_type: 'film' },
});

Review.belongsTo(Film, {
  foreignKey: 'resource_id',
  as: 'Film',
});

Book.hasMany(Review, {
  foreignKey: 'resource_id',
  as: 'BookReviews',
  scope: { resource_type: 'book' },
});

Review.belongsTo(Book, {
  foreignKey: 'resource_id',
  as: 'Book',
});

Game.hasMany(Review, {
  foreignKey: 'resource_id',
  as: 'GameReviews',
  scope: { resource_type: 'game' },
});

Review.belongsTo(Game, {
  foreignKey: 'resource_id',
  as: 'Game',
});

export {
  sequelize,
  Film,
  Review,
  Book,
  Game,
  User
};
