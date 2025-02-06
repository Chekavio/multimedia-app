import Constants from 'expo-constants';

// En développement, utilisez l'URL de votre machine
// Pour Expo Go, vous devez utiliser une URL accessible depuis l'extérieur
const DEV_API_URL = 'http://192.168.31.2:5000/api';
const EXPO_API_URL = 'http://192.168.31.2:5000/api'; // À remplacer par votre URL Expo

const API_BASE_URL = Constants.manifest.extra.apiUrl || DEV_API_URL;

console.log('Using API URL:', API_BASE_URL); // Pour le debug

export const filmService = {
  async getPopularFilms() {
    try {
      console.log('Fetching popular films from:', `${API_BASE_URL}/films/popular`);
      const response = await fetch(`${API_BASE_URL}/films/popular`);
      if (!response.ok) throw new Error('Failed to fetch popular films');
      const data = await response.json();
      console.log('Received data:', data);
      return data;
    } catch (error) {
      console.error('Network error:', error);
      throw new Error(`Network error - ${error.message}`);
    }
  },

  async searchFilms(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/films/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search films');
      return response.json();
    } catch (error) {
      console.error('Network error:', error);
      throw new Error(`Network error - ${error.message}`);
    }
  },

  async getFilmDetails(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/films/${id}`);
      if (!response.ok) throw new Error('Failed to fetch film details');
      return response.json();
    } catch (error) {
      console.error('Network error:', error);
      throw new Error(`Network error - ${error.message}`);
    }
  },

  async addReview(filmId, review) {
    try {
      const response = await fetch(`${API_BASE_URL}/films/${filmId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });
      if (!response.ok) throw new Error('Failed to add review');
      return response.json();
    } catch (error) {
      console.error('Network error:', error);
      throw new Error(`Network error - ${error.message}`);
    }
  }
};
