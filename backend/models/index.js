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
Review.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Review, { foreignKey: 'user_id' });

// 🔹 Relations entre `Film`, `Book` et `Game`
Film.hasMany(Review, {
  foreignKey: 'resource_id',
  as: 'FilmReviews',
  scope: { resource_type: 'film' }
});
Review.belongsTo(Film, {
  foreignKey: 'resource_id',
  as: 'ReviewedFilm'
});

Book.hasMany(Review, {
  foreignKey: 'resource_id',
  as: 'BookReviews',
  scope: { resource_type: 'book' }
});
Review.belongsTo(Book, {
  foreignKey: 'resource_id',
  as: 'ReviewedBook'
});

Game.hasMany(Review, {
  foreignKey: 'resource_id',
  as: 'GameReviews',
  scope: { resource_type: 'game' }
});
Review.belongsTo(Game, {
  foreignKey: 'resource_id',
  as: 'ReviewedGame'
});

// 🔹 Relations entre `Artist`, `Album`, `Track`
Artist.hasMany(Album, { foreignKey: 'artist_id' });
Album.belongsTo(Artist, { foreignKey: 'artist_id' });

Album.hasMany(Track, { foreignKey: 'album_id' });
Track.belongsTo(Album, { foreignKey: 'album_id' });

Track.belongsTo(Artist, { foreignKey: 'artist_id' });
Artist.hasMany(Track, { foreignKey: 'artist_id' });

// 🔹 Ajout des relations entre `Review` et `Track`, `Album`, `Artist`
Track.hasMany(Review, {
  foreignKey: 'resource_id',
  as: 'TrackReviews',
  scope: { resource_type: 'track' }
});
Review.belongsTo(Track, {
  foreignKey: 'resource_id',
  as: 'ReviewedTrack'
});

Album.hasMany(Review, {
  foreignKey: 'resource_id',
  as: 'AlbumReviews',
  scope: { resource_type: 'album' }
});
Review.belongsTo(Album, {
  foreignKey: 'resource_id',
  as: 'ReviewedAlbum'
});

Artist.hasMany(Review, {
  foreignKey: 'resource_id',
  as: 'ArtistReviews',
  scope: { resource_type: 'artist' }
});
Review.belongsTo(Artist, {
  foreignKey: 'resource_id',
  as: 'ReviewedArtist'
});

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
