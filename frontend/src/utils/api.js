const API_BASE_URL = "http://localhost:5000/api";

export const bookService = {
  getPopularBooks: () => fetch(`${API_BASE_URL}/books/popular`).then(res => res.json()),
  getBookDetails: (id) => fetch(`${API_BASE_URL}/books/${id}`).then(res => res.json()),
};

export const gameService = {
  getPopularGames: () => fetch(`${API_BASE_URL}/games/popular`).then(res => res.json()),
  getGameDetails: (id) => fetch(`${API_BASE_URL}/games/${id}`).then(res => res.json()),
};

export const musicService = {
  getPopularArtists: () => fetch(`${API_BASE_URL}/music/artists/popular`).then(res => res.json()),
  getPopularAlbums: () => fetch(`${API_BASE_URL}/music/albums/popular`).then(res => res.json()),
  getPopularTracks: () => fetch(`${API_BASE_URL}/music/tracks/popular`).then(res => res.json()),
  getArtistDetails: (id) => fetch(`${API_BASE_URL}/music/artists/${id}`).then(res => res.json()),
  getAlbumDetails: (id) => fetch(`${API_BASE_URL}/music/albums/${id}`).then(res => res.json()),
  getTrackDetails: (id) => fetch(`${API_BASE_URL}/music/tracks/${id}`).then(res => res.json()),
};

export const filmService = {
  getPopularFilms: () => fetch(`${API_BASE_URL}/films/popular`).then(res => res.json()),
  getFilmDetails: (id) => fetch(`${API_BASE_URL}/films/${id}`).then(res => res.json()),
};
