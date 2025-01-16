const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const filmService = {
  async getPopularFilms() {
    try {
      const response = await fetch(`${API_BASE_URL}/films/popular`);
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des films populaires:', error);
      return [];
    }
  },
  async getRecentlyReleasedFilms() {
    try {
      const response = await fetch(`${API_BASE_URL}/films/recently-released`);
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des films récemment sortis:', error);
      return [];
    }
  },
  async getRecentlyAddedFilms() {
    try {
      const response = await fetch(`${API_BASE_URL}/films/recently-added`);
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des films récemment ajoutés:', error);
      return [];
    }
  },
  async getFilmDetails(filmId) {
    try {
      const response = await fetch(`${API_BASE_URL}/films/${filmId}`);
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du film:', error);
      throw error;
    }
  },
};
